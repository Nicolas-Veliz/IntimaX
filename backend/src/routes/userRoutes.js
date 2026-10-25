import express from 'express';
import { 
  getUsers, 
  getCleaningStaff,
  createUser, 
  updateUser, 
  deleteUser, 
  getActivityReport, 
  registerLogout 
} from '../controllers/userController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y ser admin
router.get('/', authenticateToken, authorizeAdmin, getUsers);
router.get('/cleaning-staff', authenticateToken, getCleaningStaff);
router.post('/', authenticateToken, authorizeAdmin, createUser);
router.put('/:id', authenticateToken, authorizeAdmin, updateUser);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUser);
router.get('/activity', authenticateToken, authorizeAdmin, getActivityReport);
router.post('/logout', authenticateToken, registerLogout);

export default router;