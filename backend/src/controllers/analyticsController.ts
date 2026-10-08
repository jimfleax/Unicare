import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Incident from '../models/Incident';
import { catchAsync } from '../utils/catchAsync';

export const getAnalytics = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const totalIncidents = await Incident.countDocuments();
  const resolvedIncidents = await Incident.countDocuments({ status: 'Resolved' });
  
  // Calculate SLA compliance (e.g. resolved within 24h)
  const incidents = await Incident.find();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  let breachedCount = 0;
  
  incidents.forEach(incident => {
    if (incident.status !== 'Resolved') {
      const delta = Date.now() - new Date(incident.createdAt).getTime();
      if (delta > ONE_DAY) {
        breachedCount++;
      }
    }
  });

  const slaCompliance = totalIncidents === 0 ? 100 : ((totalIncidents - breachedCount) / totalIncidents) * 100;
  
  res.status(200).json({
    success: true,
    data: {
      totalIncidents,
      resolvedIncidents,
      breachedCount,
      slaCompliance
    }
  });
});
