import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import { generateToken } from '../src/services/authService';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      expect.assertions(3);
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 400 if fields are missing', async () => {
      expect.assertions(2);
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      expect.assertions(3);
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      expect.assertions(2);
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/google', () => {
    it('should login/register with valid mock google token', async () => {
      expect.assertions(3);
      const payload = {
        name: 'Google User',
        email: 'google@example.com'
      };
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const body = Buffer.from(JSON.stringify(payload)).toString('base64');
      const mockToken = `${header}.${body}.signature`;

      const res = await request(app).post('/api/auth/google').send({
        token: mockToken
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid token format', async () => {
      expect.assertions(2);
      const res = await request(app).post('/api/auth/google').send({
        token: 'invalid.token'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user if valid token provided', async () => {
      expect.assertions(3);
      const user = await User.create({
        name: 'Me User',
        email: 'me@example.com',
        password: 'password123',
        role: 'student'
      });

      const token = generateToken(user._id.toString());
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('me@example.com');
    });

    it('should return 401 if no token provided', async () => {
      expect.assertions(2);
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 and success message even if user does not exist', async () => {
      expect.assertions(3);
      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'notfound@example.com'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
    });

    it('should set reset token and expiration on user and return 200', async () => {
      expect.assertions(4);
      await User.create({
        name: 'Forgot User',
        email: 'forgot@example.com',
        password: 'password123',
        role: 'student'
      });
      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'forgot@example.com'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const user = await User.findOne({ email: 'forgot@example.com' });
      expect(user?.resetPasswordToken).toBeDefined();
      expect(user?.resetPasswordExpires).toBeDefined();
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('should return 400 for invalid token', async () => {
      expect.assertions(2);
      const res = await request(app).post('/api/auth/reset-password/invalidtoken').send({
        newPassword: 'newpassword123'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reset password with valid token', async () => {
      expect.assertions(4);
      const user = await User.create({
        name: 'Reset User',
        email: 'reset@example.com',
        password: 'oldpassword',
        role: 'student',
        resetPasswordToken: 'validtoken',
        resetPasswordExpires: new Date(Date.now() + 3600000)
      });

      const res = await request(app).post('/api/auth/reset-password/validtoken').send({
        newPassword: 'newpassword123'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.resetPasswordToken).toBeUndefined();
      expect(updatedUser?.resetPasswordExpires).toBeUndefined();
    });
  });
});
