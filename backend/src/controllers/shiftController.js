import pool from '../database/db.js';
import { io } from '../../server.js';
import crypto from 'crypto';

// Generar código único para turno (facturación anónima)
const generateShiftCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Calcular precio basado en duración y tipo de habitación
const calculatePrice = (room, hours) => {
  const basePrice = Number(room.base_price || 0);

  if (hours === 2) {
    return basePrice;
  }

  const configuredExtendedPrice = Number(room.extended_price || 0);

  if (configuredExtendedPrice > 0) {
    return configuredExtendedPrice;
  }

  const extraHours = Math.ceil(Math.max(0, Number(hours) - 2));
  return basePrice + extraHours * Number(room.price_per_extra_hour || 0);
};

export const createShift = async (req, res) => {
  try {
    const { room_id, duration_hours: requestedDuration = 2 } = req.body;
    const duration_hours = Number(requestedDuration);
    const user_id = req.user.id;
    const currentHour = new Date().getHours();

    if (!Number.isFinite(duration_hours) || duration_hours <= 0) {
      return res.status(400).json({ message: 'Duración de turno inválida' });
    }

    if (duration_hours !== 2 && (currentHour < 22 && currentHour >= 8)) {
      return res.status(403).json({ message: 'El turno extendido solo está disponible entre las 22:00 y las 08:00' });
    }
    
    // Verificar si la habitación está disponible
    const [rooms] = await pool.execute(
      'SELECT * FROM rooms WHERE id = ? AND status = "available"',
      [room_id]
    );
    
    if (rooms.length === 0) {
      return res.status(400).json({ message: 'Room not available' });
    }
    
    const room = rooms[0];
    const end_time = new Date();
    end_time.setHours(end_time.getHours() + duration_hours);

    if (duration_hours !== 2) {
      const extensionLimit = new Date();
      if (currentHour >= 22) {
        extensionLimit.setDate(extensionLimit.getDate() + 1);
      }
      extensionLimit.setHours(8, 0, 0, 0);
      if (end_time > extensionLimit) {
        return res.status(400).json({ message: 'El turno extendido no puede superar las 08:00' });
      }
    }
    
    const shiftCode = generateShiftCode();
    const price = calculatePrice(room, duration_hours);

    if (duration_hours !== 2 && (price === null || price === undefined || Number(price) <= 0)) {
      return res.status(400).json({ message: 'La habitación no tiene precio extendido configurado' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO shifts (room_id, shift_code, duration_hours, end_time, price, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [room_id, shiftCode, duration_hours, end_time, price, user_id]
    );
    
    // Actualizar estado de la habitación
    await pool.execute(
      'UPDATE rooms SET status = "occupied" WHERE id = ?',
      [room_id]
    );
    
    const [newShift] = await pool.execute(`
      SELECT s.*, r.room_number, r.room_type, u.username as created_by_name
      FROM shifts s
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [result.insertId]);
    
    // Emitir evento via Socket.io
    io.to('reception').emit('shift_created', newShift[0]);
    
    res.status(201).json(newShift[0]);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ message: error.message });
  }
};

export const extendShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { extra_hours } = req.body;
    const user_id = req.user.id;

    if (!Number.isFinite(Number(extra_hours)) || Number(extra_hours) <= 0) {
      return res.status(400).json({ message: 'La cantidad de horas extra debe ser mayor a cero' });
    }
    
    // Obtener shift actual
    const [shifts] = await pool.execute(
      `SELECT s.*, r.price_per_extra_hour, r.base_price 
       FROM shifts s 
       JOIN rooms r ON s.room_id = r.id 
       WHERE s.id = ? AND s.status = 'active'`,
      [id]
    );
    
    if (shifts.length === 0) {
      return res.status(404).json({ message: 'Active shift not found' });
    }
    
    const shift = shifts[0];
    const requestedHours = Number(extra_hours);
    const pricePerExtraHour = Number(shift.price_per_extra_hour);
    if (!Number.isFinite(pricePerExtraHour) || pricePerExtraHour <= 0) {
      return res.status(400).json({ message: 'La habitación no tiene precio por hora extra configurado' });
    }

    const newEndTime = new Date(shift.end_time);
    newEndTime.setTime(newEndTime.getTime() + requestedHours * 3600000);

    const extra_price = requestedHours * pricePerExtraHour;
    
    // Actualizar shift
    await pool.execute(
      `UPDATE shifts 
       SET end_time = ?, 
           extended_count = extended_count + 1,
           total_hours = duration_hours + (extended_count + 1) * ?,
           price = price + ?
       WHERE id = ?`,
      [newEndTime, requestedHours, extra_price, id]
    );
    
    // Registrar extensión
    await pool.execute(
      `INSERT INTO shift_extensions (shift_id, extra_hours, extra_price, extended_by) 
       VALUES (?, ?, ?, ?)`,
      [id, requestedHours, extra_price, user_id]
    );
    
    const [updatedShift] = await pool.execute(`
      SELECT s.*, r.room_number 
      FROM shifts s 
      JOIN rooms r ON s.room_id = r.id 
      WHERE s.id = ?
    `, [id]);
    
    io.to('reception').emit('shift_extended', updatedShift[0]);
    
    res.json(updatedShift[0]);
  } catch (error) {
    console.error('Error extending shift:', error);
    res.status(500).json({ message: error.message });
  }
};

export const registerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
    
    const [updatedShift] = await pool.execute(
      'UPDATE shifts SET payment_method = ?, status = "completed", actual_end_time = NOW() WHERE id = ? AND status = "active"',
      [payment_method, id]
    );

    if (updatedShift.affectedRows === 0) {
      return res.status(404).json({ message: 'Turno activo no encontrado' });
    }
    
    // Marcar habitación para limpieza
    const [shift] = await pool.execute(
      `SELECT s.room_id, s.price, s.payment_method, r.room_number, r.room_type
       FROM shifts s
       JOIN rooms r ON r.id = s.room_id
       WHERE s.id = ?`,
      [id]
    );
    
    let cleaningEnd = null;

    if (shift.length > 0) {
      await pool.execute(
        `UPDATE shifts
         SET status = 'cleaning', cleaned_by = NULL, cleaning_start = NOW(),
             cleaning_end = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
         WHERE id = ?`,
        [id]
      );

      const [cleaningWindow] = await pool.execute(
        'SELECT cleaning_end FROM shifts WHERE id = ?',
        [id]
      );
      cleaningEnd = cleaningWindow[0].cleaning_end;
      
      await pool.execute(
        'UPDATE rooms SET status = "cleaning" WHERE id = ?',
        [shift[0].room_id]
      );
      
      io.to('reception').emit('room_needs_cleaning', {
        room_id: shift[0].room_id,
        shift_id: id,
        room_number: shift[0].room_number,
        cleaning_end: cleaningEnd
      });
    }

    res.json({ message: 'Payment registered successfully', shift: { ...shift[0], cleaning_end: cleaningEnd } });
  } catch (error) {
    console.error('Error registering payment:', error);
    res.status(500).json({ message: error.message });
  }
};

export const assignCleaner = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanerId = Number(req.body.cleaner_id);

    if (!Number.isInteger(cleanerId) || cleanerId <= 0) {
      return res.status(400).json({ message: 'Seleccione una empleada de limpieza válida' });
    }

    const [cleaners] = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND role = ? AND is_active = TRUE',
      [cleanerId, 'cleaning']
    );

    if (cleaners.length === 0) {
      return res.status(404).json({ message: 'Empleada de limpieza no encontrada' });
    }

    const [shifts] = await pool.execute(
      'SELECT room_id, cleaned_by FROM shifts WHERE id = ? AND status = ?',
      [id, 'cleaning']
    );

    if (shifts.length === 0) {
      return res.status(409).json({ message: 'El turno ya no está en limpieza' });
    }

    if (shifts[0].cleaned_by) {
      return res.status(409).json({ message: 'La habitación ya tiene una empleada asignada' });
    }

    const [result] = await pool.execute(
      'UPDATE shifts SET cleaned_by = ? WHERE id = ? AND status = ? AND cleaned_by IS NULL',
      [cleanerId, id, 'cleaning']
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({ message: 'La habitación ya tiene una empleada asignada' });
    }

    io.to('reception').emit('cleaner_assigned', {
      room_id: shifts[0].room_id,
      shift_id: id,
      cleaner_id: cleanerId
    });

    res.json({ message: 'Habitación asignada correctamente', cleaner_id: cleanerId });
  } catch (error) {
    console.error('Error assigning cleaner:', error);
    res.status(500).json({ message: error.message });
  }
};

export const markCleaned = async (req, res) => {
  try {
    const { room_id } = req.params;

    const [shifts] = await pool.execute(
      `SELECT id, cleaned_by, cleaning_end <= NOW() AS cleaning_elapsed
       FROM shifts WHERE room_id = ? AND status = ? ORDER BY id DESC LIMIT 1`,
      [room_id, 'cleaning']
    );

    if (shifts.length === 0) {
      return res.status(404).json({ message: 'No hay un turno en limpieza para esta habitación' });
    }

    if (!shifts[0].cleaned_by) {
      return res.status(409).json({ message: 'Asigne una empleada antes de finalizar la limpieza' });
    }

    if (Number(shifts[0].cleaning_elapsed) !== 1) {
      return res.status(409).json({ message: 'La limpieza estará lista al completar los 10 minutos' });
    }
    
    await pool.execute(
      `UPDATE shifts 
        SET status = 'completed', cleaned_at = NOW()
       WHERE id = ?`,
      [shifts[0].id]
    );
    
    await pool.execute(
      'UPDATE rooms SET status = "available" WHERE id = ?',
      [room_id]
    );
    
    // Actualizar métricas diarias
    await updateDailyMetrics();
    
    io.to('reception').emit('room_cleaned', { room_id });
    
    res.json({ message: 'Room cleaned and ready' });
  } catch (error) {
    console.error('Error marking cleaned:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getCleaningReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT
        s.id AS shift_id,
        r.room_number,
        COALESCE(NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), ''), 'Personal eliminado') AS cleaner_name,
        s.cleaning_start,
        s.cleaned_at,
        TIMESTAMPDIFF(SECOND, s.cleaning_start, s.cleaned_at) AS cleaning_duration_seconds
      FROM shifts s
      JOIN rooms r ON r.id = s.room_id
      LEFT JOIN users u ON u.id = s.cleaned_by
      WHERE s.cleaned_by IS NOT NULL AND s.cleaned_at IS NOT NULL
    `;
    const params = [];

    if (start_date) {
      query += ' AND DATE(s.cleaned_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(s.cleaned_at) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY s.cleaned_at DESC';

    const [report] = await pool.execute(query, params);
    res.json(report);
  } catch (error) {
    console.error('Error loading cleaning report:', error);
    res.status(500).json({ message: error.message });
  }
};

export const confirmNoShow = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      `UPDATE shifts 
       SET status = 'no_show', 
           no_show_confirmed = TRUE, 
           actual_end_time = NOW() 
       WHERE id = ? AND status = 'active'`,
      [id]
    );
    
    const [shift] = await pool.execute(
      'SELECT room_id FROM shifts WHERE id = ?',
      [id]
    );
    
    if (shift.length > 0) {
      await pool.execute(
        'UPDATE rooms SET status = "available" WHERE id = ?',
        [shift[0].room_id]
      );
    }
    
    io.to('reception').emit('no_show_confirmed', { shift_id: id });
    
    res.json({ message: 'No-show confirmed, room released' });
  } catch (error) {
    console.error('Error confirming no-show:', error);
    res.status(500).json({ message: error.message });
  }
};

// Función auxiliar para actualizar métricas
async function updateDailyMetrics() {
  const today = new Date().toISOString().split('T')[0];
  
  const [metrics] = await pool.execute(
    `SELECT 
       COUNT(*) as total_shifts,
       COALESCE(SUM(price), 0) as total_income,
       SUM(CASE WHEN payment_method = 'cash' THEN price ELSE 0 END) as cash_income,
       SUM(CASE WHEN payment_method = 'card' THEN price ELSE 0 END) as card_income,
       SUM(CASE WHEN payment_method = 'transfer' THEN price ELSE 0 END) as transfer_income,
       SUM(CASE WHEN extended_count > 0 THEN 1 ELSE 0 END) as extensions_total,
       SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows
     FROM shifts 
     WHERE DATE(start_time) = ? AND status IN ('completed', 'cleaning')`,
    [today]
  );
  
  if (metrics.length > 0) {
    await pool.execute(
      `INSERT INTO daily_metrics 
       (date, total_shifts, total_income, cash_income, card_income, transfer_income, extensions_total, no_shows)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       total_shifts = VALUES(total_shifts),
       total_income = VALUES(total_income),
       cash_income = VALUES(cash_income),
       card_income = VALUES(card_income),
       transfer_income = VALUES(transfer_income),
       extensions_total = VALUES(extensions_total),
       no_shows = VALUES(no_shows)`,
      [today, metrics[0].total_shifts, metrics[0].total_income, metrics[0].cash_income, 
       metrics[0].card_income, metrics[0].transfer_income, metrics[0].extensions_total, metrics[0].no_shows]
    );
  }
}