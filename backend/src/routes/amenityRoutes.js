import express from 'express';
import { 
  getAmenities,
  getAmenityById,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  consumeAmenity,
  removeAmenityConsumption,
  getLowStock,
  getRoomConsumption
} from '../controllers/amenityController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (requieren autenticación)
router.get('/', authenticateToken, getAmenities);
router.get('/low-stock', authenticateToken, getLowStock);
router.get('/consumption/:shift_id', authenticateToken, getRoomConsumption);
router.get('/:id', authenticateToken, getAmenityById);

// Rutas solo para admin
router.post('/', authenticateToken, authorizeAdmin, createAmenity);
router.put('/:id', authenticateToken, authorizeAdmin, updateAmenity);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteAmenity);

// Consumo (requiere autenticación)
router.post('/consume', authenticateToken, consumeAmenity);
router.delete('/consume/:id', authenticateToken, removeAmenityConsumption);

export default router;