'use client';

import { DetailDrawer, DrawerSection, DrawerAction } from './detail-drawer';
import { StatusBadge } from './status-badge';
import { Eye, CheckCircle, XCircle, Plus } from 'lucide-react';

interface SchoolDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  school: any;
  onApprove?: () => void;
  onReject?: () => void;
  onAddLog?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function SchoolDetailDrawer({
  isOpen,
  onClose,
  school,
  onApprove,
  onReject,
  onAddLog,
}: SchoolDetailDrawerProps) {
  if (!school) return null;

  const sections: DrawerSection[] = [
    {
      title: 'School Information',
      items: [
        { label: 'School Name', value: school.schoolName },
        { label: 'Email', value: school.schoolEmail },
        { label: 'Phone', value: school.schoolPhone },
        { label: 'Address', value: school.schoolAddress },
        { label: 'City', value: school.city },
        { label: 'State', value: school.state },
        { label: 'Country', value: school.country || 'Nigeria' },
        {
          label: 'Status',
          value: <StatusBadge status={school.isVerified ? 'approved' : 'pending'} />
        },
        { label: 'Total Students', value: school.totalStudents?.toString() || '0' },
      ]
    },
    {
      title: 'Contact Person',
      items: [
        { label: 'Name', value: school.contactPersonName || 'N/A' },
        { label: 'Email', value: school.contactPersonEmail || 'N/A' },
        { label: 'Phone', value: school.contactPersonPhone || 'N/A' },
      ]
    },
    {
      title: 'Bank Details',
      items: [
        { label: 'Bank Name', value: school.bankName || 'N/A' },
        { label: 'Account Number', value: school.accountNumber || 'N/A' },
        { label: 'Account Name', value: school.accountName || 'N/A' },
      ]
    },
  ];

  // Add documents section if available
  if (school.documents && school.documents.length > 0) {
    sections.push({
      title: `Documents (${school.documents.length})`,
      items: school.documents.map((doc: any) => ({
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

  if (!school.isVerified) {
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

  actions.push({
    label: 'Add Log',
    onClick: () => {
      if (onAddLog) onAddLog();
    },
    variant: school.isVerified ? 'primary' : 'secondary',
    icon: <Plus className="w-4 h-4" />
  });

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="School Details"
      sections={sections}
      actions={actions}
    />
  );
}
