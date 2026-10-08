import express from 'express';
import { protect } from '../middleware/authMiddleware';
import * as assetController from '../controllers/assetController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(assetController.getAllAssets)
  .post(assetController.createAsset);

router.route('/:tagId')
  .get(assetController.getAssetByTagId)
  .put(assetController.updateAsset)
  .delete(assetController.deleteAsset);

export default router;
