import { Request, Response } from 'express';
import User from '../models/User';
import { catchAsync } from '../utils/catchAsync';

export const getTechnicians = catchAsync(async (req: Request, res: Response) => {
  const technicians = await User.find({ role: 'technician' });
  
  // Mongoose documents can be converted to JSON directly or we can use map
  // To ensure the _id is mapped to id, we can convert to objects
  const data = technicians.map(tech => {
    const obj: any = tech.toObject();
    obj.id = obj._id;
    return obj;
  });

  res.status(200).json({
    success: true,
    data,
  });
});
