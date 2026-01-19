export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "cng" | "lpg";
export type TransmissionType = "manual" | "automatic" | "cvt" | "amt";

export interface CarDetails {
  make: string;
  model: string;
  manufacturingYear: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  kilometersDriven: number;
  ownershipCount: number;
  city: string;
  state: string;
}

export interface CarDetailsFormErrors {
  make?: string;
  model?: string;
  manufacturingYear?: string;
  fuelType?: string;
  transmission?: string;
  kilometersDriven?: string;
  ownershipCount?: string;
  city?: string;
  state?: string;
}

export type PhotoType = "front" | "rear" | "left" | "right" | "interior" | "engineBay";

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: PhotoType | "video";
  progress: number;
  error?: string;
}

export interface MediaUploadData {
  photos: Record<PhotoType, UploadedFile | null>;
  video: UploadedFile | null;
}

// File validation constants
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MIN_VIDEO_DURATION = 10; // seconds
export const MAX_VIDEO_DURATION = 20; // seconds
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4"];
