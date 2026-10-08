import express from 'express';
import { getIssues, createIssue, updateIssueStatus } from '../controllers/issueController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (or open for reporting)
router.get('/', getIssues);           // GET /api/issues
router.post('/', createIssue);         // POST /api/issues

// Protected & Role-Restricted route: Only Technicians and Admins can update status
router.patch('/:id', protect, authorize('technician', 'admin', 'lab_admin'), updateIssueStatus);

export default router;
