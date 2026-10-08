import express, { Response, NextFunction } from 'express';
import { protect, authorize, AuthRequest } from '../middleware/authMiddleware';
import Subscription from '../models/Subscription';
import { catchAsync } from '../utils/catchAsync';
import Notification from "../models/Notification";
import { AppError } from '../utils/AppError';

const router = express.Router();

router.use(protect);


router.get('/', catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user!._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: req.user!._id });

  res.status(200).json({
    success: true,
    data: notifications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

router.put('/mark-read', catchAsync(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ recipient: req.user!._id, unread: true }, { unread: false });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
}));

router.put('/:id/mark-read', catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user!._id },
    { unread: false },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({ success: true, data: notification });
}));

router.post('/subscribe', authorize('technician', 'admin'), catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys) {
    return next(new AppError('Invalid subscription payload', 400));
  }
  
  await Subscription.findOneAndUpdate(
    { endpoint },
    { endpoint, keys, userId: req.user?._id },
    { upsert: true, new: true }
  );

  res.status(200).json({ status: 'success', message: 'Subscribed successfully' });
}));

export default router;
