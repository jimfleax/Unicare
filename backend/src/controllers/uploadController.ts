import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getStorageService } from '../services/storage';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const ALLOWED_FOLDERS = ['general', 'avatars', 'incidents'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const validateFolder = (folder: unknown): AllowedFolder => {
  if (typeof folder === 'string' && (ALLOWED_FOLDERS as readonly string[]).includes(folder)) {
    return folder as AllowedFolder;
  }
  return 'general';
};

export const uploadFile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const file = req.file;
  if (!file) {
    return next(new AppError('No file provided for upload', 400));
  }

  const folder = validateFolder(req.body?.folder);
  const storage = getStorageService();
  const result = await storage.uploadFile(file, folder);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const uploadMultipleFiles = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return next(new AppError('No files provided for upload', 400));
  }

  const folder = validateFolder(req.body?.folder);
  const storage = getStorageService();

  const results = await Promise.all(
    files.map((file) => storage.uploadFile(file, folder))
  );

  res.status(200).json({
    success: true,
    data: results,
  });
});
