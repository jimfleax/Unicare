import { Request, Response } from 'express';
import RequisitionRequest from '../models/RequisitionRequest';
import Inventory from '../models/Inventory';
import { catchAsync } from '../utils/catchAsync';

export const createRequisition = catchAsync(async (req: Request, res: Response) => {
  const requisition = await RequisitionRequest.create(req.body);
  res.status(201).json({ success: true, data: requisition });
});

export const getAllRequisitions = catchAsync(async (req: Request, res: Response) => {
  const requisitions = await RequisitionRequest.find({})
    .populate('inventoryId')
    .populate('technicianId');
  res.status(200).json({ success: true, data: requisitions });
});

export const updateRequisitionStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const requisition = await RequisitionRequest.findById(req.params.id);

  if (!requisition) {
    return res.status(404).json({ success: false, message: 'Requisition not found' });
  }

  requisition.status = status;
  await requisition.save();

  if (status === 'Approved') {
    const part = await Inventory.findById(requisition.inventoryId);
    if (part) {
      part.stock -= requisition.quantityRequested;
      await part.save(); // triggers pre-save hook to adjust status
    }
  }

  res.status(200).json({ success: true, data: requisition });
});
