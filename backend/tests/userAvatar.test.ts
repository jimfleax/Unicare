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

  it('should return 400 when avatarUrl is missing', async () => {
    const patchRes = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.success).toBe(false);
  });
});
