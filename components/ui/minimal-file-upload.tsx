'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryUploadResult, uploadToCloudinary, getCloudinaryResourceType } from '@/src/utils/cloudinary-api';
import { DocumentIcon } from '@/assets/icons/DocumentIcon';

export interface MinimalUploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  cloudinaryResult?: CloudinaryUploadResult;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
}

interface MinimalFileUploadProps {
  onFilesChange?: (files: MinimalUploadedFile[]) => void;
  onUploadComplete?: (results: CloudinaryUploadResult[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  folder?: string;
  autoUpload?: boolean;
}

export interface MinimalFileUploadRef {
  uploadAllFiles: () => Promise<CloudinaryUploadResult[]>;
  getUploadedFiles: () => CloudinaryUploadResult[];
  areAllFilesUploaded: () => boolean;
  clearFiles: () => void;
}

export const MinimalFileUpload = forwardRef<MinimalFileUploadRef, MinimalFileUploadProps>(({
  onFilesChange,
  onUploadComplete,
  acceptedTypes = ['.pdf', '.png', '.jpg', '.jpeg'],
  maxFileSize = 10,
  maxFiles = 5,
  className,
  folder = 'school-documents',
  autoUpload = true
}, ref) => {
  const [files, setFiles] = useState<MinimalUploadedFile[]>([]);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFileToCloudinary = async (file: MinimalUploadedFile): Promise<CloudinaryUploadResult | null> => {
    const fileIndex = files.findIndex(f => f.id === file.id);
    if (fileIndex === -1) return null;

    const updatedFiles = [...files];
    updatedFiles[fileIndex] = { ...file, uploading: true, error: undefined };
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    try {
      const result = await uploadToCloudinary(file.file, {
        folder,
        resourceType: getCloudinaryResourceType(file.file),
      });
      
      updatedFiles[fileIndex] = {
        ...file,
        uploading: false,
        uploaded: true,
        cloudinaryResult: result
      };
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      return result;
    } catch (err) {
      console.error('Upload error:', err);
      updatedFiles[fileIndex] = {
        ...file,
        uploading: false,
        uploaded: false,
        error: err instanceof Error ? err.message : 'Upload failed'
      };
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      return null;
    }
  };

  const uploadAllFiles = async (): Promise<CloudinaryUploadResult[]> => {
    setIsUploading(true);
    const results: CloudinaryUploadResult[] = [];

    try {
      for (const file of files) {
        if (!file.uploaded && !file.uploading) {
          const result = await uploadFileToCloudinary(file);
          if (result) results.push(result);
        } else if (file.cloudinaryResult) {
          results.push(file.cloudinaryResult);
        }
      }

      onUploadComplete?.(results);
      return results;
    } catch (err) {
      console.error('Error uploading files:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const getUploadedFiles = (): CloudinaryUploadResult[] => {
    return files
      .filter(f => f.uploaded && f.cloudinaryResult)
      .map(f => f.cloudinaryResult!);
  };

  const areAllFilesUploaded = (): boolean => {
    return files.length > 0 && files.every(f => f.uploaded);
  };

  const clearFiles = () => {
    setFiles([]);
    setError('');
    onFilesChange?.([]);
  };

  useImperativeHandle(ref, () => ({
    uploadAllFiles,
    getUploadedFiles,
    areAllFilesUploaded,
    clearFiles
  }));

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: MinimalUploadedFile[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        return;
      }

      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const uploadedFile: MinimalUploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        uploading: false,
        uploaded: false
      };

      newFiles.push(uploadedFile);
    });

    if (errors.length > 0) {
      setError(errors[0] as string);
      setTimeout(() => setError(''), 5000);
    } else {
      setError('');
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      if (autoUpload) {
        for (const file of newFiles) {
          await uploadFileToCloudinary(file);
        }
      }
    }
  }, [files, maxFiles, autoUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Button */}
      <button
        type="button"
        onClick={openFileDialog}
        className="w-full h-12 flex items-center gap-2 justify-start border-[#00296B] bg-white hover:bg-blue-50 transition-colors text-[#00296B] font-medium"
      >
        <DocumentIcon className="w-5 h-5" />
        Upload Supporting Document
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div 
              key={file.id} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                file.error ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
              )}
            >
              {/* File Icon */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded",
                file.uploaded ? "bg-green-100" : file.error ? "bg-red-100" : "bg-blue-100"
              )}>
                {file.uploading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : file.uploaded ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : file.error ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-600" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                  {file.uploading && ' - Uploading...'}
                  {file.uploaded && ' - Uploaded'}
                  {file.error && ` - ${file.error}`}
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                disabled={file.uploading}
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full transition-colors",
                  file.uploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                )}
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {!autoUpload && files.length > 0 && !areAllFilesUploaded() && (
        <button
          type="button"
          onClick={uploadAllFiles}
          disabled={isUploading}
          className={cn(
            "w-full h-10 rounded-lg font-medium transition-colors",
            isUploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#00296B] text-white hover:bg-[#002561]"
          )}
        >
          {isUploading ? 'Uploading...' : 'Upload All Files'}
        </button>
      )}
    </div>
  );
});

MinimalFileUpload.displayName = 'MinimalFileUpload';