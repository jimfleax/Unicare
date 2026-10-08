import request from 'supertest';
import app from '../src/app';
import Asset from '../src/models/Asset';
import User from '../src/models/User';
import { generateToken } from '../src/services/authService';

describe('Asset Endpoints', () => {
  let token: string;

  beforeEach(async () => {
    await Asset.deleteMany({});
    await User.deleteMany({});
    
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    
    token = generateToken(user.id);
  });

  describe('GET /api/assets', () => {
    it('should fetch all assets', async () => {
      await Asset.create([
        { tagId: 'TAG-001', name: 'Server A', healthStatus: 'healthy', location: 'Rack 1', category: 'IT' },
        { tagId: 'TAG-002', name: 'Server B', healthStatus: 'degraded', location: 'Rack 2', category: 'IT' }
      ]);

      const res = await request(app).get('/api/assets').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('GET /api/assets/:tagId', () => {
    it('should fetch a single asset by tagId', async () => {
      await Asset.create({ tagId: 'TAG-003', name: 'Pump C', healthStatus: 'healthy', location: 'Basement', category: 'Mechanical' });

      const res = await request(app).get('/api/assets/TAG-003').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tagId).toBe('TAG-003');
    });

    it('should return 404 if asset not found', async () => {
      const res = await request(app).get('/api/assets/TAG-999').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/assets', () => {
    it('should create a new asset', async () => {
      const res = await request(app).post('/api/assets').set('Authorization', `Bearer ${token}`).send({
        tagId: 'TAG-004',
        name: 'HVAC Unit',
        healthStatus: 'healthy',
        location: 'Roof',
        category: 'HVAC'
      });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tagId).toBe('TAG-004');
    });
  });

  describe('PUT /api/assets/:tagId', () => {
    it('should update an existing asset', async () => {
      await Asset.create({ tagId: 'TAG-005', name: 'Generator', healthStatus: 'healthy', location: 'Outdoors', category: 'Electrical' });

      const res = await request(app).put('/api/assets/TAG-005').set('Authorization', `Bearer ${token}`).send({
        healthStatus: 'broken',
        location: 'Repair Shop'
      });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.healthStatus).toBe('broken');
      expect(res.body.data.location).toBe('Repair Shop');
    });

    it('should return 404 if updating non-existent asset', async () => {
      const res = await request(app).put('/api/assets/TAG-999').set('Authorization', `Bearer ${token}`).send({ healthStatus: 'broken' });
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/assets/:tagId', () => {
    it('should delete an asset', async () => {
      await Asset.create({ tagId: 'TAG-006', name: 'Boiler', healthStatus: 'degraded', location: 'Basement', category: 'HVAC' });

      const res = await request(app).delete('/api/assets/TAG-006').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Asset.findOne({ tagId: 'TAG-006' });
      expect(check).toBeNull();
    });

    it('should return 404 if deleting non-existent asset', async () => {
      const res = await request(app).delete('/api/assets/TAG-999').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
