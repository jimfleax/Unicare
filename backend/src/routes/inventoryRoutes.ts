import express from 'express';
import {
  getAllSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart,
} from '../controllers/inventoryController';

const router = express.Router();

router.route('/')
  .get(getAllSpareParts)
  .post(createSparePart);

router.route('/:id')
  .get(getSparePartById)
  .put(updateSparePart)
  .delete(deleteSparePart);

export default router;
