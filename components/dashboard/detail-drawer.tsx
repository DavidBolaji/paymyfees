'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckSquare } from 'lucide-react';
import { StatusBadge } from './status-badge';

interface DrawerSection {
  title: string;
  items: Array<{
    label: string;
    value: string | React.ReactNode;
  }>;
}

interface DrawerAction {
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
}

export function LoanDisbursementDrawer({
  isOpen,
  onClose,
  loan
}: LoanDisbursementDrawerProps) {
  if (!loan) return null;

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
          value: `₦${((loan.tuitionAmount || 120000) * 1.33).toLocaleString()}`
        },
        { label: 'Tenure', value: '6 Months' },
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
        { label: 'Progress', value: '7 / 12 months paid' },
        { label: 'Total Paid', value: '₦95,000' },
        { label: 'Outstanding', value: '₦65,000' },
        { label: 'Next Repayment Date', value: '28 Dec 2025' },
        { label: 'Next Repayment Amount', value: '₦15,000' }
      ]
    }
  ];

  const actions: DrawerAction[] = [
    {
      label: 'View Full Loan Information',
      onClick: () => {
        onClose();
        window.location.href = `/dashboard/loans/${loan.loanId || 'PMF-2024-0021'}`;
      },
      variant: 'primary',
      icon: <CheckSquare className="w-4 h-4" />
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

  const sections: DrawerSection[] = [
    {
      title: 'Transaction Summary',
      items: [
        { label: 'Transaction ID', value: 'PMF-TX-092341' },
        {
          label: 'Status',
          value: <StatusBadge status={transaction.status || 'completed'} />
        },
        { label: 'Date', value: transaction.date || 'Dec 12, 2025' },
        { label: 'Time', value: '10:43 AM' }
      ]
    },
    {
      title: 'Transaction Type',
      items: [
        {
          label: 'Installment Payment',
          value: '(3 of 5)'
        },
        {
          label: 'Amount Disbursed',
          value: `₦${(transaction.amount || 15000).toLocaleString()}`
        }
      ]
    },
    {
      title: 'Payment Flow',
      items: [
        { label: 'From', value: 'Student Wallet' },
        { label: 'To', value: 'Greenfield Secondary School' },
        { label: 'Purpose', value: 'Tuition Fee Repayment' },
        { label: 'Academic Term', value: '2025 / 2026 - Term 1' }
      ]
    },
    {
      title: 'Linked Loan Information',
      items: [
        { label: 'Loan Reference', value: 'PMF-LN-10422' },
        { label: 'Total Loan Amount', value: '₦75,000' },
        { label: 'Repayment Plan', value: '5 Installments' },
        { label: 'Remaining Balance', value: '₦30,000' },
        { label: 'Next Payment Due', value: 'Jan 12, 2026' }
      ]
    }
  ];

  const actions: DrawerAction[] = [
    {
      label: 'Download Receipt',
      onClick: () => console.log('Download receipt'),
      variant: 'primary',
      icon: <Download className="w-4 h-4" />
    },
    {
      label: 'View Repayment Timeline',
      onClick: () => {
        onClose();
        window.location.href = `/dashboard/timeline`;
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
