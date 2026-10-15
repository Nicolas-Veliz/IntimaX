import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  isLoginRateLimitDisabled,
  login,
  logout,
  me
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: 'Demasiados intentos. Intente nuevamente en 10 minutos.',
  skip: isLoginRateLimitDisabled
});

router.post('/login', loginLimiter, login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, me);

export default router;