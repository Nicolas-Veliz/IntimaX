import pool from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// simple in-memory failed attempts tracker (reset on restart)
const failedAttempts = {};
const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Modificar el login para registrar actividad
export const login = async (req, res) => {
  try {
    const usernameInput = String(req.body.username || '').trim();
    const passwordInput = String(req.body.password || '');
    const normalizedUsername = usernameInput;

    // Prevent brute-force per-username
    if (failedAttempts[normalizedUsername] && failedAttempts[normalizedUsername].lockedUntil && Date.now() < failedAttempts[normalizedUsername].lockedUntil) {
      return res.status(429).json({ message: 'Cuenta temporalmente bloqueada. Intente más tarde.' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND is_active = TRUE',
      [normalizedUsername]
    );

    if (users.length === 0) {
      failedAttempts[normalizedUsername] = failedAttempts[normalizedUsername] || { count: 0 };
      failedAttempts[normalizedUsername].count = (failedAttempts[normalizedUsername].count || 0) + 1;
      if (failedAttempts[normalizedUsername].count >= LOCK_THRESHOLD) {
        failedAttempts[normalizedUsername].lockedUntil = Date.now() + LOCK_DURATION_MS;
      }
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];
    let isValidPassword = false;

    if (typeof user.password === 'string' && user.password.startsWith('$2')) {
      isValidPassword = await bcrypt.compare(passwordInput, user.password);
    } else if (typeof user.password === 'string' && user.password.length > 0) {
      isValidPassword = passwordInput === user.password;

      if (isValidPassword) {
        const migratedHash = await bcrypt.hash(passwordInput, 10);
        await pool.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [migratedHash, user.id]
        );
      }
    }

    if (!isValidPassword) {
      failedAttempts[normalizedUsername] = failedAttempts[normalizedUsername] || { count: 0 };
      failedAttempts[normalizedUsername].count = (failedAttempts[normalizedUsername].count || 0) + 1;
      if (failedAttempts[normalizedUsername].count >= LOCK_THRESHOLD) {
        failedAttempts[normalizedUsername].lockedUntil = Date.now() + LOCK_DURATION_MS;
      }
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const loginTime = new Date();
    
    // Actualizar último login
    await pool.execute(
      'UPDATE users SET last_login = ? WHERE id = ?',
      [loginTime, user.id]
    );
    
    // Registrar login en activity_logs
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, timestamp, ip_address)
       VALUES (?, 'login', ?, ?)`,
      [user.id, loginTime, req.ip || 'unknown']
    );
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no configurado. Aborting login.');
      return res.status(500).json({ message: 'Server misconfigured' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Reset failed attempts on success
    if (failedAttempts[normalizedUsername]) delete failedAttempts[normalizedUsername];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        shift: user.shift,
        avatar_color: user.avatar_color || '#e94560'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const logout = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length > 0) {
      const logoutTime = new Date();
      const loginTime = users[0].last_login ? new Date(users[0].last_login) : null;
      const sessionDuration = loginTime && !Number.isNaN(loginTime.getTime())
        ? Math.max(0, Math.floor((logoutTime - loginTime) / 1000))
        : null;

      await pool.execute(
        'UPDATE users SET last_logout = ?, session_duration = ? WHERE id = ?',
        [logoutTime, sessionDuration, req.user.id]
      );

      await pool.execute(
        `INSERT INTO activity_logs (user_id, action, timestamp, session_duration, ip_address)
         VALUES (?, 'logout', ?, ?, ?)`,
        [req.user.id, logoutTime, sessionDuration, req.ip || 'unknown']
      );
    }

    res.clearCookie('token');
    res.json({ message: 'Logout registrado' });
  } catch (error) {
    console.error('Error registrando logout:', error);
    res.status(500).json({ message: 'No se pudo registrar el logout' });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });
    const [users] = await pool.execute('SELECT id, username, full_name, first_name, last_name, role, shift, avatar_color FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ user: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};