import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Asset from '../models/Asset';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const getAssetByTagId = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { tagId } = req.params;
  const asset = await Asset.findOne({ tagId });
  
  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }

  res.status(200).json({
    success: true,
    data: asset
  });
});

export const getAllAssets = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const assets = await Asset.find({});
  res.status(200).json({
    success: true,
    data: assets
  });
});

export const createAsset = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const asset = await Asset.create(req.body);
  res.status(201).json({
    success: true,
    data: asset
  });
});

export const updateAsset = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { tagId } = req.params;
  const asset = await Asset.findOneAndUpdate({ tagId }, req.body, {
    new: true,
    runValidators: true
  });

  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }

  res.status(200).json({
    success: true,
    data: asset
  });
});

export const deleteAsset = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { tagId } = req.params;
  const asset = await Asset.findOneAndDelete({ tagId });

  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }

  res.status(200).json({
    success: true,
    data: null
  });
});
