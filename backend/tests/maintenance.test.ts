import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import User from '../src/models/User';
import MaintenanceSchedule from '../src/models/MaintenanceSchedule';
import { generateToken } from '../src/services/authService';

describe('Maintenance Endpoints', () => {
  let adminToken: string;
  let adminId: string;
  let techId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await MaintenanceSchedule.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin_maint@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = admin._id.toString();
    adminToken = generateToken(adminId);

    const tech = await User.create({
      name: 'Tech User',
      email: 'tech_maint@example.com',
      password: 'password123',
      role: 'technician',
    });
    techId = tech._id.toString();
  });

  describe('POST /api/maintenance', () => {
    it('should create a new maintenance schedule', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          assetId: new mongoose.Types.ObjectId().toString(),
          assignedTo: techId,
          scheduledDate: new Date().toISOString(),
          description: 'Quarterly checkup',
          status: 'Pending',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Quarterly checkup');
    });
  });

  describe('GET /api/maintenance', () => {
    it('should return a list of maintenance schedules', async () => {
      await MaintenanceSchedule.create({
        assetId: new mongoose.Types.ObjectId(),
        assignedTo: techId,
        scheduledDate: new Date(),
        description: 'Test Maint',
        status: 'Pending',
      });

      const res = await request(app)
        .get('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].description).toBe('Test Maint');
    });
  });
});
