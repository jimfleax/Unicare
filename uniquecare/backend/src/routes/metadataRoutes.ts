import express from 'express';
import { protect } from '../middleware/authMiddleware';
import * as metadataController from '../controllers/metadataController';

const router = express.Router();

router.use(protect);

router.get('/locations', metadataController.getLocations);
router.get('/categories', metadataController.getCategories);
router.get('/priorities', metadataController.getPriorities);
router.get('/statuses', metadataController.getStatuses);
router.get('/faqs', metadataController.getFaqs);
router.get('/student-profile', metadataController.getStudentProfile);

export default router;
