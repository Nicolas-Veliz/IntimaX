// Modificar el login para registrar actividad
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
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
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        last_login: loginTime
      },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
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