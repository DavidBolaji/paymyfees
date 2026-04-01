 'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';

export interface DrawerSection {
  title: string;
  items: Array<{
    label: string;
    value: string | React.ReactNode;
  }>;
}

export interface DrawerAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: DrawerSection[];
  actions?: DrawerAction[];
}

export function DetailDrawer({
  isOpen,
  onClose,
  title,
  sections,
  actions = []
}: DetailDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="z-[100] fixed inset-0 bg-[#292929CC]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="top-0 right-0 z-[101] fixed bg-white shadow-2xl w-full max-w-[540px] h-full"
          >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-gray-200 border-b">
          <h2 className="font-semibold text-[#191919] text-[1.25rem]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex justify-center items-center hover:bg-gray-50 border-[#002561] border-2 rounded-lg w-10 h-10 transition-colors"
          >
            <X className="w-5 h-5 text-[#002561]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100%-180px)] overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              <h3 className="mb-4 font-medium text-[#7C7C7C] text-[0.875rem]">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex justify-between items-start"
                  >
                    <span className="text-[#7C7C7C] text-[0.875rem]">
                      {item.label}:
                    </span>
                    <span className="font-medium text-[#191919] text-[0.875rem] text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions Footer */}
        {actions.length > 0 && (
          <div className="right-0 bottom-0 left-0 absolute bg-white p-6 border-gray-200 border-t">
            <div className="flex gap-4">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-[0.875rem] transition-all duration-200 flex items-center justify-center gap-2 ${
                    action.variant === 'primary'
                      ? 'bg-[#002561] text-white hover:bg-[#001a4a]'
                      : 'bg-white text-[#002561] border-2 border-[#002561] hover:bg-gray-50'
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Loan Disbursement Drawer
interface LoanDisbursementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  // The loan object may include these properties from dashboard stats
  // but we don't require them to be present
}

export function LoanDisbursementDrawer({
  isOpen,
  onClose,
  loan
}: LoanDisbursementDrawerProps) {
  if (!loan) return null;

  // Get the active plan information (e.g., 0/6 months paid)
  const activePlanCurrent = loan.activePlan?.current || 0;
  const activePlanTotal = loan.activePlan?.total || 6; // Default to 6 months if not specified
  
  // Calculate the outstanding amount (what is owed - what has been paid)
  const tuitionAmount = loan.tuitionAmount || 120000;
  const totalRepayable = tuitionAmount * 1.33;
  
  // Parse total paid amount from string if available
  let totalPaid = 0;
  if (loan.repaymentProgress?.totalPaid) {
    const totalPaidStr = loan.repaymentProgress.totalPaid;
    if (typeof totalPaidStr === 'string') {
      // Remove currency symbol and commas, then parse as float
      totalPaid = parseFloat(totalPaidStr.replace('₦', '').replace(/,/g, '')) || 0;
    } else if (typeof totalPaidStr === 'number') {
      totalPaid = totalPaidStr;
    }
  }
  
  // Calculate outstanding amount (balance from stat card or calculated)
  const outstandingAmount = loan.balance?.amount !== undefined ?
    loan.balance.amount : (totalRepayable - totalPaid);
  
  // Get the next repayment date and amount from the upcoming payment stat card
  const nextRepaymentDate = loan.upcomingPayment?.dueDate || 'N/A';
  const nextRepaymentAmount = loan.upcomingPayment?.amount ?
    `₦${loan.upcomingPayment.amount.toLocaleString()}` : '₦0';

  const sections: DrawerSection[] = [
    {
      title: 'Loan Summary',
      items: [
        { label: 'Loan ID', value: loan.loanId || 'PMF-2024-0021' },
        {
          label: 'Status',
          value: <StatusBadge status={loan.status || 'completed'} />
        },
        {
          label: 'Borrowed Amount',
          value: `₦${(loan.tuitionAmount || 120000).toLocaleString()}`
        },
        {
          label: 'Total Repayable',
          value: `₦${totalRepayable.toLocaleString()}`
        },
        { label: 'Tenure', value: `${activePlanTotal} Months` },
        {
          label: 'Repayment Plan',
          value: loan.repaymentPlan || 'Monthly Auto-Debit / Bank Transfer'
        },
        { label: 'Interest Rate', value: '2.5% Monthly' }
      ]
    },
    {
      title: 'Disbursement Details',
      items: [
        {
          label: 'Disbursed To',
          value: loan.contributedTo || 'Babcock University'
        },
        { label: 'Date Disbursed', value: loan.date || '14 Aug 2024' },
        {
          label: 'Amount Disbursed',
          value: `₦${(loan.tuitionAmount || 120000).toLocaleString()}`
        },
        { label: 'Mode', value: 'Direct School Payment' }
      ]
    },
    {
      title: 'Repayment Progress',
      items: [
        {
          label: 'Progress',
          value: `${activePlanCurrent} / ${activePlanTotal} months paid`
        },
        {
          label: 'Total Paid',
          value: loan.repaymentProgress?.totalPaid || '₦0'
        },
        {
          label: 'Outstanding',
          value: `₦${outstandingAmount.toLocaleString()}`
        },
        {
          label: 'Next Repayment Date',
          value: nextRepaymentDate
        },
        {
          label: 'Next Repayment Amount',
          value: nextRepaymentAmount
        }
      ]
    }
  ];

  const actions: DrawerAction[] = [
    {
      label: 'View',
      onClick: () => {
        onClose();
        window.location.href = `/dashboard/loans/${loan.loanId || 'PMF-2024-0021'}`;
      },
      variant: 'primary',
      icon: <CheckSquareIcon className="w-4 h-4" />
    },
    {
      label: 'Make Repayment',
      onClick: () => console.log('Make repayment'),
      variant: 'secondary'
    }
  ];

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Loan Disbursement Info"
      sections={sections}
      actions={actions}
    />
  );
}

// Transaction Drawer
interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export function TransactionDrawer({
  isOpen,
  onClose,
  transaction
}: TransactionDrawerProps) {
  if (!transaction) return null;

  // Extract date and time from transaction date
  const transactionDate = new Date(transaction.date);
  const formattedDate = transactionDate.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = transactionDate.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format transaction reference
  const transactionId = transaction.reference || `PMF-TX-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  const sections: DrawerSection[] = [
    {
      title: 'Transaction Summary',
      items: [
        { label: 'Transaction ID', value: transactionId },
        {
          label: 'Status',
          value: <StatusBadge status={transaction.status || 'completed'} />
        },
        { label: 'Date', value: formattedDate },
        { label: 'Time', value: formattedTime }
      ]
    },
    {
      title: 'Transaction Details',
      items: [
        {
          label: 'Type',
          value: transaction.type || 'Payment'
        },
        {
          label: 'Amount',
          value: `₦${(transaction.amount || 0).toLocaleString()}`
        },
        {
          label: 'Payment Method',
          value: transaction.method || 'Wallet'
        }
      ]
    },
    {
      title: 'Payment Flow',
      items: [
        { label: 'From', value: transaction.source || 'Student Wallet' },
        { label: 'To', value: transaction.destination || 'School Account' },
        { label: 'Purpose', value: transaction.description || 'Tuition Fee Payment' },
        { label: 'Category', value: transaction.category || 'School Payment' }
      ]
    },
    {
      title: 'Additional Information',
      items: [
        { label: 'Reference', value: transaction.reference || '-' },
        { label: 'Notes', value: transaction.notes || '-' }
      ]
    }
  ];

  const actions: DrawerAction[] = [
    {
      label: 'Download Receipt',
      onClick: async () => {
        try {
          const res = await fetch(`/api/payments/${transaction.id}/receipt`);
          if (res.ok) {
            const data = await res.json();
            if (data?.receiptUrl) {
              window.open(data.receiptUrl, '_blank', 'noopener,noreferrer');
              return;
            }
          }
        } catch {
          // fall through to printable receipt
        }
        // Generate a printable receipt in a new tab as fallback
        const receiptHtml = `<!DOCTYPE html><html><head><title>Receipt – ${transactionId}</title>
<style>body{font-family:sans-serif;max-width:480px;margin:40px auto;padding:0 16px}h1{font-size:1.2rem}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:8px 4px;border-bottom:1px solid #eee;font-size:.9rem}td:last-child{text-align:right;font-weight:600}@media print{button{display:none}}</style>
</head><body>
<h1>Transaction Receipt</h1>
<table>
<tr><td>Transaction ID</td><td>${transactionId}</td></tr>
<tr><td>Date</td><td>${formattedDate} ${formattedTime}</td></tr>
<tr><td>Type</td><td>${transaction.type || 'Payment'}</td></tr>
<tr><td>Amount</td><td>₦${(transaction.amount || 0).toLocaleString()}</td></tr>
<tr><td>Payment Method</td><td>${transaction.method || 'Wallet'}</td></tr>
<tr><td>Status</td><td>${transaction.status || 'Completed'}</td></tr>
<tr><td>Reference</td><td>${transaction.reference || '-'}</td></tr>
</table>
<br/><button onclick="window.print()">Print / Save as PDF</button>
</body></html>`;
        const blob = new Blob([receiptHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      variant: 'primary',
      icon: <Download className="w-4 h-4" />
    },
    {
      label: 'View History',
      onClick: () => {
        onClose();
        window.location.href = `/dashboard/transactions`;
      },
      variant: 'secondary'
    }
  ];

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Recent Transaction Info"
      sections={sections}
      actions={actions}
    />
  );
}
