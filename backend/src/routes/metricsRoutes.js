import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getTodayMetrics, getHourlyStats, getDailyReport, getRoomUsage } from '../controllers/metricsController.js';

const router = express.Router();

router.get('/today', authenticateToken, getTodayMetrics);
router.get('/hourly', authenticateToken, getHourlyStats);
router.get('/daily', authenticateToken, getDailyReport);
router.get('/room-usage', authenticateToken, getRoomUsage);

export default router;