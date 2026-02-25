'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';
import { SchoolDetailDrawer } from '@/components/dashboard/school-detail-drawer';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
import { Modal } from '@/components/ui/modal';
import { CustomInput } from '@/components/ui/custom-input';

const LOAN_COLUMNS = [
  { key: 'loanNumber', label: 'Loan Number' },
  { key: 'userName', label: 'Applicant' },
  { key: 'schoolName', label: 'School' },
  { key: 'loanAmount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'applicationDate', label: 'Date' },
];

const SCHOOL_COLUMNS = [
  { key: 'schoolName', label: 'School Name' },
  { key: 'schoolEmail', label: 'Email' },
  { key: 'city', label: 'City' },
  { key: 'totalStudents', label: 'Students' },
  { key: 'isVerified', label: 'Status' },
  { key: 'createdAt', label: 'Registered' },
];

const ACTIVITY_OPTIONS = [
  { value: 'SUBMISSION_RECEIVED', label: 'Submission Received' },
  { value: 'DOCUMENT_REVIEW', label: 'Document Review' },
  { value: 'SCHOOL_VERIFICATION', label: 'School Verification' },
  { value: 'BANK_VERIFICATION', label: 'Bank Verification' },
  { value: 'CONTACT_VERIFICATION', label: 'Contact Verification' },
  { value: 'ADDITIONAL_INFO_REQUESTED', label: 'Additional Info Requested' },
  { value: 'VERIFICATION_COMPLETE', label: 'Verification Complete' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REQUIRES_INFO', label: 'Requires Info' },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loanPagination, setLoanPagination] = useState<any>(null);
  const [schoolPagination, setSchoolPagination] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showSchoolDrawer, setShowSchoolDrawer] = useState(false);
  const [loadingSchoolDetails, setLoadingSchoolDetails] = useState(false);
  
  // Loan drawer state
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showLoanDrawer, setShowLoanDrawer] = useState(false);
  const [loadingLoanDetails, setLoadingLoanDetails] = useState(false);
  
  // Approval/Rejection modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [modalType, setModalType] = useState<'loan' | 'school'>('school');
  
  // Log modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    activity: '',
    details: '',
    status: 'IN_PROGRESS'
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, loansRes, schoolsRes] = await Promise.all([
        api.get('/api/admin/analytics'),
        api.get('/api/admin/loans?page=1&limit=5'),
        api.get('/api/admin/schools?page=1&limit=5')
      ]);

      const analyticsData = await analyticsRes.json();
      const loansData = await loansRes.json();
      const schoolsData = await schoolsRes.json();

      setAnalytics(analyticsData.data);
      setLoans(loansData.data || []);
      setSchools(schoolsData.data || []);
      setLoanPagination(loansData.metadata?.pagination);
      setSchoolPagination(schoolsData.metadata?.pagination);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanPageChange = async (page: number) => {
    try {
      const res = await api.get(`/api/admin/loans?page=${page}&limit=5`);
      const data = await res.json();
      setLoans(data.data || []);
      setLoanPagination(data.metadata?.pagination);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleSchoolPageChange = async (page: number) => {
    try {
      const res = await api.get(`/api/admin/schools?page=${page}&limit=5`);
      const data = await res.json();
      setSchools(data.data || []);
      setSchoolPagination(data.metadata?.pagination);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleSchoolClick = async (school: any) => {
    // Show drawer immediately with basic data
    setSelectedSchool(school);
    setShowSchoolDrawer(true);
    
    // Fetch full details in background
    try {
      setLoadingSchoolDetails(true);
      const res = await api.get(`/api/admin/schools/${school.id}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedSchool(data.data);
      }
    } catch (error) {
      console.error('Error fetching school details:', error);
    } finally {
      setLoadingSchoolDetails(false);
    }
  };

  const handleLoanClick = async (loan: any) => {
    // Show drawer immediately with basic data
    setSelectedLoan(loan);
    setShowLoanDrawer(true);
    
    // Fetch full details in background
    try {
      setLoadingLoanDetails(true);
      const res = await api.get(`/api/admin/loans/${loan.id}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedLoan(data.data);
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoadingLoanDetails(false);
    }
  };

  const handleApprove = async (schoolId: string) => {
    if (!schoolId) return;
    
    try {
      setProcessing(true);
      const res = await api.post(`/api/admin/schools/${schoolId}/approve`, {});
      const data = await res.json();
      
      if (data.success) {
        setShowApprovalModal(false);
        setShowSchoolDrawer(false);
        setSelectedSchool(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error approving school:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    if (!loanId) return;
    
    try {
      setProcessing(true);
      const res = await api.patch(`/api/admin/loans/${loanId}/status`, {
        status: 'APPROVED',
        notes: 'Loan approved by admin'
      });
      const data = await res.json();
      
      if (data.success) {
        setShowApprovalModal(false);
        setShowLoanDrawer(false);
        setSelectedLoan(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error approving loan:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (schoolId: string, reason: string) => {
    if (!schoolId || !reason) return;
    
    try {
      setProcessing(true);
      const res = await api.post(`/api/admin/schools/${schoolId}/reject`, { reason });
      const data = await res.json();
      
      if (data.success) {
        setShowRejectionModal(false);
        setRejectionReason('');
        setShowSchoolDrawer(false);
        setSelectedSchool(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting school:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectLoan = async (loanId: string, reason: string) => {
    if (!loanId || !reason) return;
    
    try {
      setProcessing(true);
      const res = await api.patch(`/api/admin/loans/${loanId}/status`, {
        status: 'REJECTED',
        rejectionReason: reason
      });
      const data = await res.json();
      
      if (data.success) {
        setShowRejectionModal(false);
        setRejectionReason('');
        setShowLoanDrawer(false);
        setSelectedLoan(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDisburseLoan = async (loanId: string) => {
    if (!loanId) return;
    
    try {
      setProcessing(true);
      const res = await api.post(`/api/admin/loans/${loanId}/disburse`, {});
      const data = await res.json();
      
      if (data.success) {
        setShowLoanDrawer(false);
        setSelectedLoan(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error disbursing loan:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddLog = async () => {
    if (!logForm.activity || !logForm.details || !selectedSchool) return;

    try {
      setProcessing(true);
      const res = await api.post(`/api/admin/schools/${selectedSchool.id}/verification-log`, logForm);
      const data = await res.json();
      
      if (data.success) {
        setShowLogModal(false);
        setLogForm({
          activity: '',
          details: '',
          status: 'IN_PROGRESS'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding verification log:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formattedLoans = loans.map(loan => ({
    ...loan,
    applicationDate: new Date(loan.applicationDate).toLocaleDateString(),
    loanAmount: `₦${Number(loan.loanAmount).toLocaleString()}`
  }));

  const formattedSchools = schools.map(school => ({
    ...school,
    isVerified: school.isVerified ? 'Verified' : 'Pending',
    createdAt: new Date(school.createdAt).toLocaleDateString()
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="">
        <h2 className='mb-[0.56rem] font-semibold text-[#191919] text-xl md:text-[1.6875rem]'>Admin Dashboard</h2>
        <p className='mb-[1.375rem] font-semibold text-[#5F5F5F] text-lg md:text-[1.6875rem]'>Welcome Back, {user?.fullName?.split(" ")[0] || "Admin"}</p>
        
        {/* Stats Grid */}
        <div className="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {loading ? (
            <>
              <StatCardSkeleton variant="primary" />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Loans"
                value={analytics?.loans?.total?.toString() || "0"}
                subtitle={`${analytics?.loans?.active || 0} Active`}
                footer={`${analytics?.loans?.pending || 0} pending approval`}
                variant="primary"
              />
              <StatCard
                title="Total Disbursed"
                value={`₦${Number(analytics?.financial?.totalDisbursed || 0).toLocaleString()}`}
                subtitle={`${analytics?.loans?.completed || 0} Completed`}
                footer="Total amount disbursed to schools"
                variant="default"
              />
              <StatCard
                title="Verified Schools"
                value={analytics?.schools?.verified?.toString() || "0"}
                subtitle={`${analytics?.schools?.total || 0} Total Schools`}
                footer={`${analytics?.schools?.pending || 0} pending verification`}
                variant="default"
              />
              <StatCard
                title="Support Tickets"
                value={analytics?.support?.open?.toString() || "0"}
                subtitle={`${analytics?.support?.total || 0} Total Tickets`}
                footer="Active support requests"
                variant="default"
              />
            </>
          )}
        </div>

        {/* Loans Table */}
        <div className="mb-8">
          <DataTable
            title="Recent Loan Applications"
            columns={LOAN_COLUMNS}
            data={formattedLoans}
            viewAllHref="/admin/loans"
            paginationInfo={loanPagination}
            onPageChange={handleLoanPageChange}
            itemsPerPage={5}
            isLoading={loading}
            onRowClick={handleLoanClick}
            searchable={true}
          />
        </div>

        {/* Schools Table */}
        <div className="mb-8">
          <DataTable
            title="Recent School Registrations"
            columns={SCHOOL_COLUMNS}
            data={formattedSchools}
            viewAllHref="/admin/schools"
            paginationInfo={schoolPagination}
            onPageChange={handleSchoolPageChange}
            itemsPerPage={5}
            isLoading={loading}
            onRowClick={handleSchoolClick}
            searchable={true}
          />
        </div>
      </div>

      {/* School Detail Drawer */}
      <SchoolDetailDrawer
        isOpen={showSchoolDrawer}
        onClose={() => {
          setShowSchoolDrawer(false);
          setSelectedSchool(null);
        }}
        school={selectedSchool}
        onApprove={() => {
          setShowSchoolDrawer(false);
          setModalType('school');
          setShowApprovalModal(true);
        }}
        onReject={() => {
          setShowSchoolDrawer(false);
          setModalType('school');
          setShowRejectionModal(true);
        }}
        onAddLog={() => {
          setShowSchoolDrawer(false);
          setShowLogModal(true);
        }}
        onRefresh={fetchData}
        isLoading={loadingSchoolDetails}
      />

      {/* Loan Detail Drawer */}
      <LoanDetailDrawer
        isOpen={showLoanDrawer}
        onClose={() => {
          setShowLoanDrawer(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
        onApprove={() => {
          setShowLoanDrawer(false);
          setModalType('loan');
          setShowApprovalModal(true);
        }}
        onReject={() => {
          setShowLoanDrawer(false);
          setModalType('loan');
          setShowRejectionModal(true);
        }}
        onDisburse={() => {
          if (selectedLoan) {
            handleDisburseLoan(selectedLoan.id);
          }
        }}
        onRefresh={fetchData}
        isLoading={loadingLoanDetails}
      />

      {/* Approval Modal */}
      {(selectedSchool || selectedLoan) && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={modalType === 'school' ? 'Approve School' : 'Approve Loan'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to approve{' '}
              <strong>
                {modalType === 'school' 
                  ? selectedSchool?.schoolName 
                  : `${selectedLoan?.userName}'s loan application (${selectedLoan?.loanNumber})`
                }
              </strong>?
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalType === 'school' && selectedSchool) {
                    handleApprove(selectedSchool.id);
                  } else if (modalType === 'loan' && selectedLoan) {
                    handleApproveLoan(selectedLoan.id);
                  }
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Modal */}
      {(selectedSchool || selectedLoan) && (
        <Modal
          isOpen={showRejectionModal}
          onClose={() => {
            setShowRejectionModal(false);
            setRejectionReason('');
          }}
          title={modalType === 'school' ? 'Reject School' : 'Reject Loan'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for rejecting{' '}
              <strong>
                {modalType === 'school' 
                  ? selectedSchool?.schoolName 
                  : `${selectedLoan?.userName}'s loan application`
                }
              </strong>.
            </p>

            <CustomInput
              label="Rejection Reason"
              type="text"
              value={rejectionReason}
              onChange={setRejectionReason}
              placeholder="Enter reason for rejection"
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalType === 'school' && selectedSchool) {
                    handleReject(selectedSchool.id, rejectionReason);
                  } else if (modalType === 'loan' && selectedLoan) {
                    handleRejectLoan(selectedLoan.id, rejectionReason);
                  }
                }}
                disabled={processing || !rejectionReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Verification Log Modal */}
      {selectedSchool && (
        <Modal
          isOpen={showLogModal}
          onClose={() => {
            setShowLogModal(false);
            setLogForm({
              activity: '',
              details: '',
              status: 'IN_PROGRESS'
            });
          }}
          title="Add Verification Log"
        >
          <div className="space-y-4">
            <CustomInput
              label="Activity"
              type="select"
              value={logForm.activity}
              onChange={(val) => setLogForm({ ...logForm, activity: val })}
              options={ACTIVITY_OPTIONS}
              placeholder="Select activity"
            />

            <CustomInput
              label="Status"
              type="select"
              value={logForm.status}
              onChange={(val) => setLogForm({ ...logForm, status: val })}
              options={STATUS_OPTIONS}
            />

            <CustomInput
              label="Details"
              type="text"
              value={logForm.details}
              onChange={(val) => setLogForm({ ...logForm, details: val })}
              placeholder="Enter details about this activity"
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowLogModal(false);
                  setLogForm({
                    activity: '',
                    details: '',
                    status: 'IN_PROGRESS'
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleAddLog}
                disabled={processing || !logForm.activity || !logForm.details}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Adding...' : 'Add Log'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
