import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import Asset from '../src/models/Asset';
import Notification from '../src/models/Notification';
import Incident from '../src/models/Incident';
import { generateToken } from '../src/services/authService';

describe('Notification Endpoints', () => {
  let studentToken: string;
  let adminToken: string;
  let technicianToken: string;
  let student: any;
  let admin: any;
  let technician: any;
  let asset: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Notification.deleteMany({});
    await Incident.deleteMany({});

    student = await User.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });
    studentToken = generateToken(student._id.toString());

    admin = await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = generateToken(admin._id.toString());

    technician = await User.create({
      name: 'Test Technician',
      email: 'tech@example.com',
      password: 'password123',
      role: 'technician'
    });
    technicianToken = generateToken(technician._id.toString());

    asset = await Asset.create({
      tagId: 'TAG-123',
      name: 'Test Projector',
      category: 'Electronics',
      location: 'Room 101',
      healthStatus: 'healthy'
    });
  });

  describe('GET /api/notifications', () => {
    it('should return empty array if no notifications exist', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should create a notification when a new incident is created and fetch it', async () => {
      // 1. Create Incident
      const incidentRes = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          assetId: asset._id,
          title: 'Projector not turning on',
          description: 'No power to the projector.'
        });

      expect(incidentRes.status).toBe(201);
      
      // 2. Fetch Notifications (as technician)
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('New Incident Reported');
      expect(res.body.data[0].unread).toBe(true);
    });

    it('should paginate notifications', async () => {
      const notifications = Array.from({ length: 15 }).map((_, i) => ({
        title: `Notification ${i}`,
        message: `Message ${i}`,
        location: 'Campus',
        time: '12:00 PM',
        unread: true,
        recipient: student._id
      }));

      await Notification.insertMany(notifications);

      const res = await request(app)
        .get('/api/notifications?page=2&limit=10')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(5);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.total).toBe(15);
    });
  });

  describe('PUT /api/notifications/mark-read', () => {
    it('should mark all user notifications as read', async () => {
      await Notification.create({
        title: 'Test Notification 1',
        message: 'Message 1',
        location: 'Campus',
        time: '12:00 PM',
        unread: true,
        recipient: admin._id
      });
      await Notification.create({
        title: 'Test Notification 2',
        message: 'Message 2',
        location: 'Campus',
        time: '12:05 PM',
        unread: true,
        recipient: admin._id
      });
      await Notification.create({
        title: 'Test Notification 3',
        message: 'Message 3',
        location: 'Campus',
        time: '12:10 PM',
        unread: true,
        recipient: student._id
      });

      const res = await request(app)
        .put('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const adminNotifications = await Notification.find({ recipient: admin._id });
      expect(adminNotifications.every(n => n.unread === false)).toBe(true);

      const studentNotifications = await Notification.find({ recipient: student._id });
      expect(studentNotifications[0].unread).toBe(true);
    });
  });

  describe('PUT /api/notifications/:id/mark-read', () => {
    it('should mark a specific notification as read', async () => {
      const notification = await Notification.create({
        title: 'Test Notification 1',
        message: 'Message 1',
        location: 'Campus',
        time: '12:00 PM',
        unread: true,
        recipient: student._id
      });

      const res = await request(app)
        .put(`/api/notifications/${notification._id}/mark-read`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unread).toBe(false);

      const updated = await Notification.findById(notification._id);
      expect(updated?.unread).toBe(false);
    });

    it('should return 404 if notification belongs to another user', async () => {
      const notification = await Notification.create({
        title: 'Test Notification 1',
        message: 'Message 1',
        location: 'Campus',
        time: '12:00 PM',
        unread: true,
        recipient: student._id
      });

      const res = await request(app)
        .put(`/api/notifications/${notification._id}/mark-read`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
