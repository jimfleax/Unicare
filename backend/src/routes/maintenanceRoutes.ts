import express from 'express';
import { createMaintenanceSchedule, getMaintenanceSchedules } from '../controllers/maintenanceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'lab_admin'));

router.route('/')
  .post(createMaintenanceSchedule)
  .get(getMaintenanceSchedules);

export default router;
