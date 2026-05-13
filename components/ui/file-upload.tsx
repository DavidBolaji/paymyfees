'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { X, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentIcon } from '@/assets/icons/DocumentIcon';
import { CloudinaryUploadResult, uploadToCloudinary } from '@/src/utils/cloudinary-api';


export interface UploadedFile {
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

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  onUploadComplete?: (results: CloudinaryUploadResult[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  folder?: string; // Cloudinary folder
  autoUpload?: boolean; // Auto upload to Cloudinary on file select
  initialFiles?: UploadedFile[]; // Pre-populate from cached store state
}

export interface FileUploadRef {
  uploadAllFiles: () => Promise<CloudinaryUploadResult[]>;
  getUploadedFiles: () => CloudinaryUploadResult[];
  areAllFilesUploaded: () => boolean;
}

export const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({
  onFilesChange,
  onUploadComplete,
  acceptedTypes = ['.pdf', '.png', '.jpg', '.jpeg'],
  maxFileSize = 10,
  maxFiles = 10,
  className,
  folder = 'school-documents',
  autoUpload = false,
  initialFiles,
}, ref) => {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles ?? []);
  const [isDragOver, setIsDragOver] = useState(false);
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
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFileToCloudinary = async (file: UploadedFile): Promise<CloudinaryUploadResult | null> => {
    const fileIndex = files.findIndex(f => f.id === file.id);
    if (fileIndex === -1) return null;

    // Update file status to uploading
    const updatedFiles = [...files];
    updatedFiles[fileIndex] = { ...file, uploading: true, error: undefined };
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);

    try {
      const result = await uploadToCloudinary(file.file, { folder });
      
      // Update file with cloudinary result
      updatedFiles[fileIndex] = {
        ...file,
        uploading: false,
        uploaded: true,
        cloudinaryResult: result
      };
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      updatedFiles[fileIndex] = {
        ...file,
        uploading: false,
        uploaded: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
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
          if (result) {
            results.push(result);
          }
        } else if (file.cloudinaryResult) {
          results.push(file.cloudinaryResult);
        }
      }

      if (onUploadComplete) {
        onUploadComplete(results);
      }

      return results;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
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

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    uploadAllFiles,
    getUploadedFiles,
    areAllFilesUploaded
  }));

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
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

      const uploadedFile: UploadedFile = {
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
      setError(errors[0] || "An error occurred");
      setTimeout(() => setError(''), 5000);
    } else {
      setError('');
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

      // Auto upload if enabled
      if (autoUpload) {
        for (const file of newFiles) {
          await uploadFileToCloudinary(file);
        }
      }
    }
  }, [files, maxFiles, maxFileSize, acceptedTypes, onFilesChange, autoUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          "bg-gray-50 p-8 border-2 border-dashed rounded-lg h-56 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-[#00296B] bg-blue-50"
            : "border-[#00296B] hover:bg-blue-50"
        )}
      >
        <div className="flex justify-center items-center bg-[#00296B] mx-auto mb-4 rounded-lg w-12 h-12">
          <DocumentIcon className="w-6 h-6 text-white" />
        </div>
        <p className="mb-2 text-[#7C7C7C] text-sm">
          Drag & drop files or <span className="font-medium text-[#00296B]">Browse</span>
        </p>
        <p className="text-[#7C7C7C] text-xs">
          Supported formats: {acceptedTypes.join(', ').toUpperCase()}<br />
          Ensure all documents uploaded are legible and authentic.
        </p>
      </div>

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
        <div className="bg-red-50 p-3 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Upload All Button (if not auto-upload) */}
      {!autoUpload && files.length > 0 && !areAllFilesUploaded() && (
        <button
          type="button"
          onClick={uploadAllFiles}
          disabled={isUploading}
          className={cn(
            "w-full py-2 px-4 rounded-lg font-medium transition-colors",
            isUploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#00296B] text-white hover:bg-[#002561]"
          )}
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </span>
          ) : (
            'Upload All Files'
          )}
        </button>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                  "flex justify-center items-center rounded w-8 h-8",
                  file.uploaded ? "bg-green-100" : file.error ? "bg-red-100" : "bg-blue-100"
                )}>
                  {file.uploading ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : file.uploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#292929] text-sm">{file.name}</p>
                  <p className="text-[#7C7C7C] text-xs">
                    {formatFileSize(file.size)}
                    {file.uploading && ' - Uploading...'}
                    {file.uploaded && ' - Uploaded'}
                    {file.error && ` - ${file.error}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                disabled={file.uploading}
                className={cn(
                  "flex justify-center items-center rounded-full w-6 h-6 transition-colors",
                  file.uploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#00296B] hover:bg-[#002561]"
                )}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';