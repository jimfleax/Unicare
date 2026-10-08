import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Incident from '../models/Incident';
import Asset from '../models/Asset';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { createTargetedNotification } from '../services/notificationService';

export const createIncident = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { assetId, tagId, title, description, mediaUrls, location, category, priority } = req.body;
  if (!description && !title) {
    return next(new AppError('Missing required fields: description or title', 400));
  }

  let asset: any = null;
  if (assetId) {
    asset = await Asset.findById(assetId);
  } else if (tagId) {
    asset = await Asset.findOne({ tagId });
  }

  // Auto-create a generic asset if not found (useful for general issues reported without a specific asset tag)
  if (!asset) {
    asset = await Asset.create({
      tagId: tagId || `GEN-${Math.floor(Math.random() * 10000)}`,
      name: title || 'General Facility Issue',
      location: location || 'Campus',
      category: category || 'General',
      healthStatus: 'degraded'
    });
  }

  const incident = await Incident.create({
    assetId: asset._id,
    description: description || title,
    priority: priority || 'Medium',
    mediaUrls: mediaUrls || [],
    reportedBy: req.user._id,
    status: 'Open'
  });

  await createTargetedNotification({
    title: 'New Incident Reported',
    message: `A new incident has been reported for asset ${asset.name}`,
    location: asset.location || 'Campus',
    priority: 'High',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    incidentId: incident._id
  }, { role: 'technician' });

  res.status(201).json({
    success: true,
    data: { incident }
  });
});

export const getIncidents = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let filter = {};
  if (req.user.role === 'student') {
    filter = { reportedBy: req.user._id };
  }

  const incidents = await Incident.find(filter)
    .populate('assetId', 'name tagId healthStatus location category')
    .populate('reportedBy', 'name email rollNo batch batchCode branch')
    .populate('activityLogs.createdBy', 'name role')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: incidents
  });
});

export const getIncidentById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const incident = await Incident.findById(req.params.id)
    .populate('assetId', 'name tagId healthStatus location category')
    .populate('reportedBy', 'name email rollNo batch batchCode branch')
    .populate('assignedTo', 'name email')
    .populate('activityLogs.createdBy', 'name role');

  if (!incident) {
    return next(new AppError('Incident not found', 404));
  }

  if (req.user.role === 'student' && incident.reportedBy._id.toString() !== req.user._id.toString()) {
    return next(new AppError('Forbidden', 403));
  }

  res.status(200).json({
    success: true,
    data: { incident }
  });
});

export const updateIncidentStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { status } = req.body;
  if (!['In Progress', 'Resolved'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    return next(new AppError('Incident not found', 404));
  }

  incident.status = status;
  if (status === 'In Progress' && !incident.assignedTo) {
    incident.assignedTo = req.user._id;
  }
  await incident.save();

  const notificationPayload = {
    title: 'Incident Status Updated',
    message: `Incident status changed to ${status}`,
    location: 'System',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    incidentId: incident._id
  };

  await createTargetedNotification(notificationPayload, { userId: incident.reportedBy.toString() });
  
  if (incident.assignedTo) {
    await createTargetedNotification(notificationPayload, { userId: incident.assignedTo.toString() });
  }

  res.status(200).json({
    success: true,
    data: { incident }
  });
});

export const addActivityLog = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { content } = req.body;
  if (!content) {
    return next(new AppError('Missing activity content', 400));
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    return next(new AppError('Incident not found', 404));
  }

  incident.activityLogs.push({
    message: content,
    createdBy: req.user._id,
    createdAt: new Date()
  });

  await incident.save();

  const logNotificationPayload = {
    title: 'New Activity Log Added',
    message: content.length > 50 ? content.substring(0, 47) + '...' : content,
    location: 'System',
    priority: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    incidentId: incident._id
  };

  await createTargetedNotification(logNotificationPayload, { userId: incident.reportedBy.toString() });
  
  if (incident.assignedTo) {
    await createTargetedNotification(logNotificationPayload, { userId: incident.assignedTo.toString() });
  }

  res.status(201).json({
    success: true,
    data: { incident }
  });
});
