import { IStorageService } from './storageService.interface';
import { LocalStorageService } from './localStorageService';
import { CloudinaryStorageService } from './cloudinaryStorageService';

let storageInstance: IStorageService | null = null;

export function setStorageService(instance: IStorageService | null): void {
  storageInstance = instance;
}

export function getStorageService(): IStorageService {
  if (storageInstance) {
    return storageInstance;
  }

  const provider = process.env.STORAGE_PROVIDER?.toLowerCase();

  if (
    provider === 'cloudinary' ||
    (!provider && (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL))
  ) {
    storageInstance = new CloudinaryStorageService();
  } else {
    // Default to modular local storage
    storageInstance = new LocalStorageService();
  }

  return storageInstance;
}

export * from './storageService.interface';
export { LocalStorageService } from './localStorageService';
export { CloudinaryStorageService } from './cloudinaryStorageService';
