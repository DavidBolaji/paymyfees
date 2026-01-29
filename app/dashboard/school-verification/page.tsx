'use client';

import { useEffect, useState } from 'react';
import { StatusBadge2 } from '@/components/dashboard/status-badge';
import { VERIFICATION_LOGS_COLUMNS } from '@/data';
import { DataTable, StatCard } from '@/components/dashboard';
import { SchoolVerificationForm } from '@/components/dashboard/school-verification-form';
import SupportMessageCard from '@/components/dashboard/support-message-card';
import { useSchoolProfile } from '@/hooks/useSchoolProfile';
import { cn, getSchoolScores } from '@/lib/utils';
import EditSchoolModal from './EditSchoolModal';
import { Megaphone } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ContactSupportModal from './ContactSupportModal';
import { uploadSchoolDocuments } from '@/src/utils/document-api';
import ContactSuccessModal from './ContactSuccessModal';

export default function SchoolVerificationPage() {
  const {
    fetchAllData,
    profile,
    isOperating,
    verificationRequests,
    verificationLogs,
    updateProfile,
    schools,
    currentSchool,

    selectedSchoolId,
    selectSchool,
    supportMessages,
    unreadSupportCount,
    markMessageAsRead,
  } = useSchoolProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isVerifying,] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Fetch school data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Calculate dynamic scores
  const scores = getSchoolScores(profile, verificationLogs);

  // Get helper text based on scores
  const getAcademicScoreFooter = () => {
    if (scores.academicScore === 0) return 'Status will be full when verified fully';
    if (scores.academicScore >= 80) return 'Excellent verification status';
    if (scores.academicScore >= 60) return 'Good verification progress';
    if (scores.academicScore >= 40) return 'Continue verification process';
    return 'Complete verification to improve score';
  };

  const getProfileCompletionFooter = () => {
    if (scores.profileCompletionRate >= 90) return 'Profile is complete';
    if (scores.profileCompletionRate >= 70) return 'Almost there! Few fields remaining';
    if (scores.profileCompletionRate >= 50) return 'Complete remaining fields';
    return 'Please complete your profile';
  };

  const getEligibilityFooter = () => {
    const strength = scores.eligibilityStrength;
    if (scores.academicScore === 0) return 'Affected by constant loan defaulting';
    if (strength === 'Excellent' || strength === 'Strong') return 'Ready for disbursements';
    if (strength === 'Good') return 'Good standing, keep improving';
    if (strength === 'Moderate') return 'Improve profile to increase eligibility';
    return 'Complete verification to improve eligibility';
  };

  const getVerificationTimelineFooter = () => {
    if (scores.verificationStatus === 'Completed') {
      return profile?.verifiedAt
        ? `Verified on ${new Date(profile.verifiedAt).toLocaleDateString()}`
        : 'Verification complete';
    }
    if (scores.verificationStatus === 'Under Review') {
      return `${verificationRequests.filter((r) => r.status === 'PENDING').length} requests pending`;
    }
    if (scores.verificationStatus === 'In Progress') {
      return profile?.createdAt
        ? `Started ${new Date(profile.createdAt).toLocaleDateString()}`
        : 'Verification in progress';
    }
    return 'Begin your verification journey';
  };

  const handleVerification = () => {
    scores.academicScore > 1
  }

   const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectSchool(e.target.value);
  };

  if (isOperating) {
    return (
      <div className="flex justify-center items-center p-6 h-screen">
        <div className="border-4 border-[#00296B] border-t-transparent rounded-full w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <>

      <div className="p-6">
        <div className="">
          <h2 className="mb-[0.56rem] font-semibold text-[#191919] text-[1.6875rem]">
            School Verification
          </h2>
          <p className="mb-[1.375rem] font-semibold text-[#5F5F5F] text-lg">
            Verify your school information to maintain eligibility and ensure smooth access to
            student financing.
          </p>

          {/* Stats Grid */}
          <div className="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Academic Verification Score"
              value={scores.academicScore === 0 ? '-' : `${scores.academicScore}/100`}
              footer={getAcademicScoreFooter()}
              variant="primary"
            />

            <StatCard
              title="Profile Completion Rate"
              value={scores.profileCompletionRate === 0 ? '-' : `${scores.profileCompletionRate}%`}
              subtitle={
                scores.profileCompletionRate === 0
                  ? ''
                  : scores.profileCompletionRate < 100
                    ? 'Incomplete'
                    : 'Complete'
              }
              footer={getProfileCompletionFooter()}
              variant="default"
            />

            <StatCard
              title="Eligibility Strength"
              value={scores.academicScore === 0 ? '-' : scores.eligibilityStrength}
              footer={getEligibilityFooter()}
              variant="default"
            />

            <StatCard
              title="Verification Timeline"
              value={scores.academicScore === 0 ? '-' : scores.verificationStatus}
              footer={getVerificationTimelineFooter()}
              variant="default"
            />
          </div>

          {/* Current School Information */}
          <div className="px-5 py-6 bg-white rounded-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3>Current School Information</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-4 py-2.5 rounded-lg font-medium text-white transition-colors">
                Edit Details
              </button>
            </div>

            {schools.length > 1 && (
              <div className="mb-4">
                <label className="block mb-2">Select School</label>
                <select
                  value={selectedSchoolId || ''}
                  onChange={handleSchoolChange}
                  className="border px-4 py-2 rounded"
                >
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.schoolName} {school.isPrimary && '(Primary)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-[#E6EAF0] grid grid-cols-4 py-4 rounded-lg h-24 mb-4">
              <div className="text-center border border-r-[#CFCFCF]">
                <div>School Name</div>
                <div>{currentSchool?.schoolName ?? '-'}</div>
              </div>

              <div className="text-center border border-r-[#CFCFCF]">
                <div>Program</div>
                <div>-</div>
              </div>

              <div className="text-center border border-r-[#CFCFCF]">
                <div>Level</div>
                <div>{currentSchool?.academicLevel ?? '-'}</div>
              </div>

              <div className="text-center">
                <div>Status</div>
                <div>
                  {profile?.academicLevel ? (
                    <StatusBadge2 status={currentSchool?.isVerified ? 'VERIFIED' : 'PENDING'} />
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-[#191919] font-medium text-xl mb-4">New Information</h3>
            <SchoolVerificationForm />
          </div>

          {/* Verification Logs and Support Messages */}
          <div className="flex gap-4">
            <div className="flex-[0.7]">
              <DataTable
                title="Verification Logs"
                columns={VERIFICATION_LOGS_COLUMNS}
                data={verificationLogs}
                viewAllHref="/dashboard/verifications"
                paginationInfo={undefined}
                onPageChange={() => { }}
                itemsPerPage={6}
                isLoading={false}
                onRowClick={(log) => {
                  console.log('Log clicked:', log);
                }}
              />
            </div>
            <div className="flex-[0.3]">
              <SupportMessageCard
                messages={supportMessages}
                unreadCount={unreadSupportCount}
                onMarkAsRead={markMessageAsRead}
              />
            </div>
          </div>

          <div className="space-y-4 p-4">
            <h3 className="font-semibold text-[#292D32] text-[18px]">
              Important Notices
            </h3>

            <div className="space-y-4">
              <Checkbox
                checked={scores.academicScore > 1 ? true : false}
                label="Your verification score affects your access to loans and repayment extensions."
              />
              <Checkbox
                checked={scores.academicScore > 1 ? true : false}
                label="Changes to school details may temporarily pause disbursements."
              />
              <Checkbox
                checked={scores.academicScore > 1 ? true : false}
                label="International verifications require more time due to timezone differences and documentation format."
              />

            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              onClick={handleVerification}
              className={cn(
                "flex flex-1 justify-center items-center gap-2 rounded-lg h-12 font-medium transition-colors",
                scores.academicScore > 1
                  ? "bg-[#00296B] text-white hover:bg-[#002561]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {isVerifying ? (
                <>
                  <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  View Verification Status
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="flex flex-1 justify-center items-center gap-2 border-2 bg-white border-gray-300 hover:border-gray-400 rounded-lg h-12 font-medium text-gray-600 transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Contact support
            </button>
          </div>
        </div>
      </div>
      {/* Edit School Modal */}
      <EditSchoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={{
          schoolName: currentSchool?.schoolName ?? '',
          academicSession: currentSchool?.currentAcademicSession ?? '',
          note: '',
        }}
        uploadProgress={uploadProgress}
        onSave={async (data) => {
          const { documents, ...rest } = data;

          try {
            setUploadProgress('Updating school profile...');
            await updateProfile(currentSchool?.id as string, rest);

            if (documents && documents.length > 0 && currentSchool?.id) {
              setUploadProgress('Saving document records...');
              const savedDocuments = await uploadSchoolDocuments(currentSchool.id, documents);
              console.log('Documents saved:', savedDocuments);
            }

            setUploadProgress('Refreshing data...');
            await fetchAllData();

            setUploadProgress('');
            alert('School details updated successfully!');
          } catch (error) {
            console.error('Error updating school:', error);
            alert('Failed to update school details. Please try again.');
          } finally {
            setUploadProgress('');
          }
        }}

      />

      {/* Edit School Modal */}
      <ContactSupportModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={() => setIsSuccessModalOpen(true)}
      />

      <ContactSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  );
}