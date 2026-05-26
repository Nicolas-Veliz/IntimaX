import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', authenticateToken, (req, res) => {
  res.json({ current: {}, daily: null });
});

export default router;