import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // Prefer cookie token (HttpOnly) but accept Authorization header as fallback
  const tokenFromCookie = req.cookies && req.cookies.token;
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no configurado. Rejecting token verification.');
    return res.status(500).json({ message: 'Server misconfigured' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Se requieren permisos de administrador' });
  }
  next();
};