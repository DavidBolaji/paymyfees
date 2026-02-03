'use client';

import { useState, useEffect } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { CustomInput } from '@/components/ui/custom-input';
import { Modal } from '@/components/ui/modal';
import { Eye, FileText, CheckCircle, XCircle, Send } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/status-badge';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
      const res = await fetch(url);
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
      const res = await fetch(`/api/admin/loans/${loan.id}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedLoan(data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedLoan || !statusAction) return;

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/loans/${selectedLoan.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusAction === 'approve' ? 'APPROVED' : 'REJECTED',
          reason: rejectionReason
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowStatusModal(false);
        setShowDetailsModal(false);
        setRejectionReason('');
        fetchLoans(pagination?.page || 1);
      }
    } catch (error) {
      console.error('Error updating loan status:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDisbursement = async () => {
    if (!selectedLoan) return;

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/loans/${selectedLoan.id}/disburse`, {
        method: 'POST'
      });

      const data = await res.json();
      
      if (data.success) {
        setShowDisbursementModal(false);
        setShowDetailsModal(false);
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className='mb-2 font-semibold text-[#191919] text-[1.6875rem]'>Loan Management</h2>
        <p className='text-[#5F5F5F] text-base'>Review and manage all loan applications</p>
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

      {/* Loan Details Modal */}
      {showDetailsModal && selectedLoan && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Loan Details"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Applicant Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Applicant Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedLoan.userName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedLoan.userEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selectedLoan.userPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Residency Status</p>
                  <p className="font-medium">{selectedLoan.residencyStatus}</p>
                </div>
              </div>
            </div>

            {/* Loan Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Loan Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Loan Number</p>
                  <p className="font-medium">{selectedLoan.loanNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">School</p>
                  <p className="font-medium">{selectedLoan.schoolName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Loan Amount</p>
                  <p className="font-medium">₦{Number(selectedLoan.loanAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-medium">₦{Number(selectedLoan.totalAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Interest Rate</p>
                  <p className="font-medium">{selectedLoan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Repayment Period</p>
                  <p className="font-medium">{selectedLoan.repaymentMonths} months</p>
                </div>
                <div>
                  <p className="text-gray-500">Outstanding Balance</p>
                  <p className="font-medium">₦{Number(selectedLoan.outstandingBalance).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount Repaid</p>
                  <p className="font-medium">₦{Number(selectedLoan.amountRepaid).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <StatusBadge status={selectedLoan.status} />
                </div>
                <div>
                  <p className="text-gray-500">Application Date</p>
                  <p className="font-medium">{new Date(selectedLoan.applicationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {selectedLoan.documents && selectedLoan.documents.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Documents ({selectedLoan.documents.length})</h3>
                <div className="space-y-2">
                  {selectedLoan.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{doc.documentType}</p>
                          <p className="text-xs text-gray-500">{doc.fileName}</p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Installments */}
            {selectedLoan.installments && selectedLoan.installments.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Installments ({selectedLoan.installments.length})</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedLoan.installments.map((inst: any) => {
                    const isPastDue = inst.status === 'PENDING' && new Date(inst.dueDate) < new Date();
                    return (
                      <div key={inst.id} className={`flex items-center justify-between p-3 rounded-lg text-sm ${isPastDue ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div>
                          <p className="font-medium">Installment #{inst.installmentNumber}</p>
                          <p className="text-xs text-gray-500">Due: {new Date(inst.dueDate).toLocaleDateString()}</p>
                          {isPastDue && <p className="text-xs text-red-600 font-medium">Overdue</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{Number(inst.amount).toLocaleString()}</p>
                          <StatusBadge status={inst.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
              {selectedLoan.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      setStatusAction('approve');
                      setShowStatusModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setStatusAction('reject');
                      setShowStatusModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              {selectedLoan.status === 'APPROVED' && (
                <button
                  onClick={() => setShowDisbursementModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  Disburse Loan
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setRejectionReason('');
          }}
          title={statusAction === 'approve' ? 'Approve Loan' : 'Reject Loan'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {statusAction === 'approve'
                ? 'Are you sure you want to approve this loan application?'
                : 'Please provide a reason for rejecting this loan application.'}
            </p>

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
                {processing ? 'Processing...' : 'Confirm'}
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
