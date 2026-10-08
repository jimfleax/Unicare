import express from 'express';
import { getTechnicians, updateMyStatus, createTechnician, updateTechnician, deleteTechnician, getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/technicians', getTechnicians);
router.patch('/me/status', protect, updateMyStatus);

// Admin only routes for managing technicians
router.post('/technicians', protect, authorize('admin', 'lab_admin'), createTechnician);
router.put('/technicians/:id', protect, authorize('admin', 'lab_admin'), updateTechnician);
router.delete('/technicians/:id', protect, authorize('admin', 'lab_admin'), deleteTechnician);


// Generic User CRUD (Admin)
router.get('/', protect, authorize('admin', 'lab_admin'), getAllUsers);
router.post('/', protect, authorize('admin', 'lab_admin'), createUser);
router.put('/:id', protect, authorize('admin', 'lab_admin'), updateUser);
router.delete('/:id', protect, authorize('admin', 'lab_admin'), deleteUser);

export default router;
