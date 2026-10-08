import express from 'express';
import { getHealthStatus } from '../controllers/healthController';

const router = express.Router();

// GET /api/health
router.get('/health', getHealthStatus);

export default router;
