import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
app.use('/api/users', userRoutes);

// ============================================
// ENDPOINT DE PRUEBA (agregado)
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.put('/api/shifts/:id/extend', (req, res) => {
  const { id } = req.params;
  const { extra_hours } = req.body;
  res.json({ 
    id: parseInt(id), 
    extra_hours, 
    message: 'Tiempo extendido correctamente' 
  });
});

// ============================================
// DATOS SIMULADOS PARA PRUEBA (mientras creas los controladores)
// ============================================
app.get('/api/rooms', (req, res) => {
  res.json([
    { id: 1, room_number: '101', status: 'available', room_type: 'standard', base_price: 15000, price_per_extra_hour: 5000 },
    { id: 2, room_number: '102', status: 'available', room_type: 'standard', base_price: 15000, price_per_extra_hour: 5000 },
    { id: 3, room_number: '103', status: 'occupied', room_type: 'premium', base_price: 25000, price_per_extra_hour: 8000, end_time: new Date(Date.now() + 7200000) },
    { id: 4, room_number: '104', status: 'cleaning', room_type: 'premium', base_price: 25000, price_per_extra_hour: 8000 },
    { id: 5, room_number: '105', status: 'available', room_type: 'suite', base_price: 40000, price_per_extra_hour: 12000 }
  ]);
});

// ============================================
// LOGIN SIMULADO (mientras creas el controlador)
// ============================================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Usuarios de prueba
  const users = {
    'admin': { id: 1, username: 'admin', full_name: 'Administrador', role: 'admin', password: 'admin123' },
    'recepcion': { id: 2, username: 'recepcion', full_name: 'Juan Pérez', role: 'receptionist', password: 'recep123' }
  };
  
  const user = users[username];
  
  if (user && user.password === password) {
    const token = 'fake-jwt-token-' + Date.now();
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

// ============================================
// TURNOS SIMULADOS (endpoints básicos)
// ============================================
app.post('/api/shifts', (req, res) => {
  const { room_id, duration_hours } = req.body;
  res.json({ 
    id: Date.now(), 
    room_id, 
    duration_hours, 
    status: 'active',
    message: 'Turno iniciado correctamente'
  });
});

app.put('/api/shifts/:id/payment', (req, res) => {
  res.json({ message: 'Pago registrado exitosamente' });
});

app.put('/api/shifts/clean/:room_id', (req, res) => {
  res.json({ message: 'Habitación marcada como limpia' });
});

// ============================================
// MÉTRICAS SIMULADAS
// ============================================
app.get('/api/metrics/today', (req, res) => {
  res.json({
    current: { occupied_rooms: 1, cleaning_rooms: 1, available_rooms: 3, active_shifts: 1 },
    daily: { total_income: 25000, total_shifts: 3, cash_income: 15000, card_income: 10000 }
  });
});

// ============================================
// SOCKET.IO
// ============================================
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);
  
  socket.on('join_reception', () => {
    socket.join('reception');
    console.log('📋 Usuario unido a sala reception');
  });
  
  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 IntimaX Server corriendo en puerto ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Login: admin/admin123 o recepcion/recep123`);
  console.log(`========================================`);
});

export { io };