import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import Asset from '../src/models/Asset';
import Incident from '../src/models/Incident';
import mongoose from 'mongoose';
import { generateToken } from '../src/services/authService';

describe('Analytics Endpoints', () => {
  let adminToken: string;
  let admin: any;
  let studentToken: string;
  let student: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Incident.deleteMany({});
    await Asset.deleteMany({});

    admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = generateToken(admin._id.toString());

    student = await User.create({
      name: 'Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });
    studentToken = generateToken(student._id.toString());

    const asset = await Asset.create({ tagId: 'A-1', name: 'Asset', healthStatus: 'healthy' });

    await Incident.insertMany([
      { assetId: asset._id, reportedBy: student._id, status: 'Open', description: 'desc1', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) }, // 2 hours old
      { assetId: asset._id, reportedBy: student._id, status: 'Resolved', description: 'desc2', createdAt: new Date(), updatedAt: new Date(Date.now() + 1000 * 60 * 60) }, // 1 hour resolution time
      { assetId: asset._id, reportedBy: student._id, status: 'Resolved', description: 'desc3', createdAt: new Date(), updatedAt: new Date(Date.now() + 1000 * 60 * 60 * 5) } // 5 hours resolution time (breached)
    ]);
  });

  describe('GET /api/analytics', () => {
    it('should return aggregated data for admin', async () => {
      expect.assertions(3);
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalIncidents).toBe(3);
    });

    it('should return 403 Forbidden for student', async () => {
      expect.assertions(2);
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
