import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import { generateToken } from '../src/services/authService';
import { LocalStorageService } from '../src/services/storage/localStorageService';
import path from 'path';
import fs from 'fs';

describe('Storage & Upload Service', () => {
  let token: string;
  const testUploadDir = path.resolve(__dirname, 'test-uploads');

  beforeAll(() => {
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  afterAll(async () => {
    if (fs.existsSync(testUploadDir)) {
      await fs.promises.rm(testUploadDir, { recursive: true, force: true }).catch(() => {});
    }
    // Clean up general uploads created during tests
    const generalUploads = path.resolve(process.cwd(), 'uploads');
    if (fs.existsSync(generalUploads)) {
      await fs.promises.rm(generalUploads, { recursive: true, force: true }).catch(() => {});
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    const user = await User.create({
      name: 'Uploader User',
      email: 'uploader@example.com',
      password: 'password123',
      role: 'student',
    });
    token = generateToken(user._id.toString());
  });

  describe('LocalStorageService class', () => {
    it('should save a file buffer and allow deletion', async () => {
      const storage = new LocalStorageService(testUploadDir);
      const fakeFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'sample.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 14,
        buffer: Buffer.from('fake image data'),
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await storage.uploadFile(fakeFile, 'avatars');
      expect(result.url).toContain('/uploads/avatars/');
      expect(result.originalName).toBe('sample.png');
      expect(result.mimeType).toBe('image/png');

      const savedPath = path.join(testUploadDir, result.key);
      expect(fs.existsSync(savedPath)).toBe(true);

      await storage.deleteFile(result.key);
      expect(fs.existsSync(savedPath)).toBe(false);
    });
  });

  describe('POST /api/upload', () => {
    it('should upload a single image file successfully', async () => {
      const buffer = Buffer.from('fake image content');
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', buffer, 'report-photo.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toMatch(/^\/uploads\//);
      expect(res.body.data.originalName).toBe('report-photo.png');
    });

    it('should reject non-image file uploads', async () => {
      const buffer = Buffer.from('console.log("bad")');
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', buffer, 'malicious.js');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when no file is attached', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject file uploads larger than 5MB', async () => {
      const buffer = Buffer.alloc(6 * 1024 * 1024);
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', buffer, 'huge.png');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
