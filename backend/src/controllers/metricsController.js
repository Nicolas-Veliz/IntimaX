import pool from '../database/db.js';

export const getTodayMetrics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [metrics] = await pool.execute(
      `SELECT 
         COUNT(*) as total_active_shifts,
         COALESCE(SUM(price), 0) as pending_payments,
         (SELECT COUNT(*) FROM rooms WHERE status = 'occupied') as occupied_rooms,
         (SELECT COUNT(*) FROM rooms WHERE status = 'cleaning') as cleaning_rooms,
         (SELECT COUNT(*) FROM rooms WHERE status = 'available') as available_rooms
       FROM shifts 
       WHERE DATE(start_time) = ? AND status IN ('active', 'cleaning')`,
      [today]
    );
    
    const [dailyMetrics] = await pool.execute(
      'SELECT * FROM daily_metrics WHERE date = ?',
      [today]
    );

    let daily = dailyMetrics[0];

    if (!daily) {
      const [computed] = await pool.execute(
        `SELECT
           COALESCE(SUM(price), 0) as total_income,
           COUNT(*) as total_shifts,
           COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN price ELSE 0 END), 0) as cash_income,
           COALESCE(SUM(CASE WHEN payment_method = 'card' THEN price ELSE 0 END), 0) as card_income,
           COALESCE(SUM(CASE WHEN payment_method = 'transfer' THEN price ELSE 0 END), 0) as transfer_income
         FROM shifts
         WHERE DATE(start_time) = ?`,
        [today]
      );
      daily = computed[0] || {
        total_income: 0,
        total_shifts: 0,
        cash_income: 0,
        card_income: 0,
        transfer_income: 0
      };
    }

    res.json({
      current: metrics[0],
      daily
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHourlyStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [stats] = await pool.execute(
      `SELECT 
         HOUR(start_time) as hour,
         COUNT(*) as shifts_count,
         COALESCE(SUM(price), 0) as income
       FROM shifts 
       WHERE DATE(start_time) = ? AND status IN ('completed', 'cleaning')
       GROUP BY HOUR(start_time)
       ORDER BY hour ASC`,
      [today]
    );
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT * FROM daily_metrics';
    const params = [];

    if (start_date || end_date) {
      query += ' WHERE 1=1';
      if (start_date) {
        query += ' AND date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        query += ' AND date <= ?';
        params.push(end_date);
      }
    }

    query += ' ORDER BY date DESC';

    const [report] = await pool.execute(query, params);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoomUsage = async (req, res) => {
  try {
    const [usage] = await pool.execute(
      `SELECT 
         r.room_number,
         r.room_type,
         COUNT(s.id) as total_shifts,
         COALESCE(SUM(s.price), 0) as total_income,
         AVG(TIMESTAMPDIFF(MINUTE, s.start_time, COALESCE(s.actual_end_time, s.end_time))) as avg_duration_minutes
       FROM rooms r
       LEFT JOIN shifts s ON r.id = s.room_id 
         AND s.status IN ('completed', 'cleaning')
         AND DATE(s.start_time) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY r.id
       ORDER BY total_shifts DESC`,
      []
    );
    
    res.json(usage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};