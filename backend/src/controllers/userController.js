import pool from '../database/db.js';
import bcrypt from 'bcryptjs';

const normalizeRole = (role) => {
  if (role === 'admin' || role === 'supervisor' || role === 'receptionist') {
    return role;
  }
  return 'receptionist';
};

// Obtener todos los usuarios registrados
export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, first_name, last_name, dni, phone, address, shift, role, is_active, 
              created_at, last_login, last_logout
       FROM users
      WHERE is_active = TRUE
       ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear nuevo usuario recepcionista
export const createUser = async (req, res) => {
  try {
    const { 
      username, password, first_name, last_name, dni, 
      phone, address, shift, role 
    } = req.body;
    
    // Verificar si ya existe
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR dni = ?',
      [username, dni]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Usuario o DNI ya existe' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const full_name = `${first_name} ${last_name}`;
    const normalizedRole = normalizeRole(role);
    
    const [result] = await pool.execute(
      `INSERT INTO users 
       (username, password, full_name, first_name, last_name, dni, phone, address, shift, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, full_name, first_name, last_name, dni, phone, address, shift, normalizedRole]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      username, 
      first_name, 
      last_name, 
      dni, 
      shift 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, address, shift, is_active, role } = req.body;
    const normalizedRole = normalizeRole(role);
    
    await pool.execute(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, address = ?, shift = ?, is_active = ?, role = ?
       WHERE id = ?`,
      [first_name, last_name, phone, address, shift, is_active, normalizedRole, id]
    );
    
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Desactivar usuario sin perder su historial de actividad
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'UPDATE users SET is_active = FALSE WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o ya desactivado' });
    }

    res.json({ message: 'Usuario desactivado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Registrar logout
export const registerLogout = async (req, res) => {
  try {
    const userId = req.user.id;
    const loginTime = new Date(req.user.last_login);
    const logoutTime = new Date();
    const sessionDuration = Math.floor((logoutTime - loginTime) / 1000); // segundos
    
    await pool.execute(
      `UPDATE users SET last_logout = ?, session_duration = ? WHERE id = ?`,
      [logoutTime, sessionDuration, userId]
    );
    
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, timestamp, session_duration, ip_address)
       VALUES (?, 'logout', ?, ?, ?)`,
      [userId, logoutTime, sessionDuration, req.ip || 'unknown']
    );
    
    res.json({ message: 'Logout registrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener reporte de actividad
export const getActivityReport = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.dni, u.shift,
        al.action, al.timestamp, al.session_duration,
        DATE(al.timestamp) as date,
        TIME(al.timestamp) as time
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE u.role IN ('admin', 'user', 'receptionist', 'supervisor')
    `;
    const params = [];
    
    if (start_date) {
      query += ` AND DATE(al.timestamp) >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND DATE(al.timestamp) <= ?`;
      params.push(end_date);
    }
    if (user_id) {
      query += ` AND al.user_id = ?`;
      params.push(user_id);
    }
    
    query += ` ORDER BY al.timestamp DESC`;
    
    const [logs] = await pool.execute(query, params);
    
    // Resumen por usuario
    const [summary] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.shift,
        COUNT(CASE WHEN al.action = 'login' THEN 1 END) as total_logins,
        COUNT(CASE WHEN al.action = 'logout' THEN 1 END) as total_logouts,
        AVG(CASE WHEN al.action = 'logout' THEN al.session_duration END) as avg_session_seconds,
        MAX(CASE WHEN al.action = 'login' THEN al.timestamp END) as last_login,
        MAX(CASE WHEN al.action = 'logout' THEN al.timestamp END) as last_logout,
        MAX(al.timestamp) as last_activity
      FROM users u
      LEFT JOIN activity_logs al ON u.id = al.user_id
      WHERE u.role IN ('admin', 'user', 'receptionist', 'supervisor')
      GROUP BY u.id
    `);
    
    res.json({ logs, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};