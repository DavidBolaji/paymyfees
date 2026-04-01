'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, CheckCircle } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { RequestDocumentsModal } from './request-documents-modal';
import { api } from '@/src/lib/api';

interface SchoolVerifyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  school: any;
  onApproved?: () => void;
}

export function SchoolVerifyDrawer({ isOpen, onClose, school, onApproved }: SchoolVerifyDrawerProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!school) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      await api.post(`/api/admin/schools/${school.id}/approve`, { notes });
      onApproved?.();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDocuments = async (data: any) => {
    try {
      setLoading(true);
      await api.post(`/api/admin/schools/${school.id}/request-documents`, data);
      setShowRequestModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="z-[100] fixed inset-0 bg-[#292929CC]"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="top-0 right-0 z-[101] fixed bg-white shadow-2xl w-full max-w-[540px] h-full flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="font-semibold text-[#191919] text-lg">Verify School</h2>
                <button onClick={onClose} className="flex justify-center items-center hover:bg-gray-50 border-[#002561] border-2 rounded-lg w-10 h-10 transition-colors">
                  <X className="w-5 h-5 text-[#002561]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* School Information */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">School Information</p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'School Name', value: school.schoolName },
                      { label: 'Status', value: <StatusBadge status={school.status === 'verified' ? 'APPROVED' : 'PENDING'} /> },
                      { label: 'Location', value: school.location || 'N/A' },
                      { label: 'School Type', value: 'N/A' },
                      { label: 'Website', value: school.website || 'N/A' },
                      { label: 'Contact Email', value: school.schoolEmail || 'N/A' },
                      { label: 'Contact Phone', value: school.schoolPhone || 'N/A' },
                      { label: 'Year Established', value: 'N/A' },
                      { label: 'Registration Number', value: 'N/A' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitted Documents */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Submitted Documents ({school.documents?.length || 0})
                  </p>
                  {school.documents && school.documents.length > 0 ? (
                    <div className="space-y-2">
                      {school.documents.map((doc: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{doc.documentType?.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-500">{doc.fileName}</p>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                            onClick={e => e.stopPropagation()}
                          >
                            <Eye className="w-4 h-4" /> View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No documents submitted</p>
                  )}
                </div>

                {/* Add Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Add Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this verification..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002561] resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Request Documents
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {loading ? 'Approving...' : 'Approve School'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <RequestDocumentsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onConfirm={handleRequestDocuments}
        loading={loading}
      />
    </>
  );
}
