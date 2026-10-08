import request from 'supertest';
import app from '../src/app';

describe('Health API', () => {
  it('should return 200 on /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
