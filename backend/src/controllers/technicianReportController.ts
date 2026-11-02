import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import TechnicianReport from '../models/TechnicianReport';
import User from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { createTargetedNotification } from '../services/notificationService';

export const createTechnicianReport = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { technicianId, technicianName, incidentId, issueType, description } = req.body;

  if (!description || !issueType) {
    return next(new AppError('Missing required fields: issueType and description', 400));
  }

  let resolvedTechnicianId: mongoose.Types.ObjectId | null = null;

  if (technicianId && mongoose.Types.ObjectId.isValid(technicianId)) {
    const tech = await User.findById(technicianId);
    if (tech && tech.role === 'technician') {
      resolvedTechnicianId = tech._id as mongoose.Types.ObjectId;
    }
  }

  if (!resolvedTechnicianId && technicianName) {
    const tech = await User.findOne({
      role: 'technician',
      name: { $regex: new RegExp(`^${technicianName.trim()}$`, 'i') },
    });
    if (tech) {
      resolvedTechnicianId = tech._id as mongoose.Types.ObjectId;
    } else {
      // Find partial match
      const partialTech = await User.findOne({
        role: 'technician',
        name: { $regex: new RegExp(technicianName.trim(), 'i') },
      });
      if (partialTech) {
        resolvedTechnicianId = partialTech._id as mongoose.Types.ObjectId;
      }
    }
  }

  if (!resolvedTechnicianId) {
    return next(new AppError('Valid technician must be specified', 400));
  }

  const report = await TechnicianReport.create({
    technicianId: resolvedTechnicianId,
    reportedBy: req.user!._id,
    incidentId: incidentId && mongoose.Types.ObjectId.isValid(incidentId) ? incidentId : undefined,
    issueType,
    description,
    status: 'Pending Review',
  });

  // Notify Admins confidentially
  try {
    const technician = await User.findById(resolvedTechnicianId);
    await createTargetedNotification(
      {
        title: 'New Technician Escalation Reported',
        message: `A report was submitted regarding technician ${technician?.name || 'Staff'}: ${issueType}`,
        location: 'Administration',
        priority: 'High',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      },
      { role: 'admin' }
    );
  } catch (err) {
    console.warn('Failed to dispatch escalation notification to admin:', err);
  }

  res.status(201).json({
    success: true,
    data: { report },
  });
});

export const getTechnicianReports = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const isStaff = ['admin', 'lab_admin'].includes(req.user!.role);
  const filter = isStaff ? {} : { reportedBy: req.user!._id };

  const reports = await TechnicianReport.find(filter)
    .populate('technicianId', 'name email specialty phone avatarColor status')
    .populate('reportedBy', 'name email rollNo batch branch')
    .populate('incidentId', 'description priority status createdAt')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: reports,
  });
});

export const updateTechnicianReportStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { status, adminNotes } = req.body;

  if (status && !['Pending Review', 'Under Investigation', 'Resolved', 'Dismissed'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const updateFields: any = {};
  if (status) updateFields.status = status;
  if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

  const report = await TechnicianReport.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  })
    .populate('technicianId', 'name email specialty phone')
    .populate('reportedBy', 'name email rollNo');

  if (!report) {
    return next(new AppError('Technician report not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { report },
  });
});
