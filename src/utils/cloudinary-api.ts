/**
 * Cloudinary Configuration
 * Client-side utilities for Cloudinary uploads
 */

/**
 * Determine the correct Cloudinary resource_type for a file.
 * PDFs, DOCX, and all non-image/video files must use "raw" — if uploaded
 * as "image" or "auto" Cloudinary may route them through the image pipeline
 * and block delivery.
 */
export function getCloudinaryResourceType(file: File): 'image' | 'video' | 'raw' {
  const { type } = file;
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'raw';
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  resource_type: string;
  bytes: number;
  created_at: string;
  url: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  resourceType?: 'auto' | 'image' | 'raw' | 'video';
  publicId?: string;
  tags?: string[];
}

/**
 * Upload file to Cloudinary using unsigned upload
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  const resourceType = options.resourceType || 'auto';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const result: CloudinaryUploadResult = await response.json();
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = files.map(file => uploadToCloudinary(file, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete file from Cloudinary (requires backend endpoint)
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // This should be done via your backend API for security
  // as it requires your API secret
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
}