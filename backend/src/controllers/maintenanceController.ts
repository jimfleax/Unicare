import { Request, Response } from 'express';
import MaintenanceSchedule from '../models/MaintenanceSchedule';

// @desc    Create new maintenance schedule
// @route   POST /api/maintenance
// @access  Private/Admin
export const createMaintenanceSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId, assignedTo, scheduledDate, description, status } = req.body;
    
    const schedule = await MaintenanceSchedule.create({
      assetId,
      assignedTo,
      scheduledDate,
      description,
      status: status || 'Pending',
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all maintenance schedules
// @route   GET /api/maintenance
// @access  Private/Admin
export const getMaintenanceSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const schedules = await MaintenanceSchedule.find()
      .populate('assetId', 'name')
      .populate('assignedTo', 'name email');
    res.status(200).json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
