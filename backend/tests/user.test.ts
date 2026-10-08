import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import { generateToken } from '../src/services/authService';

describe('User Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/users/technicians', () => {
    it('should return a list of technicians', async () => {
      // Create some users
      await User.create([
        {
          name: 'Tech One',
          email: 'tech1@example.com',
          password: 'password123',
          role: 'technician',
          title: 'Senior Tech',
          specialty: 'AV',
          status: 'On Shift',
          phone: '+1234567890',
          avatarColor: '#ff0000',
        },
        {
          name: 'Admin One',
          email: 'admin1@example.com',
          password: 'password123',
          role: 'admin',
        },
        {
          name: 'Tech Two',
          email: 'tech2@example.com',
          password: 'password123',
          role: 'technician',
          title: 'Junior Tech',
          specialty: 'Network',
          status: 'Off Duty',
          phone: '+0987654321',
          avatarColor: '#00ff00',
        },
      ]);

      const res = await request(app).get('/api/users/technicians');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      
      const tech1 = res.body.data.find((t: any) => t.email === 'tech1@example.com');
      expect(tech1).toBeDefined();
      expect(tech1.name).toBe('Tech One');
      expect(tech1.role).toBe('technician');
      expect(tech1.title).toBe('Senior Tech');
      expect(tech1.specialty).toBe('AV');
      expect(tech1.status).toBe('On Shift');
      expect(tech1.phone).toBe('+1234567890');
      expect(tech1.avatarColor).toBe('#ff0000');
      
      // Ensure mapped _id to id if frontend needs it, or just verify _id
      expect(tech1.id).toBeDefined(); 
    });
  });

  describe('PATCH /api/users/me/status', () => {
    it('should update the status of the logged-in technician', async () => {
      const user = await User.create({
        name: 'Tech Status Updater',
        email: 'techstatus@example.com',
        password: 'password123',
        role: 'technician',
        status: 'Off Duty',
      });

      const token = generateToken(user._id.toString());
      
      const res = await request(app)
        .patch('/api/users/me/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'On Shift' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('On Shift');

      // Verify in db
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.status).toBe('On Shift');
    });

    it('should reject invalid status values', async () => {
      const user = await User.create({
        name: 'Tech Status Updater 2',
        email: 'techstatus2@example.com',
        password: 'password123',
        role: 'technician',
        status: 'Off Duty',
      });

      const token = generateToken(user._id.toString());
      
      const res = await request(app)
        .patch('/api/users/me/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Invalid Status' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid status/i);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .patch('/api/users/me/status')
        .send({ status: 'On Shift' });

      expect(res.status).toBe(401);
    });
  });

  describe('Admin Technician CRUD', () => {
    let adminToken: string;

    beforeEach(async () => {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin_test@example.com',
        password: 'password123',
        role: 'admin',
      });
      adminToken = generateToken(admin._id.toString());
    });

    describe('POST /api/users/technicians', () => {
      it('should create a new technician', async () => {
        const res = await request(app)
          .post('/api/users/technicians')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'New Tech',
            email: 'newtech@example.com',
            password: 'password123',
            specialty: 'Networking',
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('New Tech');
        expect(res.body.data.role).toBe('technician');
      });
    });

    describe('PUT /api/users/technicians/:id', () => {
      it('should update an existing technician', async () => {
        const tech = await User.create({
          name: 'Old Tech',
          email: 'oldtech@example.com',
          password: 'password123',
          role: 'technician',
        });

        const res = await request(app)
          .put(`/api/users/technicians/${tech._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Updated Tech',
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Updated Tech');
      });
    });

    describe('DELETE /api/users/technicians/:id', () => {
      it('should delete an existing technician', async () => {
        const tech = await User.create({
          name: 'To Delete Tech',
          email: 'todelete@example.com',
          password: 'password123',
          role: 'technician',
        });

        const res = await request(app)
          .delete(`/api/users/technicians/${tech._id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const found = await User.findById(tech._id);
        expect(found).toBeNull();
      });
    });
  });

  describe('Admin User CRUD (Generic)', () => {
    let adminToken: string;

    beforeEach(async () => {
      const admin = await User.create({
        name: 'Admin Super',
        email: 'admin_super@example.com',
        password: 'password123',
        role: 'admin',
      });
      adminToken = generateToken(admin._id.toString());
    });

    describe('GET /api/users', () => {
      it('should fetch all users and filter by role', async () => {
        await User.create([
          { name: 'Student 1', email: 's1@example.com', password: 'password123', role: 'student', branch: 'CSE' },
          { name: 'Tech 3', email: 't3@example.com', password: 'password123', role: 'technician', specialty: 'IT' },
        ]);

        const resAll = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
        expect(resAll.status).toBe(200);
        expect(resAll.body.success).toBe(true);
        expect(resAll.body.data.length).toBeGreaterThanOrEqual(3);

        const resStudents = await request(app).get('/api/users?role=student').set('Authorization', `Bearer ${adminToken}`);
        expect(resStudents.status).toBe(200);
        expect(resStudents.body.data.length).toBe(1);
        expect(resStudents.body.data[0].role).toBe('student');
        expect(resStudents.body.data[0].id).toBeDefined();
      });
    });

    describe('POST /api/users', () => {
      it('should create a new user', async () => {
        const res = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'New Student',
            email: 'newstudent@example.com',
            password: 'password123',
            role: 'student',
            branch: 'ECE',
            batch: '2025',
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('New Student');
        expect(res.body.data.branch).toBe('ECE');
      });
    });

    describe('PUT /api/users/:id', () => {
      it('should update an existing user', async () => {
        const student = await User.create({
          name: 'Old Student',
          email: 'oldstudent@example.com',
          password: 'password123',
          role: 'student',
          branch: 'MECH'
        });

        const res = await request(app)
          .put(`/api/users/${student._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ branch: 'CSE' });

        expect(res.status).toBe(200);
        expect(res.body.data.branch).toBe('CSE');
      });
    });

    describe('DELETE /api/users/:id', () => {
      it('should delete a user', async () => {
        const student = await User.create({
          name: 'Delete Student',
          email: 'deletestudent@example.com',
          password: 'password123',
          role: 'student',
        });

        const res = await request(app)
          .delete(`/api/users/${student._id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        const found = await User.findById(student._id);
        expect(found).toBeNull();
      });
    });
  });
});
