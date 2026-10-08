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

    const now = Date.now();
    await Incident.insertMany([
      // Open, 2 hours old -> not breached
      { assetId: asset._id, reportedBy: student._id, status: 'Open', description: 'desc1', createdAt: new Date(now - 1000 * 60 * 60 * 2) },
      // Resolved, 1 hour resolution time -> not breached
      { assetId: asset._id, reportedBy: student._id, status: 'Resolved', description: 'desc2', createdAt: new Date(now - 1000 * 60 * 60 * 2), updatedAt: new Date(now - 1000 * 60 * 60 * 1) },
      // Resolved, 25 hours resolution time -> breached
      { assetId: asset._id, reportedBy: student._id, status: 'Resolved', description: 'desc3', createdAt: new Date(now - 1000 * 60 * 60 * 30), updatedAt: new Date(now - 1000 * 60 * 60 * 5) },
      // Open, 26 hours old -> breached
      { assetId: asset._id, reportedBy: student._id, status: 'Open', description: 'desc4', createdAt: new Date(now - 1000 * 60 * 60 * 26) }
    ]);
  });

  describe('GET /api/analytics', () => {
    it('should return aggregated data for admin with new telemetry fields', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalIncidents).toBe(4);
      expect(res.body.data.resolvedIncidents).toBe(2);
      expect(res.body.data.breachedCount).toBe(2); // desc3 and desc4
      
      // slaCompliance: 2 non-breached out of 4 = 50%
      expect(res.body.data.slaCompliance).toBe(50);
      expect(res.body.data.compliance).toBe('50.0%');
      
      // avgSlaSpeed: desc2 (1h) + desc3 (25h) = 26h / 2 = 13h
      expect(res.body.data.avgSlaSpeed).toBe('13.0h');
      expect(res.body.data.uptime).toBe('99.9%');
      expect(res.body.data.jobsComplete).toBe('2/4');
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

  describe('GET /api/analytics/trends', () => {
    it('should return trend data for 7d period', async () => {
      expect.assertions(5);
      const res = await request(app)
        .get('/api/analytics/trends?period=7d')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.labels).toBeDefined();
      expect(res.body.data.reported).toBeDefined();
      expect(res.body.data.resolved).toBeDefined();
    });

    it('should return 403 Forbidden for student', async () => {
      expect.assertions(2);
      const res = await request(app)
        .get('/api/analytics/trends?period=7d')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
