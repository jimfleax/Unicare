import { v2 as cloudinary } from 'cloudinary';
import { IStorageService, UploadResult } from './storageService.interface';

export class CloudinaryStorageService implements IStorageService {
  constructor() {
    if (process.env.CLOUDINARY_URL) {
      // automatically parsed by cloudinary
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'unicare'): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: `unicare/${folder}`,
        resource_type: 'auto' as const,
      };

      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }
        resolve({
          url: result.secure_url,
          key: result.public_id,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: result.bytes || file.size,
        });
      });

      if (file.buffer) {
        stream.end(file.buffer);
      } else {
        reject(new Error('Buffer required for Cloudinary stream upload'));
      }
    });
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key);
    } catch (err) {
      console.warn(`Failed to delete Cloudinary file ${key}:`, err);
    }
  }
}
