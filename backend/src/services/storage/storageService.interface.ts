export interface UploadResult {
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  deleteFile(key: string): Promise<void>;
}
