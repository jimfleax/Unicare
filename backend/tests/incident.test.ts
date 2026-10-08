import request from 'supertest';
import app from '../src/app';
import User, { IUser } from '../src/models/User';
import Asset, { IAsset } from '../src/models/Asset';
import Incident from '../src/models/Incident';
import { generateToken } from '../src/services/authService';

describe('Incident Endpoints', () => {
  let token: string;
  let user: IUser;
  let admin: IUser;
  let adminToken: string;
  let asset: IAsset;

  beforeEach(async () => {
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Incident.deleteMany({});

    user = await User.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });
    token = generateToken(user._id.toString());
    admin = await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = generateToken(admin._id.toString());

    asset = await Asset.create({
      tagId: 'TEST-123',
      name: 'Test Projector',
      healthStatus: 'healthy',
      location: 'Block A',
      category: 'Hardware'
    });
  });

  describe('POST /api/incidents', () => {
    it('should create an incident with an existing assetId', async () => {
      expect.assertions(4);
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({
          assetId: asset._id.toString(),
          description: 'Projector is not turning on',
          title: 'Projector issue'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.incident.description).toBe('Projector is not turning on');
      expect(res.body.data.incident.assetId.toString()).toBe(asset._id.toString());
    });

    it('should auto-create a generic asset if no assetId is provided', async () => {
      expect.assertions(3);
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Water leak',
          location: 'Block C Restroom',
          description: 'Water leaking from the sink'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      // Asset should be newly created
      const incident = await Incident.findById(res.body.data.incident._id).populate('assetId');
      expect((incident?.assetId as unknown as { name: string }).name).toBe('Water leak');
    });

    it('should return 400 if description and title are missing', async () => {
      expect.assertions(2);
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/incidents/:id/status', () => {
    it('should update the incident status', async () => {
      expect.assertions(2);
      const incident = await Incident.create({
        assetId: asset._id,
        description: 'Test incident',
        reportedBy: user._id,
        status: 'Open'
      });

      const res = await request(app)
        .patch(`/api/incidents/${incident._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Resolved'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.incident.status).toBe('Resolved');
    });
  });
  describe('POST /api/incidents/:id/logs', () => {
    it('should add an activity log to the incident', async () => {
      expect.assertions(3);
      const incident = await Incident.create({
        assetId: asset._id,
        description: 'Test incident',
        reportedBy: user._id,
        status: 'Open'
      });

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/logs`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Fixed the projector bulb'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.incident.activityLogs[0].message).toBe('Fixed the projector bulb');
    });
  });

  describe('GET /api/incidents', () => {
    it('should populate activityLogs.createdBy', async () => {
      expect.assertions(3);
      const incident = await Incident.create({
        assetId: asset._id,
        description: 'Test incident',
        reportedBy: user._id,
        status: 'Open',
        activityLogs: [{
          message: 'Initial check',
          createdBy: admin._id
        }]
      });

      const res = await request(app)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      const fetchedIncident = res.body.data.find((i: { _id: string }) => i._id === incident._id.toString());
      expect(fetchedIncident.activityLogs[0].message).toBe('Initial check');
      expect(fetchedIncident.activityLogs[0].createdBy.name).toBe('Test Admin');
    });
  });
});
