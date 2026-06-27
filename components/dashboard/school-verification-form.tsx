'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { validateSchoolApplication, type SchoolVerficationFormData } from '@/data';
import { useSchoolProfile } from '@/hooks/useSchoolProfile';
import { RegisterSchoolPayload } from '@/src/utils/school-api';
import { CloudinaryUploadResult } from '@/src/utils/cloudinary-api';
import { uploadSchoolDocuments } from '@/src/utils/document-api';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';

interface FormErrors {
    schoolName?: string;
    academicSession?: string;
    academicLevel?: string;
    address?: string;
    schoolPhone?: string;
    schoolEmail?: string;
    schoolType?: string;
    website?: string;
    yearEstablished?: string;
    registrationNumber?: string;
    uploadedFiles?: string;
    consents?: {
        terms?: string
    }
}
// Academic session options
export const academicSessionOptions = [
    { value: '', label: 'Select Academic Session' },
    { value: '2025/2026', label: '2025/2026' },
    { value: '2024/2025', label: '2024/2025' },
    { value: '2023/2024', label: '2023/2024' }
];

export function SchoolVerificationForm({ onSuccess }: { onSuccess?: () => void }) {
    const { registerSchool } = useSchoolProfile();
    const fileUploadRef = useRef<any>(null);
    // Form state
    const [formData, setFormData] = useState<Partial<SchoolVerficationFormData>>({
        schoolName: '',
        academicLevel: '',
        address: '',
        schoolPhone: '',
        schoolEmail: '',
        academicSession: '',
        schoolType: '',
        website: '',
        yearEstablished: '',
        registrationNumber: '',
        uploadedFiles: [],
        consents: {
            terms: true
        }
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');


    const schoolTypeOptions = [
        { value: '', label: 'Select School Type' },
        { value: 'Primary', label: 'Primary' },
        { value: 'Secondary', label: 'Secondary' },
        { value: 'Tertiary', label: 'Tertiary' },
        { value: 'Vocational', label: 'Vocational' },
        { value: 'International', label: 'International' },
    ];

    // Academic session options
    const academicLevelOptions = [
        { value: '', label: 'Select Academic Level' },
        { value: 'Primary School', label: 'Primary School' },
        { value: 'Secondary School', label: 'Secondary School' },
        { value: 'Undergraduate', label: 'Undergraduate' },
        { value: 'Postgraduate', label: 'Postgraduate' },
    ];

    // Form handlers
    const handleInputChange = (field: keyof SchoolVerficationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleConsentChange = (key: keyof NonNullable<SchoolVerficationFormData['consents']>, _checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            consents: {
                terms: prev.consents?.terms || false,
            }
        }));

        // Clear consent error
        if (errors.consents?.[key]) {
            setErrors(prev => ({
                ...prev,
                consents: {
                    ...prev.consents,
                    [key]: undefined
                }
            }));
        }
    };



    const validateForm = (): boolean => {
        const result = validateSchoolApplication(formData);

        if (!result.isValid) {
            const formErrors: FormErrors = {};

            Object.entries(result.errors).forEach(([key, message]) => {
                if (key.startsWith('consents.')) {
                    const consentField = key.split('.')[1] as keyof NonNullable<FormErrors['consents']>;
                    formErrors.consents = {
                        ...formErrors.consents,
                        [consentField]: message
                    };
                } else {
                    (formErrors as any)[key] = message;
                }
            });

            setErrors(formErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        console.log(formData)

        try {
            // Prepare payload (exclude files and consents from API payload)
            const payload: RegisterSchoolPayload = {
                schoolName: formData.schoolName!,
                schoolAddress: formData.address!,
                schoolPhone: formData.schoolPhone!,
                schoolEmail: formData.schoolEmail!,
                academicLevel: formData.academicLevel!,
                currentAcademicSession: formData.academicSession!,
                schoolType: formData.schoolType!,
                website: formData.website!,
                yearEstablished: parseInt(formData.yearEstablished!),
                registrationNumber: formData.registrationNumber!,
            };
            // Register school
            const school = await registerSchool(payload);

            if (!school) {
                throw new Error('Failed to register school');
            }

            // Step 2: Upload files to Cloudinary and save to database
            if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
                setUploadProgress('Uploading documents to cloud storage...');

                // Check if files are already uploaded to Cloudinary
                const uploadedFiles = formData.uploadedFiles.filter(f => f.uploaded && f.cloudinaryResult);

                let cloudinaryResults: CloudinaryUploadResult[];

                if (uploadedFiles.length === formData.uploadedFiles.length) {
                    // All files already uploaded (auto-upload was enabled)
                    cloudinaryResults = uploadedFiles.map(f => f.cloudinaryResult!);
                } else {
                    // Need to manually trigger upload
                    // This assumes FileUpload component exposes uploadAllFiles method
                    if (fileUploadRef.current?.uploadAllFiles) {
                        cloudinaryResults = await fileUploadRef.current.uploadAllFiles();
                    } else {
                        // Fallback: use already uploaded files
                        cloudinaryResults = uploadedFiles.map(f => f.cloudinaryResult!);
                    }
                }

                if (cloudinaryResults.length > 0) {
                    setUploadProgress('Saving document records...');

                    // Save document records to database
                    const savedDocuments = await uploadSchoolDocuments(school.id, cloudinaryResults);

                    console.log('Documents saved:', savedDocuments);
                }
            }

            setUploadProgress('');
            onSuccess?.();

            // Reset form
            setFormData({
                schoolName: '',
                academicSession: '',
                academicLevel: '',
                address: '',
                schoolPhone: '',
                schoolEmail: '',
                schoolType: '',
                website: '',
                yearEstablished: '',
                registrationNumber: '',
                uploadedFiles: [],
                consents: {
                    terms: false
                }
            });

        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? All form data will be lost.')) {
            setFormData({
                schoolName: '',
                academicLevel: '',
                address: '',
                schoolPhone: '',
                schoolEmail: '',
                academicSession: '',
                schoolType: '',
                website: '',
                yearEstablished: '',
                registrationNumber: '',
                uploadedFiles: [],
                consents: {
                    terms: false
                }
            });
            setErrors({});
        }
    };

    const isFormValid = () => {
        return formData.schoolName &&
            formData.academicSession &&
            formData.academicLevel &&
            formData.address &&
            formData.schoolPhone &&
            formData.schoolEmail &&
            formData.schoolType &&
            formData.website &&
            formData.yearEstablished &&
            formData.registrationNumber &&
            formData.uploadedFiles &&
            formData.uploadedFiles.length > 0 &&
            formData.consents?.terms;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">


            <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                {/* Left Column - School & Tuition Details */}
                <div className="space-y-6 bg-white p-4 rounded-xl border border-[#ECECEC]">
                    <div>
                        <h3 className="mb-4 font-semibold text-[#292D32] text-[18px]">
                            School Information
                        </h3>

                        <div className="space-y-4">
                            <FormInput
                                label="School Name"
                                placeholder="Enter School Name"
                                value={formData.schoolName || ''}
                                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                                error={errors.schoolName}
                            />

                            <FormSelect
                                label="Academic Level"
                                options={academicLevelOptions}
                                value={formData.academicLevel || ''}
                                onChange={(e) => handleInputChange('academicLevel', e.target.value)}
                                error={errors.academicLevel}
                            />

                            <FormInput
                                label="School Address"
                                placeholder="Enter School Address"
                                value={formData.address || ''}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                error={errors.address}
                            />

                            <FormInput
                                label="School Phone Number"
                                placeholder="Enter School Phone Number"
                                value={formData.schoolPhone || ''}
                                onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                                error={errors.schoolPhone}
                            />

                            <FormInput
                                label="School Email"
                                placeholder="Enter School Email Address"
                                value={formData.schoolEmail || ''}
                                onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                                error={errors.schoolEmail}
                            />

                            <FormSelect
                                label="School Type"
                                options={schoolTypeOptions}
                                value={formData.schoolType || ''}
                                onChange={(e) => handleInputChange('schoolType', e.target.value)}
                                error={errors.schoolType}
                            />

                            <FormInput
                                label="Website"
                                placeholder="https://schoolwebsite.com"
                                value={formData.website || ''}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                                error={errors.website}
                            />

                            <FormInput
                                label="Year Established"
                                placeholder="e.g. 1995"
                                type="number"
                                value={formData.yearEstablished || ''}
                                onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                                error={errors.yearEstablished}
                            />

                            <FormInput
                                label="Registration Number"
                                placeholder="e.g. CAC/BN/1234567"
                                value={formData.registrationNumber || ''}
                                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                                error={errors.registrationNumber}
                            />

                            <FormSelect
                                label="Academic Session"
                                options={academicSessionOptions}
                                value={formData.academicSession || ''}
                                onChange={(e) => handleInputChange('academicSession', e.target.value)}
                                error={errors.academicSession}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Upload Files */}
                <div className="space-y-6 bg-white p-4 rounded-xl border border-[#ECECEC]">
                    <div>
                        <h3 className="mb-2 font-semibold text-[#292D32] text-[18px]">
                            Upload Files
                        </h3>
                        <p className="mb-4 text-[#7C7C7C] text-sm">
                            Upload School Invoice / Admission Letter
                        </p>

                        <FileUpload
                            ref={fileUploadRef}
                            onFilesChange={(files) => handleInputChange('uploadedFiles', files)}
                            acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
                            maxFileSize={10}
                            maxFiles={5}
                            folder="school-documents"
                            autoUpload={true}
                        />

                        {errors.uploadedFiles && (
                            <p className="mt-2 text-red-600 text-sm">{errors.uploadedFiles}</p>
                        )}
                    </div>
                </div>
            </div>



            {/* Transparency & Consent */}
            <div className="space-y-4 p-4">
                <h3 className="font-semibold text-[#292D32] text-[18px]">
                    Transparency & Consent
                </h3>

                <div className="space-y-4">

                    <Checkbox
                        checked={formData.consents?.terms || false}
                        onChange={(checked) => handleConsentChange('terms', checked)}
                        label="I confirm that the information provided is accurate and belongs to me."
                        error={errors.consents?.terms}
                    />
                </div>

            </div>

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm text-center">
                    {uploadProgress}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="flex flex-1 justify-center items-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg h-12 font-medium text-gray-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className={cn(
                        "flex flex-1 justify-center items-center gap-2 rounded-lg h-12 font-medium transition-colors",
                        isFormValid() && !isSubmitting
                            ? "bg-[#00296B] text-white hover:bg-[#002561]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckSquareIcon />
                            <span className="sm:hidden">Save</span>
                            <span className="hidden sm:inline">Save & Update Details</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}