import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IStorageService, UploadResult } from './storageService.interface';
import { AppError } from '../../utils/AppError';

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function getValidatedImageMime(buffer: Buffer, claimedMime?: string): string | null {
  if (!buffer || !claimedMime) {
    return null;
  }

  const normalizedClaimed = claimedMime.toLowerCase().trim();
  if (!MIME_EXTENSION_MAP[normalizedClaimed]) {
    return null;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return normalizedClaimed === 'image/png' ? 'image/png' : null;
  }

  // JPEG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return (normalizedClaimed === 'image/jpeg' || normalizedClaimed === 'image/jpg')
      ? normalizedClaimed
      : null;
  }

  // WEBP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return normalizedClaimed === 'image/webp' ? 'image/webp' : null;
  }

  return null;
}

export class LocalStorageService implements IStorageService {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'general'): Promise<UploadResult> {
    const targetFolder = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    let buffer: Buffer;
    if (file.buffer) {
      buffer = file.buffer;
    } else if (file.path) {
      buffer = await fs.promises.readFile(file.path);
    } else {
      throw new AppError('File buffer or path is missing', 400);
    }

    const validatedMime = getValidatedImageMime(buffer, file.mimetype);
    if (!validatedMime) {
      if (file.path) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
      throw new AppError('File content does not match the image MIME type', 400);
    }

    const ext = MIME_EXTENSION_MAP[validatedMime];
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const targetPath = path.join(targetFolder, uniqueName);

    if (file.buffer) {
      await fs.promises.writeFile(targetPath, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, targetPath);
      // clean up multer temp file if any
      await fs.promises.unlink(file.path).catch(() => {});
    }

    const key = path.join(folder, uniqueName).replace(/\\/g, '/');
    const url = `/uploads/${key}`;

    return {
      url,
      key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size !== undefined ? file.size : buffer.length,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(this.baseDir, safeKey);
    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (err) {
      console.warn(`Failed to delete local file ${fullPath}:`, err);
    }
  }
}
