import { Request, Response } from 'express';
import Inventory from '../models/Inventory';
import { catchAsync } from '../utils/catchAsync';

export const getAllSpareParts = catchAsync(async (req: Request, res: Response) => {
  const parts = await Inventory.find({});
  res.status(200).json({ success: true, data: parts });
});

export const getSparePartById = catchAsync(async (req: Request, res: Response) => {
  const part = await Inventory.findById(req.params.id);
  if (!part) {
    return res.status(404).json({ success: false, message: 'Spare part not found' });
  }
  res.status(200).json({ success: true, data: part });
});

export const createSparePart = catchAsync(async (req: Request, res: Response) => {
  const part = await Inventory.create(req.body);
  res.status(201).json({ success: true, data: part });
});

export const updateSparePart = catchAsync(async (req: Request, res: Response) => {
  const part = await Inventory.findById(req.params.id);
  if (!part) {
    return res.status(404).json({ success: false, message: 'Spare part not found' });
  }

  // Update fields
  Object.assign(part, req.body);
  await part.save(); // This will trigger the pre-save hook to update status

  res.status(200).json({ success: true, data: part });
});

export const deleteSparePart = catchAsync(async (req: Request, res: Response) => {
  const part = await Inventory.findByIdAndDelete(req.params.id);
  if (!part) {
    return res.status(404).json({ success: false, message: 'Spare part not found' });
  }
  res.status(200).json({ success: true, data: {} });
});
