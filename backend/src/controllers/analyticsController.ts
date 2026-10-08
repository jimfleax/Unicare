import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Incident from '../models/Incident';
import { catchAsync } from '../utils/catchAsync';

export const getAnalytics = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const totalIncidents = await Incident.countDocuments();
  const resolvedIncidents = await Incident.countDocuments({ status: 'Resolved' });
  
  const incidents = await Incident.find();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  let breachedCount = 0;
  let totalResolutionTimeMs = 0;
  let resolvedCount = 0;
  
  incidents.forEach(incident => {
    const createdTime = new Date(incident.createdAt).getTime();
    
    if (incident.status === 'Resolved') {
      const updatedTime = new Date(incident.updatedAt).getTime();
      const resolutionTime = updatedTime - createdTime;
      
      if (resolutionTime > ONE_DAY) {
        breachedCount++;
      }
      
      totalResolutionTimeMs += resolutionTime;
      resolvedCount++;
    } else {
      const delta = Date.now() - createdTime;
      if (delta > ONE_DAY) {
        breachedCount++;
      }
    }
  });

  const slaCompliance = totalIncidents === 0 ? 100 : ((totalIncidents - breachedCount) / totalIncidents) * 100;
  
  const avgSlaSpeed = resolvedCount === 0 
    ? "0.0h" 
    : `${(totalResolutionTimeMs / resolvedCount / (1000 * 60 * 60)).toFixed(1)}h`;
    
  const compliance = `${slaCompliance.toFixed(1)}%`;
  const uptime = "99.9%";
  const jobsComplete = `${resolvedIncidents}/${totalIncidents}`;
  
  res.status(200).json({
    success: true,
    data: {
      totalIncidents,
      resolvedIncidents,
      breachedCount,
      slaCompliance,
      avgSlaSpeed,
      compliance,
      uptime,
      jobsComplete
    }
  });
});

export const getTrends = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const { period } = req.query as { period: string };
  
  const now = new Date();
  const startDate = new Date();
  let format = '%Y-%m-%d';
  let numItems = 7;
  
  if (period === '30d') {
    startDate.setDate(now.getDate() - 29);
    format = '%Y-%m-%d';
    numItems = 30;
  } else if (period === '6m') {
    startDate.setMonth(now.getMonth() - 5);
    startDate.setDate(1);
    format = '%Y-%m';
    numItems = 6;
  } else if (period === '1y') {
    startDate.setMonth(now.getMonth() - 11);
    startDate.setDate(1);
    format = '%Y-%m';
    numItems = 12;
  } else {
    // 7d default
    startDate.setDate(now.getDate() - 6);
    format = '%Y-%m-%d';
    numItems = 7;
  }
  
  // Set time to beginning of the day for accurate boundaries
  startDate.setHours(0, 0, 0, 0);

  const reportedCounts = await Incident.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: {
        _id: { $dateToString: { format, date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const resolvedCounts = await Incident.aggregate([
    { $match: { status: 'Resolved', updatedAt: { $gte: startDate } } },
    { $group: {
        _id: { $dateToString: { format, date: "$updatedAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const labels: string[] = [];
  const reportedMap = new Map<string, number>();
  const resolvedMap = new Map<string, number>();

  for (const r of reportedCounts) {
    reportedMap.set(r._id, r.count);
  }
  for (const r of resolvedCounts) {
    resolvedMap.set(r._id, r.count);
  }

  const reported: number[] = [];
  const resolved: number[] = [];
  const currentDate = new Date(startDate);
  
  if (format === '%Y-%m-%d') {
    for (let i = 0; i < numItems; i++) {
      const mapKey = currentDate.toISOString().split('T')[0];
      
      let label = '';
      if (period === '7d' || !period) {
        label = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      labels.push(label);
      reported.push(reportedMap.get(mapKey) || 0);
      resolved.push(resolvedMap.get(mapKey) || 0);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    for (let i = 0; i < numItems; i++) {
      const mapKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const label = currentDate.toLocaleDateString('en-US', { month: 'short' });
      
      labels.push(label);
      reported.push(reportedMap.get(mapKey) || 0);
      resolved.push(resolvedMap.get(mapKey) || 0);
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      labels,
      reported,
      resolved
    }
  });
});
