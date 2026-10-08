import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import incidentRoutes from './routes/incidentRoutes';
import assetRoutes from './routes/assetRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import requisitionRoutes from './routes/requisitionRoutes';
import metadataRoutes from './routes/metadataRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';

dotenv.config();

const app = express();

const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// API Routes that don't require database connection
app.use('/api', healthRoutes);

// Ensure DB connection for serverless environment
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In test env, DB is connected by setup.ts
    if (process.env.NODE_ENV !== 'test') {
      await connectDB();
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// API Routes that require database connection
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Error Handler Middleware
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

export default app;
