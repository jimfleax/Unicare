import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Alert from '../models/Alert';
import MaintenanceSchedule from '../models/MaintenanceSchedule';
import Incident from '../models/Incident';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const getAlerts = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  // 1. Fetch manual broadcast alerts
  const manualAlerts = await Alert.find({ active: true }).sort('-createdAt').lean();

  // 2. Synthesize alerts from upcoming maintenance schedules
  const upcomingMaintenance = await MaintenanceSchedule.find({ status: { $ne: 'Completed' } })
    .populate('assetId', 'name location')
    .sort('scheduledDate')
    .limit(5)
    .lean();

  const maintenanceAlerts = upcomingMaintenance.map((m) => {
    const asset = m.assetId as any;
    const dateStr = m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : 'Scheduled';
    return {
      _id: m._id,
      type: 'notice' as const,
      title: m.description || `Scheduled Maintenance: ${asset?.name || 'Asset'}`,
      loc: asset?.location || 'Campus Lab',
      date: dateStr,
      source: 'maintenance',
    };
  });

  // 3. Synthesize alerts from Critical unresolved incidents
  const criticalIncidents = await Incident.find({
    priority: 'Critical',
    status: { $ne: 'Resolved' },
  })
    .populate('assetId', 'name location')
    .sort('-createdAt')
    .limit(5)
    .lean();

  const incidentAlerts = criticalIncidents.map((inc) => {
    const asset = inc.assetId as any;
    const dateStr = inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : 'Today';
    return {
      _id: inc._id,
      type: 'alert' as const,
      title: `Critical Alert: ${asset?.name || inc.description?.substring(0, 32) || 'Issue'}`,
      loc: asset?.location || 'Campus',
      date: dateStr,
      source: 'incident',
    };
  });

  // Merge manual alerts first, followed by urgent incidents and upcoming maintenance
  const combinedAlerts = [
    ...manualAlerts.map((a) => ({
      _id: a._id,
      type: a.type,
      title: a.title,
      loc: a.loc,
      date: a.date,
      source: 'manual',
    })),
    ...incidentAlerts,
    ...maintenanceAlerts,
  ];

  res.status(200).json({
    success: true,
    data: combinedAlerts,
  });
});

export const createAlert = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { title, loc, date, type } = req.body;
  if (!title || !loc) {
    return next(new AppError('Missing required fields: title and loc are required', 400));
  }

  const alert = await Alert.create({
    title,
    loc,
    date: date || new Date().toLocaleDateString(),
    type: type || 'alert',
    active: true,
    createdBy: req.user?._id,
  });

  res.status(201).json({
    success: true,
    data: alert,
  });
});

export const deleteAlert = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const alert = await Alert.findByIdAndDelete(req.params.id);
  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Alert deleted successfully',
  });
});
