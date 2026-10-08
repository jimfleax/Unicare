import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';

describe('User Endpoints', () => {
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
});
