'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { MinimalFileUpload, MinimalFileUploadRef, MinimalUploadedFile } from '@/components/ui/minimal-file-upload';
import { CloudinaryUploadResult } from '@/src/utils/cloudinary-api';
import { api } from '@/src/lib/api';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (ticket: any) => void;
}

const SUPPORT_CATEGORIES = [
    'Loan Application',
    'Payment Issue',
    'Disbursement Delay',
    'Account Access',
    'Verification Issue',
    'Technical Problem',
    'Document Upload',
    'General Inquiry',
    'Other',
];

export default function ContactSupportModal({
    isOpen,
    onClose,
    onSuccess,
}: ContactSupportModalProps) {
    const [category, setCategory] = useState('');
    const [summary, setSummary] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<MinimalUploadedFile[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState('');
    const fileUploadRef = useRef<MinimalFileUploadRef>(null);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const resetForm = () => {
        setCategory('');
        setSummary('');
        setUploadedFiles([]);
        setUploadProgress('');
        setError('');
    };

    const handleSubmit = async () => {
        setError('');

        // Validate inputs
        if (!category) {
            setError('Please select a support category');
            return;
        }

        if (!summary || summary.trim().length < 10) {
            setError('Please provide a detailed description (at least 10 characters)');
            return;
        }

        setIsSaving(true);
        setUploadProgress('Preparing your request...');

        try {
            let documentResults: CloudinaryUploadResult[] = [];

            // Handle file uploads if any
            if (uploadedFiles.length > 0) {
                setUploadProgress('Uploading documents...');

                const allUploaded = fileUploadRef.current?.areAllFilesUploaded();

                if (allUploaded) {
                    // Files already uploaded (auto-upload)
                    documentResults = fileUploadRef.current?.getUploadedFiles() || [];
                } else if (fileUploadRef.current?.uploadAllFiles) {
                    // Trigger upload manually
                    documentResults = await fileUploadRef.current.uploadAllFiles();
                }
            }

            setUploadProgress('Submitting your support ticket...');

            // Submit to API
            const response = await api.post('/api/support/tickets', {
                category,
                summary: summary.trim(),
                documents: documentResults.length > 0 ? documentResults : undefined,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit support ticket');
            }

            setUploadProgress('Support ticket submitted successfully!');

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(data.data);
            }

            // Reset form and close modal after brief delay
            setTimeout(() => {
                resetForm();
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Error submitting support ticket:', error);
            setError(error instanceof Error ? error.message : 'Failed to submit support ticket. Please try again.');
            setUploadProgress('');
        } finally {
            setIsSaving(false);
        }
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
                <div className="flex items-center w-full justify-center mb-5">
                    <h3 className="text-2xl font-bold text-[#191919]">
                        Contact Support
                    </h3>
                </div>

                {/* Content */}
                <div className="space-y-5">
                    {/* Support Category Dropdown */}
                    <div className="flex flex-col space-y-1">
                        <label className="font-semibold text-[#292929]">
                            Support Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-12 px-3 rounded-lg border border-[#d1d1d1] bg-[#f5f5f5] focus:outline-none focus:border-[#00296B] text-[#292929]"
                            disabled={isSaving}
                        >
                            <option value="">Choose support category</option>
                            {SUPPORT_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Issue Summary */}
                    <div className="flex flex-col space-y-1">
                        <label className="font-semibold text-[#292929]">
                            Issue Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Provide more details so we can assist you faster. Include any reference numbers, dates, or screenshots if available."
                            className="w-full h-32 px-3 py-2 rounded-lg border border-[#d1d1d1] bg-[#f5f5f5] focus:outline-none focus:border-[#00296B] text-[#292929] placeholder:text-gray-400 resize-none"
                            disabled={isSaving}
                            maxLength={5000}
                        />
                        <p className="text-xs text-gray-500 text-right">
                            {summary.length}/5000 characters
                        </p>
                    </div>

                    {/* File Upload */}
                    <div className="flex flex-col space-y-1">
                        <label className="font-semibold text-[#292929]">
                            Supporting Documents (Optional)
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                            Upload screenshots, invoices, or other relevant documents
                        </p>
                        <MinimalFileUpload
                            ref={fileUploadRef}
                            onFilesChange={setUploadedFiles}
                            acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
                            maxFileSize={10}
                            maxFiles={3}
                            folder="support-tickets"
                            autoUpload={true}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm text-center">
                            {uploadProgress}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            disabled={isSaving}
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="h-12 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5" />
                            Cancel
                        </button>

                        <button
                            disabled={isSaving || !category || !summary}
                            onClick={handleSubmit}
                            className="h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckSquareIcon className="w-5 h-5" />
                            {isSaving ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}