import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import Metadata from '../src/models/Metadata';
import Asset from '../src/models/Asset';
import User from '../src/models/User';
import { generateToken } from '../src/services/authService';

describe('Metadata API', () => {
  let token: string;

  beforeEach(async () => {
    await Metadata.deleteMany({});
    await Asset.deleteMany({});
    await User.deleteMany({});
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student'
    });
    token = generateToken(user.id);
  });

  describe('GET /api/metadata/priorities', () => {
    it('should return priority metadata with value, label, and color', async () => {
      await Metadata.create({ type: 'priority', value: 'Critical', label: 'Critical', color: 'var(--red)' });

      const response = await request(app)
        .get('/api/metadata/priorities')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: 'Critical',
            label: 'Critical',
            color: 'var(--red)'
          })
        ])
      );
    });
  });

  describe('GET /api/metadata/locations', () => {
    it('should return location metadata with value, label, and color', async () => {
      await Metadata.create({ type: 'location', value: 'Library', label: 'Library', color: '#3b82f6' });

      const response = await request(app)
        .get('/api/metadata/locations')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: 'Library',
            label: 'Library',
            color: '#3b82f6'
          })
        ])
      );
    });

    it('should return default color for locations not found in Metadata', async () => {
      // Assuming Asset distinct location is retrieved and mapped
      await Asset.create({ tagId: 'A-001', name: 'Asset 1', location: 'Unknown Location', category: 'Electrical', healthStatus: 'healthy' });

      const response = await request(app)
        .get('/api/metadata/locations')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: 'Unknown Location',
            label: 'Unknown Location',
            color: 'var(--txt-sub)' // Testing fallback color
          })
        ])
      );
    });
  });
});
