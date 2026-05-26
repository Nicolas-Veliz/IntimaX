import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Placeholder - después agregas la implementación completa
router.post('/', authenticateToken, (req, res) => {
  res.json({ message: 'Shift endpoint - implementar después' });
});

export default router;