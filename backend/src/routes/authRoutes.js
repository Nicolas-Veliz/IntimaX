import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 6, message: 'Demasiados intentos, intente más tarde.' });

router.post('/login', loginLimiter, login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, me);

export default router;