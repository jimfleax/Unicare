import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import { generateToken } from '../src/services/authService';

describe('User Avatar Persistence', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    const user = await User.create({
      name: 'Alice Wonder',
      email: 'alice@example.com',
      password: 'password123',
      role: 'student',
    });
    userId = user._id.toString();
    token = generateToken(userId);
  });

  it('should update avatarUrl and persist it to user document and auth/me', async () => {
    const avatarUrl = '/uploads/avatars/alice-pic.png';

    const patchRes = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatarUrl });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.avatarUrl).toBe(avatarUrl);

    // Verify User record in database
    const updatedUser = await User.findById(userId);
    expect(updatedUser?.avatarUrl).toBe(avatarUrl);

    // Verify GET /api/auth/me returns the updated avatarUrl
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.avatarUrl).toBe(avatarUrl);
  });

  it('should return 400 when avatarUrl is missing or whitespace', async () => {
    const patchRes = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.success).toBe(false);

    const emptyRes = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatarUrl: '   ' });

    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.success).toBe(false);
  });

  it('should accept valid https avatarUrl', async () => {
    const avatarUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const patchRes = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatarUrl });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.avatarUrl).toBe(avatarUrl);
  });

  it('should reject invalid avatarUrl values', async () => {
    const invalidUrls = [
      'http://insecure.example.com/pic.jpg',
      'javascript:alert(1)',
      '/etc/passwd',
      '/api/users',
      '/uploads/../secret.png',
      '//uploads/pic.png',
      'https://' + 'a'.repeat(2048), // exceeds limit
    ];

    for (const url of invalidUrls) {
      const res = await request(app)
        .patch('/api/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatarUrl: url });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    }

    const nonStringRes = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatarUrl: { url: '/uploads/avatars/pic.png' } });

    expect(nonStringRes.status).toBe(400);
    expect(nonStringRes.body.success).toBe(false);
  });
});
