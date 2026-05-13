import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import roomRoutes from './src/routes/roomRoutes.js';
import shiftRoutes from './src/routes/shiftRoutes.js';
import metricsRoutes from './src/routes/metricsRoutes.js';
import { checkTimeouts } from './src/utils/timeoutChecker.js';
import { generateDailyReport } from './src/utils/reportGenerator.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/metrics', metricsRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join_reception', () => {
    socket.join('reception');
    console.log('User joined reception room');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Check for timeouts every minute
setInterval(() => {
  checkTimeouts(io);
}, 60000);

// Generate daily report at midnight
const scheduleDailyReport = () => {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0
  );
  const msToMidnight = night.getTime() - now.getTime();
  
  setTimeout(() => {
    generateDailyReport();
    setInterval(generateDailyReport, 24 * 60 * 60 * 1000);
  }, msToMidnight);
};

scheduleDailyReport();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Telo Management System running on port ${PORT}`);
  console.log(`📊 Real-time updates available via Socket.io`);
});

export { io };