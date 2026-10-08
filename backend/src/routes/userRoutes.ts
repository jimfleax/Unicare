import express from 'express';
import { getTechnicians } from '../controllers/userController';
// In a real app we might protect this, but for now we'll match the plan
// import { protect } from '../middlewares/authMiddleware'; // assuming it exists, plan mentioned authMiddleware.ts

const router = express.Router();

router.get('/technicians', getTechnicians);

export default router;
