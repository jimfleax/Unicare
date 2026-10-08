import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import * as analyticsController from '../controllers/analyticsController';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', analyticsController.getAnalytics);
router.get('/trends', analyticsController.getTrends);

export default router;
