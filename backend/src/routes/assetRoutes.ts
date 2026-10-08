import express from 'express';
import { protect } from '../middleware/authMiddleware';
import * as assetController from '../controllers/assetController';

const router = express.Router();

router.use(protect);

router.get('/', assetController.getAllAssets);
router.get('/:tagId', assetController.getAssetByTagId);

export default router;
