import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import * as incidentController from '../controllers/incidentController';

const router = express.Router();

router.use(protect);

router.post('/', incidentController.createIncident);
router.get('/', incidentController.getIncidents);
router.get('/:id', incidentController.getIncidentById);

router.patch('/:id/status', authorize('technician', 'admin'), incidentController.updateIncidentStatus);
router.patch('/:id', authorize('technician', 'admin'), incidentController.updateIncidentStatus);
router.post('/:id/activity', authorize('technician', 'admin'), incidentController.addActivityLog);
router.post('/:id/logs', authorize('technician', 'admin'), incidentController.addActivityLog);

export default router;
