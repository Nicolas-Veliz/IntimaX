import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createShift, extendShift, registerPayment, assignCleaner, markCleaned, getCleaningReport, confirmNoShow } from '../controllers/shiftController.js';

const router = express.Router();

router.post('/', authenticateToken, createShift);
router.put('/:id/extend', authenticateToken, extendShift);
router.put('/:id/payment', authenticateToken, registerPayment);
router.put('/:id/cleaner', authenticateToken, assignCleaner);
router.get('/cleaning-report', authenticateToken, getCleaningReport);
router.put('/clean/:room_id', authenticateToken, markCleaned);
router.put('/:id/no-show', authenticateToken, confirmNoShow);

export default router;