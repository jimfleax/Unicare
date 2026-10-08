import express from 'express';
import {
  createRequisition,
  getAllRequisitions,
  updateRequisitionStatus,
} from '../controllers/requisitionController';

const router = express.Router();

router.route('/')
  .get(getAllRequisitions)
  .post(createRequisition);

router.route('/:id/status')
  .put(updateRequisitionStatus);

export default router;
