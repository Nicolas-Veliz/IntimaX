import pool from '../database/db.js';

export const getRooms = async (req, res) => {
  try {
    const [rooms] = await pool.execute(`
      SELECT r.*, 
             s.id as shift_id, 
             s.duration_hours,
             s.end_time,
             s.status as shift_status,
             s.price as shift_price
      FROM rooms r
      LEFT JOIN (
        SELECT s1.*
        FROM shifts s1
        INNER JOIN (
          SELECT room_id, MAX(id) AS latest_shift_id
          FROM shifts
          WHERE status = 'active'
          GROUP BY room_id
        ) latest ON s1.id = latest.latest_shift_id
      ) s ON r.id = s.room_id
      ORDER BY r.room_number
    `);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { room_number, room_type, base_price, extended_price = 0, price_per_extra_hour, status = 'available', cleaning_time_minutes = 20 } = req.body;
    const extraHourPrice = req.user.role === 'admin' ? Number(price_per_extra_hour || 0) : 0;

    const [result] = await pool.execute(
      `INSERT INTO rooms (room_number, room_type, base_price, extended_price, price_per_extra_hour, status, cleaning_time_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [room_number, room_type, base_price, extended_price, extraHourPrice, status, cleaning_time_minutes]
    );

    res.status(201).json({ id: result.insertId, room_number, room_type, base_price, extended_price, price_per_extra_hour: extraHourPrice, status, cleaning_time_minutes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, room_type, base_price, extended_price = 0, price_per_extra_hour, status, cleaning_time_minutes } = req.body;
    let extraHourPrice = Number(price_per_extra_hour || 0);

    if (req.user.role !== 'admin') {
      const [rooms] = await pool.execute('SELECT price_per_extra_hour FROM rooms WHERE id = ?', [id]);
      if (rooms.length === 0) return res.status(404).json({ message: 'Habitación no encontrada' });
      extraHourPrice = rooms[0].price_per_extra_hour;
    }

    await pool.execute(
      `UPDATE rooms
      SET room_number = ?, room_type = ?, base_price = ?, extended_price = ?, price_per_extra_hour = ?, status = ?, cleaning_time_minutes = ?
       WHERE id = ?`,
          [room_number, room_type, base_price, extended_price, extraHourPrice, status, cleaning_time_minutes, id]
    );

    res.json({ message: 'Habitación actualizada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ message: 'Habitación eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};