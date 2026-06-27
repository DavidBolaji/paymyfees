'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Upload, X, CheckCircle, Loader2, AlertCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/components/ui/file-upload';
import { CloudinaryUploadResult, uploadToCloudinary, getCloudinaryResourceType } from '@/src/utils/cloudinary-api';

const DEFAULT_ACCEPT = ['.pdf', '.jpg', '.jpeg', '.png'];
const PHOTO_ACCEPT = ['.jpg', '.jpeg', '.png'];

interface DocumentSlot {
  id: string;
  label: string;
  hint?: string;
  required: boolean;
  accept: string[];
  multiple: boolean;
  sensitive?: boolean;
}

const DOCUMENT_SLOTS: DocumentSlot[] = [
  { id: 'nin',            label: 'NIN Slip',                        required: true,  accept: DEFAULT_ACCEPT, multiple: false, sensitive: true },
  { id: 'salary',         label: 'Salary Slips',                    required: false, accept: DEFAULT_ACCEPT, multiple: true  },
  { id: 'bank_statement', label: 'Bank Statement',  hint: 'Last 3 months', required: true,  accept: DEFAULT_ACCEPT, multiple: false },
  { id: 'proof_of_address', label: 'Proof of Address',              required: true,  accept: DEFAULT_ACCEPT, multiple: false },
  { id: 'school_invoice', label: 'School Fees Invoice / Offer Letter', required: true, accept: DEFAULT_ACCEPT, multiple: false },
  { id: 'school_receipts', label: 'School Fees Receipts', hint: 'Last 2 terms', required: true, accept: DEFAULT_ACCEPT, multiple: true },
  { id: 'parent_photo',   label: 'Passport Photo — Parent/Guardian', required: true,  accept: PHOTO_ACCEPT,   multiple: false },
  { id: 'student_photo',  label: 'Passport Photo — Student',        required: true,  accept: PHOTO_ACCEPT,   multiple: false },
  { id: 'other',          label: 'Other Supporting Documents',      required: false, accept: DEFAULT_ACCEPT, multiple: true  },
];

type SlotState = Record<string, UploadedFile[]>;

export interface DocumentUploadListRef {
  uploadAllFiles: () => Promise<CloudinaryUploadResult[]>;
  areAllRequiredUploaded: () => boolean;
}

interface DocumentUploadListProps {
  onFilesChange: (files: UploadedFile[]) => void;
  folder?: string;
}

export const DocumentUploadList = forwardRef<DocumentUploadListRef, DocumentUploadListProps>(
  ({ onFilesChange, folder = 'loan-documents' }, ref) => {
    const initialState: SlotState = Object.fromEntries(DOCUMENT_SLOTS.map(s => [s.id, []]));
    const [slotFiles, setSlotFiles] = useState<SlotState>(initialState);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Always-fresh refs — no stale closures, no useCallback dependency arrays to manage
    const slotFilesRef = useRef(slotFiles);
    slotFilesRef.current = slotFiles;
    const onFilesChangeRef = useRef(onFilesChange);
    onFilesChangeRef.current = onFilesChange;

    // Notify parent whenever slot files change
    useEffect(() => {
      onFilesChangeRef.current(Object.values(slotFiles).flat());
    }, [slotFiles]);

    const updateFileStatus = (slotId: string, fileId: string, updates: Partial<UploadedFile>) => {
      setSlotFiles(prev => ({
        ...prev,
        [slotId]: (prev[slotId] ?? []).map(f => f.id === fileId ? { ...f, ...updates } : f),
      }));
    };

    const uploadFile = async (slotId: string, file: UploadedFile): Promise<CloudinaryUploadResult | null> => {
      const slot = DOCUMENT_SLOTS.find(s => s.id === slotId);
      const uploadFolder = slot?.sensitive ? `${folder}/sensitive` : folder;
      const tags = slot?.sensitive ? ['sensitive', slotId] : [slotId];

      updateFileStatus(slotId, file.id, { uploading: true, error: undefined });
      try {
        const result = await uploadToCloudinary(file.file, {
          folder: uploadFolder,
          tags,
          resourceType: getCloudinaryResourceType(file.file),
        });
        updateFileStatus(slotId, file.id, { uploading: false, uploaded: true, cloudinaryResult: result });
        return result;
      } catch (err) {
        updateFileStatus(slotId, file.id, {
          uploading: false,
          uploaded: false,
          error: err instanceof Error ? err.message : 'Upload failed',
        });
        return null;
      }
    };

    const handleFileSelect = async (slotId: string, slot: DocumentSlot, e: React.ChangeEvent<HTMLInputElement>) => {
      // Copy File objects into a plain array BEFORE resetting the input —
      // some browsers clear the live FileList when input.value is set to ''.
      const rawFiles = Array.from(e.target.files ?? []);
      e.target.value = '';

      if (rawFiles.length === 0) return;

      const newFiles: UploadedFile[] = rawFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        uploading: false,
        uploaded: false,
      }));

      setSlotFiles(prev => ({
        ...prev,
        [slotId]: slot.multiple ? [...(prev[slotId] ?? []), ...newFiles] : newFiles,
      }));

      for (const file of newFiles) {
        await uploadFile(slotId, file);
      }
    };

    const removeFile = (slotId: string, fileId: string) => {
      setSlotFiles(prev => ({
        ...prev,
        [slotId]: (prev[slotId] ?? []).filter(f => f.id !== fileId),
      }));
    };

    const uploadAllFiles = async (): Promise<CloudinaryUploadResult[]> => {
      const results: CloudinaryUploadResult[] = [];
      for (const [slotId, files] of Object.entries(slotFilesRef.current)) {
        for (const file of files) {
          if (file.uploaded && file.cloudinaryResult) {
            results.push(file.cloudinaryResult);
          } else if (!file.uploading) {
            const result = await uploadFile(slotId, file);
            if (result) results.push(result);
          }
        }
      }
      return results;
    };

    const areAllRequiredUploaded = () =>
      DOCUMENT_SLOTS.filter(s => s.required).every(
        s => slotFilesRef.current[s.id]?.some(f => f.uploaded)
      );

    useImperativeHandle(ref, () => ({ uploadAllFiles, areAllRequiredUploaded }));

    const requiredSlots = DOCUMENT_SLOTS.filter(s => s.required);
    const requiredTotal = requiredSlots.length;
    const requiredDone = requiredSlots.filter(s => slotFiles[s.id]?.some(f => f.uploaded)).length;

    return (
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[#7C7C7C] text-xs">Required documents</span>
            <span className={cn(
              "text-xs font-semibold tabular-nums",
              requiredDone === requiredTotal ? "text-green-600" : "text-[#00296B]"
            )}>
              {requiredDone} / {requiredTotal} uploaded
            </span>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                requiredDone === requiredTotal ? "bg-green-500" : "bg-[#00296B]"
              )}
              style={{ width: requiredTotal ? `${(requiredDone / requiredTotal) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Document slots */}
        <div className="space-y-1.5">
          {DOCUMENT_SLOTS.map((slot, index) => {
            const files = slotFiles[slot.id] ?? [];
            const isUploaded = files.some(f => f.uploaded);
            const isUploading = files.some(f => f.uploading);
            const hasError = files.some(f => f.error);
            const hasFile = files.length > 0;

            return (
              <div
                key={slot.id}
                className={cn(
                  "border rounded-xl p-3 transition-all duration-200",
                  isUploaded && !isUploading
                    ? "border-green-200 bg-green-50"
                    : hasError
                    ? "border-red-200 bg-red-50"
                    : isUploading
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Status circle */}
                  <div className={cn(
                    "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold mt-0.5",
                    isUploaded && !isUploading ? "bg-green-100 text-green-600"
                      : hasError                ? "bg-red-100 text-red-500"
                      : isUploading             ? "bg-blue-100 text-blue-600"
                      :                          "bg-gray-100 text-gray-500"
                  )}>
                    {isUploaded && !isUploading ? <CheckCircle className="w-3.5 h-3.5" />
                      : isUploading             ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : hasError               ? <AlertCircle className="w-3.5 h-3.5" />
                      :                          index + 1}
                  </div>

                  {/* Label + uploaded files */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-[#292D32] text-sm leading-tight">
                        {slot.label}
                      </span>
                      {slot.hint && (
                        <span className="text-[#7C7C7C] text-[11px]">({slot.hint})</span>
                      )}
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-tight",
                        slot.required ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                      )}>
                        {slot.required ? 'Required' : 'Optional'}
                      </span>
                      {slot.sensitive && (
                        <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                          <Lock className="w-2.5 h-2.5" />
                          Encrypted
                        </span>
                      )}
                    </div>

                    {files.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {files.map(file => (
                          <div key={file.id} className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-xs truncate max-w-[200px]",
                              file.uploaded ? "text-green-700"
                                : file.error ? "text-red-600"
                                :              "text-[#7C7C7C]"
                            )}>
                              {file.name}
                              {file.uploading ? ' · uploading…' : ''}
                              {file.error ? ` · ${file.error}` : ''}
                            </span>
                            {!file.uploading && (
                              <button
                                type="button"
                                onClick={() => removeFile(slot.id, file.id)}
                                className="flex-shrink-0 p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload button — hidden for single-slot once a file exists */}
                  {(!hasFile || slot.multiple) && (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[slot.id]?.click()}
                      disabled={isUploading}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors",
                        isUploading
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#00296B] text-white hover:bg-[#002561]"
                      )}
                    >
                      <Upload className="w-3 h-3" />
                      {hasFile && slot.multiple ? 'Add' : 'Upload'}
                    </button>
                  )}
                </div>

                {/* Hidden file input per slot */}
                <input
                  ref={el => { fileInputRefs.current[slot.id] = el; }}
                  type="file"
                  multiple={slot.multiple}
                  accept={slot.accept.join(',')}
                  onChange={e => handleFileSelect(slot.id, slot, e)}
                  className="hidden"
                />
              </div>
            );
          })}
        </div>

        <p className="text-[#7C7C7C] text-xs">
          Accepted: PDF, JPG, PNG · Max 10 MB per file · Ensure all documents are legible and authentic.
        </p>
      </div>
    );
  }
);

DocumentUploadList.displayName = 'DocumentUploadList';
