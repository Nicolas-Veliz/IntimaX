import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import roomRoutes from './src/routes/roomRoutes.js';
import shiftRoutes from './src/routes/shiftRoutes.js';
import metricsRoutes from './src/routes/metricsRoutes.js';
import amenityRoutes from './src/routes/amenityRoutes.js';
import { databaseReady } from './src/database/db.js';

dotenv.config();

// Require critical env vars
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET environment variable. Aborting startup.');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
// Security: helmet + restricted CORS with credentials support
app.use(helmet());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan('combined'));
app.use(express.json());
app.use('/api/amenities', amenityRoutes);

// Rate limiting (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/metrics', metricsRoutes);

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

const PORT = process.env.PORT || 3000;
databaseReady.then(() => {
  httpServer.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 IntimaX Server corriendo en puerto ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`⚠️ Asegúrate de configurar variables de entorno: DB_*, JWT_SECRET, ALLOWED_ORIGINS`);
    console.log(`========================================`);
  });
}).catch(() => {
  process.exit(1);
});

export { io };