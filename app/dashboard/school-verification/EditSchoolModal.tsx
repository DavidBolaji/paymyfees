'use client';

import { useEffect, useState, useRef } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';
import { MinimalFileUpload, MinimalFileUploadRef, MinimalUploadedFile } from '@/components/ui/minimal-file-upload';
import { CloudinaryUploadResult } from '@/src/utils/cloudinary-api';
import { uploadSchoolDocuments } from '@/src/utils/document-api';

interface EditSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadProgress?: string;
  initialData: {
    schoolName?: string;
    academicSession?: string;
    note?: string;
  };
  onSave: (data: {
    schoolName: string;
    academicSession: string;
    note: string;
    documents?: CloudinaryUploadResult[];
  }) => void;
  schoolId?: string; // Add school ID for document upload
}

const academicSessionOptions = [
  { value: '2025/2026', label: '2025/2026' },
  { value: '2024/2025', label: '2024/2025' },
  { value: '2023/2024', label: '2023/2024' },
];

export default function EditSchoolModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  schoolId,
  uploadProgress
}: EditSchoolModalProps) {
  const [schoolName, setSchoolName] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [note, setNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<MinimalUploadedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileUploadRef = useRef<MinimalFileUploadRef>(null);

  useEffect(() => {
    if (isOpen) {
      setSchoolName(initialData.schoolName ?? '');
      setAcademicSession(initialData.academicSession ?? '');
      setNote(initialData.note ?? '');
      setUploadedFiles([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditSchool = async () => {
    setIsSaving(true);

    try {
      let documentResults: CloudinaryUploadResult[] = [];

      // Check if files need to be uploaded
      if (uploadedFiles.length > 0) {
        const allUploaded = fileUploadRef.current?.areAllFilesUploaded();

        if (allUploaded) {
          // Files already uploaded (auto-upload)
          documentResults = fileUploadRef.current?.getUploadedFiles() || [];
        } else if (fileUploadRef.current?.uploadAllFiles) {
          // Trigger upload manually
          documentResults = await fileUploadRef.current.uploadAllFiles();
        }

        // Save document records to database if schoolId is provided
        if (schoolId && documentResults.length > 0) {
          await uploadSchoolDocuments(schoolId, documentResults);
        }
      }

      // Save all data
      onSave({
        schoolName,
        academicSession,
        note,
        documents: documentResults.length > 0 ? documentResults : undefined,
      });

      onClose();
    } catch (error) {
      console.error('Error saving school details:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Clear files when closing
    fileUploadRef.current?.clearFiles();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2]"
        style={{
          width: '644px',
          maxWidth: '90vw',
          padding: '23px 15px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-5">
          <h3 className="text-2xl font-bold text-[#191919]">
            Edit School Details
          </h3>
        </div>

        {/* Content */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <CustomInput
              label="School Name"
              type="text"
              value={schoolName}
              onChange={setSchoolName}
              placeholder="Enter School Name"
            />
            <CustomInput
              label="Academic Session"
              type="select"
              value={academicSession}
              onChange={setAcademicSession}
              options={academicSessionOptions}
            />
          </div>

          {/* Note */}
          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-[#292929]">
              Reason for changing school details
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="w-full h-20 px-3 py-2 rounded-lg border border-[#d1d1d1] bg-[#f5f5f5] focus:outline-none text-[#292929] placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-[#292929]">
              Supporting Documents (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Upload updated admission letter, invoice, or other relevant documents
            </p>
            <MinimalFileUpload
              ref={fileUploadRef}
              onFilesChange={setUploadedFiles}
              acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
              maxFileSize={10}
              maxFiles={3}
              folder="school-updates"
              autoUpload={true}
            />
          </div>

          {uploadProgress && (
            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm text-center">
              {uploadProgress}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="h-12 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              onClick={handleEditSchool}
              disabled={isSaving}
              className="h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}