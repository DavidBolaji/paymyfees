'use client';

import { DetailDrawer, DrawerSection, DrawerAction } from './detail-drawer';
import { StatusBadge } from './status-badge';
import { Eye, CheckCircle, XCircle, DollarSign, FileText } from 'lucide-react';

interface LoanDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  onApprove?: () => void;
  onReject?: () => void;
  onDisburse?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function LoanDetailDrawer({
  isOpen,
  onClose,
  loan,
  onApprove,
  onReject,
  onDisburse,
}: LoanDetailDrawerProps) {
  if (!loan) return null;

  // Extract user information from either the table data or the detailed API response
  const userName = loan.userName || loan.user?.fullName || 'N/A';
  const userEmail = loan.userEmail || loan.user?.email || 'N/A';
  const userPhone = loan.userPhone || loan.user?.phone || 'N/A';

  const sections: DrawerSection[] = [
    {
      title: 'Loan Information',
      items: [
        { label: 'Loan Number', value: loan.loanNumber },
        { label: 'Applicant', value: userName },
        { label: 'Email', value: userEmail },
        { label: 'Phone', value: userPhone },
        {
          label: 'Status',
          value: <StatusBadge status={loan.status?.toLowerCase() || 'pending'} />
        },
        {
          label: 'Loan Amount',
          value: `₦${Number(loan.loanAmount || 0).toLocaleString()}`
        },
        {
          label: 'Interest Rate',
          value: `${loan.interestRate || 0}%`
        },
        {
          label: 'Total Interest',
          value: `₦${Number(loan.totalInterest || 0).toLocaleString()}`
        },
        {
          label: 'Total Amount',
          value: `₦${Number(loan.totalAmount || 0).toLocaleString()}`
        },
        {
          label: 'Monthly Payment',
          value: `₦${Number(loan.monthlyPayment || 0).toLocaleString()}`
        },
        { label: 'Repayment Months', value: loan.repaymentMonths?.toString() || 'N/A' },
      ]
    },
    {
      title: 'School Information',
      items: [
        { label: 'School Name', value: loan.schoolName || loan.school?.schoolName || 'N/A' },
        { label: 'Academic Session', value: loan.academicSession || 'N/A' },
        { label: 'Term', value: loan.term || 'N/A' },
        { label: 'Residency Status', value: loan.residencyStatus || 'LOCAL' },
      ]
    },
  ];

  // Add international student specific fields if applicable
  if (loan.residencyStatus === 'INTERNATIONAL') {
    sections.push({
      title: 'International Student Details',
      items: [
        { label: 'Country of Study', value: loan.countryOfStudy || 'N/A' },
        { label: 'Program/Course', value: loan.programCourseOfStudy || 'N/A' },
        { label: 'Employment Status', value: loan.employmentStatus || 'N/A' },
        { label: 'Company Name', value: loan.companyName || 'N/A' },
        { label: 'Job Title', value: loan.jobTitleRole || 'N/A' },
        {
          label: 'Monthly Income',
          value: loan.monthlyNetIncome ? `₦${Number(loan.monthlyNetIncome).toLocaleString()}` : 'N/A'
        },
        { label: 'Payment Frequency', value: loan.paymentFrequency || 'N/A' },
      ]
    });

    sections.push({
      title: 'Bank Details',
      items: [
        { label: 'Account Holder', value: loan.accountHolderName || 'N/A' },
        { label: 'Bank Name', value: loan.bankName || 'N/A' },
        { label: 'Account Number', value: loan.accountNumber || 'N/A' },
        { label: 'Country', value: loan.countryOfBankAccount || 'N/A' },
      ]
    });
  }

  sections.push({
    title: 'Repayment Progress',
    items: [
      {
        label: 'Amount Disbursed',
        value: `₦${Number(loan.amountDisbursed || 0).toLocaleString()}`
      },
      {
        label: 'Amount Repaid',
        value: `₦${Number(loan.amountRepaid || 0).toLocaleString()}`
      },
      {
        label: 'Outstanding Balance',
        value: `₦${Number(loan.outstandingBalance || 0).toLocaleString()}`
      },
    ]
  });

  sections.push({
    title: 'Dates',
    items: [
      {
        label: 'Application Date',
        value: loan.applicationDate ? new Date(loan.applicationDate).toLocaleDateString() : 'N/A'
      },
      {
        label: 'Approval Date',
        value: loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString() : 'N/A'
      },
      {
        label: 'Disbursement Date',
        value: loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString() : 'N/A'
      },
      {
        label: 'First Payment Date',
        value: loan.firstPaymentDate ? new Date(loan.firstPaymentDate).toLocaleDateString() : 'N/A'
      },
      {
        label: 'Last Payment Date',
        value: loan.lastPaymentDate ? new Date(loan.lastPaymentDate).toLocaleDateString() : 'N/A'
      },
    ]
  });

  // Add notes section if available
  if (loan.notes || loan.rejectionReason) {
    sections.push({
      title: 'Additional Information',
      items: [
        ...(loan.approvedBy ? [{ label: 'Approved By', value: loan.approvedBy }] : []),
        ...(loan.rejectionReason ? [{ label: 'Rejection Reason', value: loan.rejectionReason }] : []),
        ...(loan.notes ? [{ label: 'Notes', value: loan.notes }] : []),
      ]
    });
  }

  // Add documents section if available
  if (loan.documents && loan.documents.length > 0) {
    sections.push({
      title: `Documents (${loan.documents.length})`,
      items: loan.documents.map((doc: any) => ({
        label: doc.documentType,
        value: (
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
            View
          </a>
        )
      }))
    });
  }

  const actions: DrawerAction[] = [];

  // Show approve/reject actions for pending loans
  if (loan.status === 'PENDING') {
    actions.push(
      {
        label: 'Approve',
        onClick: () => {
          if (onApprove) onApprove();
        },
        variant: 'primary',
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Reject',
        onClick: () => {
          if (onReject) onReject();
        },
        variant: 'secondary',
        icon: <XCircle className="w-4 h-4" />
      }
    );
  }

  // Show disburse action for approved loans
  if (loan.status === 'APPROVED' && loan.amountDisbursed === 0) {
    actions.push({
      label: 'Disburse Loan',
      onClick: () => {
        if (onDisburse) onDisburse();
      },
      variant: 'primary',
      icon: <DollarSign className="w-4 h-4" />
    });
  }


  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Loan Details"
      sections={sections}
      actions={actions}
    />
  );
}
