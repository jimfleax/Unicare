import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";
import { generateToken } from "../src/services/authService";
import { LocalStorageService } from "../src/services/storage/localStorageService";
import { setStorageService } from "../src/services/storage";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

describe("Storage & Upload Service", () => {
  let token: string;
  const testUploadDir = path.resolve(__dirname, "test-uploads");
  const originalUploadDir = process.env.UPLOAD_DIR;

  beforeAll(() => {
    process.env.UPLOAD_DIR = testUploadDir;
    setStorageService(new LocalStorageService(testUploadDir));
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  afterAll(async () => {
    setStorageService(null);
    if (originalUploadDir !== undefined) {
      process.env.UPLOAD_DIR = originalUploadDir;
    } else {
      delete process.env.UPLOAD_DIR;
    }
    if (fs.existsSync(testUploadDir)) {
      await fs.promises
        .rm(testUploadDir, { recursive: true, force: true })
        .catch(() => {});
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    const user = await User.create({
      name: "Uploader User",
      email: "uploader@example.com",
      password: "password123",
      role: "student",
    });
    token = generateToken(user._id.toString());
  });

  const validPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );

  describe("LocalStorageService class", () => {
    it("should save a file buffer and allow deletion", async () => {
      const storage = new LocalStorageService(testUploadDir);
      const fakeFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "sample.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: validPngBuffer.length,
        buffer: validPngBuffer,
        stream: Readable.from([]),
        destination: "",
        filename: "",
        path: "",
      };

      const result = await storage.uploadFile(fakeFile, "avatars");
      expect(result.url).toContain("/uploads/avatars/");
      expect(result.url).toMatch(/\.png$/);
      expect(result.originalName).toBe("sample.png");
      expect(result.mimeType).toBe("image/png");

      const savedPath = path.join(testUploadDir, result.key);
      expect(fs.existsSync(savedPath)).toBe(true);

      await storage.deleteFile(result.key);
      expect(fs.existsSync(savedPath)).toBe(false);
    });

    it("should use fixed extension from validated MIME type rather than originalname", async () => {
      const storage = new LocalStorageService(testUploadDir);
      const fakeFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "malicious.php",
        encoding: "7bit",
        mimetype: "image/png",
        size: validPngBuffer.length,
        buffer: validPngBuffer,
        stream: Readable.from([]),
        destination: "",
        filename: "",
        path: "",
      };

      const result = await storage.uploadFile(fakeFile, "avatars");
      expect(result.url).toMatch(/\.png$/);
      expect(result.key).toMatch(/\.png$/);
      expect(result.key).not.toContain(".php");

      await storage.deleteFile(result.key);
    });

    it("should throw an error when file content does not match MIME type", async () => {
      const storage = new LocalStorageService(testUploadDir);
      const fakeFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "fake.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 14,
        buffer: Buffer.from("not a real png"),
        stream: Readable.from([]),
        destination: "",
        filename: "",
        path: "",
      };

      await expect(storage.uploadFile(fakeFile, "avatars")).rejects.toThrow();
    });
  });

  describe("POST /api/upload", () => {
    it("should upload a single image file successfully", async () => {
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", validPngBuffer, "report-photo.png");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toMatch(/^\/uploads\//);
      expect(res.body.data.url).toMatch(/\.png$/);
      expect(res.body.data.originalName).toBe("report-photo.png");
    });

    it("should reject non-image file uploads", async () => {
      const buffer = Buffer.from('console.log("bad")');
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", buffer, "malicious.js");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject spoofed image content when MIME type does not match content", async () => {
      const fakeBuffer = Buffer.from("fake image content claiming to be png");
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", fakeBuffer, "spoofed.png");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should enforce fixed extension mapping from validated MIME type even with spoofed originalname extension", async () => {
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", validPngBuffer, {
          filename: "exploit.php",
          contentType: "image/png",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toMatch(/\.png$/);
      expect(res.body.data.url).not.toContain(".php");
    });

    it("should accept valid folders (avatars, incidents) and fallback invalid folders to general", async () => {
      const resAvatars = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .field("folder", "avatars")
        .attach("file", validPngBuffer, "avatar.png");

      expect(resAvatars.status).toBe(200);
      expect(resAvatars.body.data.url).toContain("/uploads/avatars/");

      const resIncidents = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .field("folder", "incidents")
        .attach("file", validPngBuffer, "incident.png");

      expect(resIncidents.status).toBe(200);
      expect(resIncidents.body.data.url).toContain("/uploads/incidents/");

      const resInvalid = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .field("folder", "../../secret")
        .attach("file", validPngBuffer, "photo.png");

      expect(resInvalid.status).toBe(200);
      expect(resInvalid.body.data.url).toContain("/uploads/general/");
      expect(resInvalid.body.data.url).not.toContain("secret");
    });

    it("should fallback repeated folder fields to general", async () => {
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .field("folder", "avatars")
        .field("folder", "incidents")
        .attach("file", validPngBuffer, "photo.png");

      expect(res.status).toBe(200);
      expect(res.body.data.url).toContain("/uploads/general/");
    });

    it("should return 400 when no file is attached", async () => {
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject file uploads larger than 5MB", async () => {
      const buffer = Buffer.alloc(6 * 1024 * 1024);
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", buffer, "huge.png");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/upload/multiple", () => {
    it("should validate folder and fallback to general for invalid or repeated folder", async () => {
      const res = await request(app)
        .post("/api/upload/multiple")
        .set("Authorization", `Bearer ${token}`)
        .field("folder", "unknown_folder")
        .attach("files", validPngBuffer, "pic1.png")
        .attach("files", validPngBuffer, "pic2.png");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].url).toContain("/uploads/general/");
      expect(res.body.data[1].url).toContain("/uploads/general/");
    });
  });
});
