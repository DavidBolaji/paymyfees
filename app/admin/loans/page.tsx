'use client';

import { useState, useEffect } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { CustomInput } from '@/components/ui/custom-input';
import { Modal } from '@/components/ui/modal';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
import { api } from '@/src/lib/api';

const LOAN_COLUMNS = [
  { key: 'loanNumber', label: 'Loan Number' },
  { key: 'userName', label: 'Applicant' },
  { key: 'schoolName', label: 'School' },
  { key: 'loanAmount', label: 'Amount' },
  { key: 'repaymentMonths', label: 'Months' },
  { key: 'status', label: 'Status' },
  { key: 'applicationDate', label: 'Date' },
];

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchLoans(1);
  }, [statusFilter]);

  const fetchLoans = async (page: number) => {
    try {
      setLoading(true);
      const url = `/api/admin/loans?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      const res = await api.get(url);
      const data = await res.json();
      
      if (data.success) {
        setLoans(data.data || []);
        setPagination(data.metadata?.pagination);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (loan: any) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/loans/${loan.id}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedLoan(data.data);
        setShowDrawer(true);
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setShowDrawer(false); // Close drawer first
    setStatusAction('approve');
    setShowStatusModal(true);
  };

  const handleReject = () => {
    setShowDrawer(false); // Close drawer first
    setStatusAction('reject');
    setShowStatusModal(true);
  };

  const handleDisburse = () => {
    setShowDrawer(false); // Close drawer first
    setShowDisbursementModal(true);
  };

  const handleRefresh = async () => {
    if (selectedLoan) {
      await handleViewDetails(selectedLoan);
    }
    await fetchLoans(pagination?.page || 1);
  };

  const [disburseLoanImmediately, setDisburseLoanImmediately] = useState(false);

  const handleStatusChange = async () => {
    if (!selectedLoan || !statusAction) return;

    try {
      setProcessing(true);
      
      // Step 1: Update loan status
      const res = await api.patch(`/api/admin/loans/${selectedLoan.id}/status`, {
        status: statusAction === 'approve' ? 'APPROVED' : 'REJECTED',
        reason: rejectionReason
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update loan status');
      }

      // Step 2: If approved and disburse immediately is checked, trigger disbursement
      if (statusAction === 'approve' && disburseLoanImmediately) {
        const disburseRes = await api.post(`/api/admin/loans/${selectedLoan.id}/disburse`);
        const disburseData = await disburseRes.json();
        
        if (!disburseData.success) {
          console.error('Disbursement failed:', disburseData.error);
          alert('Loan approved but disbursement failed. You can disburse it manually from the loan details.');
        }
      }

      setShowStatusModal(false);
      setRejectionReason('');
      setStatusAction(null);
      setDisburseLoanImmediately(false);
      setSelectedLoan(null); // Clear selected loan
      fetchLoans(pagination?.page || 1);
    } catch (error) {
      console.error('Error updating loan status:', error);
      alert('Failed to update loan status. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisbursement = async () => {
    if (!selectedLoan) return;

    try {
      setProcessing(true);
      const res = await api.post(`/api/admin/loans/${selectedLoan.id}/disburse`);
      const data = await res.json();
      
      if (data.success) {
        setShowDisbursementModal(false);
        setSelectedLoan(null); // Clear selected loan
        fetchLoans(pagination?.page || 1);
      }
    } catch (error) {
      console.error('Error disbursing loan:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formattedLoans = loans.map(loan => ({
    ...loan,
    applicationDate: new Date(loan.applicationDate).toLocaleDateString(),
    loanAmount: `₦${Number(loan.loanAmount).toLocaleString()}`
  }));

  return (
    <div className="p-4 md:p-6 pt-6 md:pt-0">
      <div className="mb-6">
        <h2 className='mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]'>Loan Management</h2>
        <p className='text-[#5F5F5F] text-sm md:text-base'>Review and manage all loan applications</p>
      </div>

      <div className="mb-6 max-w-xs">
        <CustomInput
          label="Filter by Status"
          type="select"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: '', label: 'All Loans' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'DISBURSED', label: 'Disbursed' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
        />
      </div>

      <DataTable
        title="All Loan Applications"
        columns={LOAN_COLUMNS}
        data={formattedLoans}
        paginationInfo={pagination || undefined}
        onPageChange={fetchLoans}
        itemsPerPage={10}
        isLoading={loading}
        onRowClick={handleViewDetails}
        searchable={true}
        filterable={true}
      />

      {/* Loan Detail Drawer */}
      <LoanDetailDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
        onApprove={handleApprove}
        onReject={handleReject}
        onDisburse={handleDisburse}
        onRefresh={handleRefresh}
        isLoading={loading}
      />

      {/* Status Change Modal */}
      {showStatusModal && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setRejectionReason('');
            setStatusAction(null);
            setDisburseLoanImmediately(false);
          }}
          title={statusAction === 'approve' ? 'Approve Loan' : 'Reject Loan'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {statusAction === 'approve'
                ? 'Are you sure you want to approve this loan application?'
                : 'Please provide a reason for rejecting this loan application.'}
            </p>

            {statusAction === 'approve' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="disburse-immediately"
                    checked={disburseLoanImmediately}
                    onChange={(e) => setDisburseLoanImmediately(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor="disburse-immediately" 
                      className="font-medium text-blue-900 text-sm cursor-pointer"
                    >
                      Disburse funds immediately after approval
                    </label>
                    <p className="mt-1 text-blue-700 text-xs">
                      This will automatically create a disbursement and transfer funds to the school. 
                      The loan status will change to ACTIVE.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {statusAction === 'reject' && (
              <CustomInput
                label="Rejection Reason"
                type="text"
                value={rejectionReason}
                onChange={setRejectionReason}
                placeholder="Enter reason for rejection"
              />
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setRejectionReason('');
                  setStatusAction(null);
                  setDisburseLoanImmediately(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={processing || (statusAction === 'reject' && !rejectionReason)}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  statusAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                    {statusAction === 'approve' && disburseLoanImmediately ? 'Approving & Disbursing...' : 'Processing...'}
                  </span>
                ) : (
                  statusAction === 'approve' && disburseLoanImmediately ? 'Approve & Disburse' : 'Confirm'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Disbursement Modal */}
      {showDisbursementModal && (
        <Modal
          isOpen={showDisbursementModal}
          onClose={() => setShowDisbursementModal(false)}
          title="Disburse Loan"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to disburse this loan? This action will transfer the funds to the school.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Amount:</strong> ₦{Number(selectedLoan?.loanAmount).toLocaleString()}
              </p>
              <p className="text-sm text-blue-800">
                <strong>School:</strong> {selectedLoan?.schoolName}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDisbursementModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleDisbursement}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Confirm Disbursement'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
