import pool from '../database/db.js';

export const getRooms = async (req, res) => {
  try {
    const [rooms] = await pool.execute(`
      SELECT r.*, 
             s.id as shift_id, 
             s.duration_hours,
             s.end_time,
             s.status as shift_status
      FROM rooms r
      LEFT JOIN shifts s ON r.id = s.room_id AND s.status = 'active'
      ORDER BY r.room_number
    `);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};