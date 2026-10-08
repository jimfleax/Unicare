import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Global Error Handler Middleware
 */
interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  code?: number;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  let error = { ...err } as CustomError;
  error.message = err.message;
  
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new AppError(message, 404);
  }
  
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }
  
  if (err.name === 'ValidationError' && err.errors) {
    const message = Object.values(err.errors).map((val: { message: string }) => val.message).join(', ');
    error = new AppError(message, 400);
  }
  
  console.error('[Error Handler]:', err.stack || err.message);
  
  const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const status = error.status || 'error';
  
  res.status(statusCode).json({
    success: false,
    status,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
