'use client';

import { useState, useEffect } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { CustomInput } from '@/components/ui/custom-input';
import { Modal } from '@/components/ui/modal';
import { Eye, FileText, CheckCircle, XCircle, Plus, MessageSquare } from 'lucide-react';

const SCHOOL_COLUMNS = [
  { key: 'schoolName', label: 'School Name' },
  { key: 'schoolEmail', label: 'Email' },
  { key: 'city', label: 'City' },
  { key: 'totalStudents', label: 'Students' },
  { key: 'isVerified', label: 'Status' },
  { key: 'createdAt', label: 'Registered' },
];

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Add school form state
  const [schoolForm, setSchoolForm] = useState({
    schoolName: '',
    schoolEmail: '',
    schoolPhone: '',
    schoolAddress: '',
    city: '',
    state: '',
    country: 'Nigeria',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    fetchSchools(1);
  }, [statusFilter]);

  const fetchSchools = async (page: number) => {
    try {
      setLoading(true);
      const url = `/api/admin/schools?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setSchools(data.data || []);
        setPagination(data.metadata?.pagination);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (school: any) => {
    try {
      const res = await fetch(`/api/admin/schools/${school.id}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedSchool(data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching school details:', error);
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedSchool || !approvalAction) return;

    try {
      setProcessing(true);
      const endpoint = approvalAction === 'approve' ? 'approve' : 'reject';
      const res = await fetch(`/api/admin/schools/${selectedSchool.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowApprovalModal(false);
        setShowDetailsModal(false);
        setRejectionReason('');
        fetchSchools(pagination?.page || 1);
      }
    } catch (error) {
      console.error('Error updating school status:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddSchool = async () => {
    try {
      setProcessing(true);
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolForm)
      });

      const data = await res.json();
      
      if (data.success) {
        setShowAddSchoolModal(false);
        setSchoolForm({
          schoolName: '',
          schoolEmail: '',
          schoolPhone: '',
          schoolAddress: '',
          city: '',
          state: '',
          country: 'Nigeria',
          contactPersonName: '',
          contactPersonEmail: '',
          contactPersonPhone: '',
          bankName: '',
          accountNumber: '',
          accountName: '',
        });
        fetchSchools(1);
      }
    } catch (error) {
      console.error('Error adding school:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSchool || !message) return;

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/schools/${selectedSchool.id}/verification-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowMessageModal(false);
        setMessage('');
        alert('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleViewLogs = async (school: any) => {
    try {
      const res = await fetch(`/api/admin/schools/${school.id}/verification-logs`);
      const data = await res.json();
      
      if (data.success) {
        setLogs(data.data || []);
        setSelectedSchool(school);
        setShowLogsModal(true);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const formattedSchools = schools.map(school => ({
    ...school,
    isVerified: school.isVerified ? 'Verified' : 'Pending',
    createdAt: new Date(school.createdAt).toLocaleDateString()
  }));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className='mb-2 font-semibold text-[#191919] text-[1.6875rem]'>School Management</h2>
          <p className='text-[#5F5F5F] text-base'>Manage and verify school registrations</p>
        </div>
        <button
          onClick={() => setShowAddSchoolModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add School
        </button>
      </div>

      <div className="mb-6 max-w-xs">
        <CustomInput
          label="Filter by Status"
          type="select"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: '', label: 'All Schools' },
            { value: 'verified', label: 'Verified' },
            { value: 'pending', label: 'Pending' },
          ]}
        />
      </div>

      <DataTable
        title="All Schools"
        columns={SCHOOL_COLUMNS}
        data={formattedSchools}
        paginationInfo={pagination || undefined}
        onPageChange={fetchSchools}
        itemsPerPage={10}
        isLoading={loading}
        onRowClick={handleViewDetails}
        searchable={true}
        filterable={true}
      />

      {/* School Details Modal */}
      {showDetailsModal && selectedSchool && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="School Details"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* School Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">School Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">School Name</p>
                  <p className="font-medium">{selectedSchool.schoolName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedSchool.schoolEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selectedSchool.schoolPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium">{selectedSchool.schoolAddress}</p>
                </div>
                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-medium">{selectedSchool.city}</p>
                </div>
                <div>
                  <p className="text-gray-500">State</p>
                  <p className="font-medium">{selectedSchool.state}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className={`font-medium ${selectedSchool.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedSchool.isVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Students</p>
                  <p className="font-medium">{selectedSchool.totalStudents}</p>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Contact Person</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{selectedSchool.contactPersonName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedSchool.contactPersonEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selectedSchool.contactPersonPhone}</p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Bank Name</p>
                  <p className="font-medium">{selectedSchool.bankName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Number</p>
                  <p className="font-medium">{selectedSchool.accountNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Account Name</p>
                  <p className="font-medium">{selectedSchool.accountName || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {selectedSchool.documents && selectedSchool.documents.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Documents ({selectedSchool.documents.length})</h3>
                <div className="space-y-2">
                  {selectedSchool.documents.map((doc: any) => (
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
              {!selectedSchool.isVerified && (
                <>
                  <button
                    onClick={() => {
                      setApprovalAction('approve');
                      setShowApprovalModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setApprovalAction('reject');
                      setShowApprovalModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowMessageModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
              <button
                onClick={() => handleViewLogs(selectedSchool)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Logs
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add School Modal */}
      {showAddSchoolModal && (
        <Modal
          isOpen={showAddSchoolModal}
          onClose={() => setShowAddSchoolModal(false)}
          title="Add New School"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <CustomInput
              label="School Name"
              type="text"
              value={schoolForm.schoolName}
              onChange={(val) => setSchoolForm({ ...schoolForm, schoolName: val })}
              placeholder="Enter school name"
            />
            <CustomInput
              label="School Email"
              type="email"
              value={schoolForm.schoolEmail}
              onChange={(val) => setSchoolForm({ ...schoolForm, schoolEmail: val })}
              placeholder="school@example.com"
            />
            <CustomInput
              label="School Phone"
              type="phone"
              value={schoolForm.schoolPhone}
              onChange={(val) => setSchoolForm({ ...schoolForm, schoolPhone: val })}
              placeholder="Phone number"
            />
            <CustomInput
              label="School Address"
              type="text"
              value={schoolForm.schoolAddress}
              onChange={(val) => setSchoolForm({ ...schoolForm, schoolAddress: val })}
              placeholder="Enter address"
            />
            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                label="City"
                type="text"
                value={schoolForm.city}
                onChange={(val) => setSchoolForm({ ...schoolForm, city: val })}
                placeholder="City"
              />
              <CustomInput
                label="State"
                type="text"
                value={schoolForm.state}
                onChange={(val) => setSchoolForm({ ...schoolForm, state: val })}
                placeholder="State"
              />
            </div>
            <CustomInput
              label="Contact Person Name"
              type="text"
              value={schoolForm.contactPersonName}
              onChange={(val) => setSchoolForm({ ...schoolForm, contactPersonName: val })}
              placeholder="Contact person name"
            />
            <CustomInput
              label="Contact Person Email"
              type="email"
              value={schoolForm.contactPersonEmail}
              onChange={(val) => setSchoolForm({ ...schoolForm, contactPersonEmail: val })}
              placeholder="contact@example.com"
            />
            <CustomInput
              label="Contact Person Phone"
              type="phone"
              value={schoolForm.contactPersonPhone}
              onChange={(val) => setSchoolForm({ ...schoolForm, contactPersonPhone: val })}
              placeholder="Contact phone"
            />
            <CustomInput
              label="Bank Name"
              type="text"
              value={schoolForm.bankName}
              onChange={(val) => setSchoolForm({ ...schoolForm, bankName: val })}
              placeholder="Bank name"
            />
            <CustomInput
              label="Account Number"
              type="text"
              value={schoolForm.accountNumber}
              onChange={(val) => setSchoolForm({ ...schoolForm, accountNumber: val })}
              placeholder="Account number"
            />
            <CustomInput
              label="Account Name"
              type="text"
              value={schoolForm.accountName}
              onChange={(val) => setSchoolForm({ ...schoolForm, accountName: val })}
              placeholder="Account name"
            />

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchool}
                disabled={processing || !schoolForm.schoolName || !schoolForm.schoolEmail}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Adding...' : 'Add School'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setRejectionReason('');
          }}
          title={approvalAction === 'approve' ? 'Approve School' : 'Reject School'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {approvalAction === 'approve'
                ? 'Are you sure you want to approve this school?'
                : 'Please provide a reason for rejecting this school.'}
            </p>

            {approvalAction === 'reject' && (
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
                  setShowApprovalModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={processing || (approvalAction === 'reject' && !rejectionReason)}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  approvalAction === 'approve'
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

      {/* Send Message Modal */}
      {showMessageModal && (
        <Modal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setMessage('');
          }}
          title="Send Verification Message"
        >
          <div className="space-y-4">
            <CustomInput
              label="Message"
              type="text"
              value={message}
              onChange={setMessage}
              placeholder="Enter message for school"
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={processing || !message}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Verification Logs Modal */}
      {showLogsModal && (
        <Modal
          isOpen={showLogsModal}
          onClose={() => setShowLogsModal(false)}
          title="Verification Logs"
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No logs available</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  <p className={`text-xs mt-1 ${log.isRead ? 'text-gray-500' : 'text-blue-600 font-medium'}`}>
                    {log.isRead ? 'Read' : 'Unread'}
                  </p>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
