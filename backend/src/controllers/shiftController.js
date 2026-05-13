import pool from '../database/db.js';
import { io } from '../../server.js';
import crypto from 'crypto';

// Generar código único para turno (facturación anónima)
const generateShiftCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Calcular precio basado en duración y tipo de habitación
const calculatePrice = (room, hours, extraHours = 0) => {
  const totalHours = hours + extraHours;
  let price = room.base_price;
  
  if (totalHours > hours) {
    // Si hay horas extra, calcular extra
    price += extraHours * room.price_per_extra_hour;
  }
  
  return price;
};

export const createShift = async (req, res) => {
  try {
    const { room_id, duration_hours } = req.body;
    const user_id = req.user.id;
    
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
    
    const shiftCode = generateShiftCode();
    const price = calculatePrice(room, duration_hours, 0);
    
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
    const extra_price = extra_hours * shift.price_per_extra_hour;
    
    // Actualizar shift
    const newEndTime = new Date(shift.end_time);
    newEndTime.setHours(newEndTime.getHours() + extra_hours);
    
    await pool.execute(
      `UPDATE shifts 
       SET end_time = ?, 
           extended_count = extended_count + 1,
           total_hours = duration_hours + (extended_count + 1) * ?,
           price = price + ?
       WHERE id = ?`,
      [newEndTime, extra_hours, extra_price, id]
    );
    
    // Registrar extensión
    await pool.execute(
      `INSERT INTO shift_extensions (shift_id, extra_hours, extra_price, extended_by) 
       VALUES (?, ?, ?, ?)`,
      [id, extra_hours, extra_price, user_id]
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
    
    await pool.execute(
      'UPDATE shifts SET payment_method = ?, status = "completed", actual_end_time = NOW() WHERE id = ?',
      [payment_method, id]
    );
    
    // Marcar habitación para limpieza
    const [shift] = await pool.execute(
      'SELECT room_id FROM shifts WHERE id = ?',
      [id]
    );
    
    if (shift.length > 0) {
      const cleaningEnd = new Date();
      cleaningEnd.setMinutes(cleaningEnd.getMinutes() + 20); // 20 min de limpieza
      
      await pool.execute(
        `UPDATE shifts SET status = 'cleaning', cleaning_start = NOW(), cleaning_end = ? 
         WHERE id = ?`,
        [cleaningEnd, id]
      );
      
      await pool.execute(
        'UPDATE rooms SET status = "cleaning" WHERE id = ?',
        [shift[0].room_id]
      );
      
      io.to('reception').emit('room_needs_cleaning', { room_id: shift[0].room_id });
    }
    
    res.json({ message: 'Payment registered successfully' });
  } catch (error) {
    console.error('Error registering payment:', error);
    res.status(500).json({ message: error.message });
  }
};

export const markCleaned = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { cleaned_by } = req.body;
    
    await pool.execute(
      `UPDATE shifts 
       SET cleaned_by = ?, status = 'completed' 
       WHERE room_id = ? AND status = 'cleaning'`,
      [cleaned_by, room_id]
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