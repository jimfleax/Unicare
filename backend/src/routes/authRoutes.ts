import express from 'express';
import { registerUser, loginUser, googleLogin, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// Protected routes
router.get('/me', protect, getMe);

export default router;
