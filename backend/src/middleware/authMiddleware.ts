import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { verifyToken } from '../services/authService';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export interface AuthRequest extends Request {
  user?: IUser;
}

// 🛡️ Middleware to verify JWT and attach authenticated user to req.user
export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }

  try {
    const decoded = verifyToken(token) as { id: string };

    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      return next(new AppError('User belonging to token no longer exists', 401));
    }

    req.user = currentUser;
    next();
  } catch {
    return next(new AppError('Not authorized, token failed or expired', 401));
  }
});

// 🔒 Middleware to restrict access to specific roles (e.g. 'technician', 'admin')
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.map(r => r.toLowerCase()).includes(req.user.role?.toLowerCase())) {
      return next(new AppError(`Forbidden: User role '${req.user?.role || 'anonymous'}' is not authorized to perform this action`, 403));
    }
    next();
  };
};
