'use client';

import { useState, useEffect } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { CustomInput } from '@/components/ui/custom-input';
import { Modal } from '@/components/ui/modal';
import { Plus } from 'lucide-react';
import { SchoolDetailDrawer } from '@/components/dashboard/school-detail-drawer';

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

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingSchoolDetails, setLoadingSchoolDetails] = useState(false);
  
  // Approval/Rejection modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Log modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    activity: '',
    details: '',
    status: 'IN_PROGRESS'
  });
  
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
    // Show drawer immediately with basic data
    setSelectedSchool(school);
    setShowDrawer(true);
    
    // Fetch full details in background
    try {
      setLoadingSchoolDetails(true);
      const res = await fetch(`/api/admin/schools/${school.id}`);
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

  const handleApprove = async (schoolId: string) => {
    if (!schoolId) return;
    
    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/schools/${schoolId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      
      if (data.success) {
        setShowApprovalModal(false);
        setShowDrawer(false);
        setSelectedSchool(null);
        fetchSchools(pagination?.page || 1);
      }
    } catch (error) {
      console.error('Error approving school:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (schoolId: string, reason: string) => {
    if (!schoolId || !reason) return;
    
    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/schools/${schoolId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowRejectionModal(false);
        setRejectionReason('');
        setShowDrawer(false);
        setSelectedSchool(null);
        fetchSchools(pagination?.page || 1);
      }
    } catch (error) {
      console.error('Error rejecting school:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddLog = async () => {
    if (!logForm.activity || !logForm.details || !selectedSchool) return;

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/schools/${selectedSchool.id}/verification-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logForm)
      });

      const data = await res.json();
      
      if (data.success) {
        setShowLogModal(false);
        setLogForm({
          activity: '',
          details: '',
          status: 'IN_PROGRESS'
        });
        fetchSchools(pagination?.page || 1);
      }
    } catch (error) {
      console.error('Error adding verification log:', error);
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

      {/* School Detail Drawer */}
      <SchoolDetailDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setSelectedSchool(null);
        }}
        school={selectedSchool}
        onApprove={() => {
          setShowDrawer(false);
          setShowApprovalModal(true);
        }}
        onReject={() => {
          setShowDrawer(false);
          setShowRejectionModal(true);
        }}
        onAddLog={() => {
          setShowDrawer(false);
          setShowLogModal(true);
        }}
        onRefresh={() => fetchSchools(pagination?.page || 1)}
        isLoading={loadingSchoolDetails}
      />

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
      {selectedSchool && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title="Approve School"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to approve <strong>{selectedSchool.schoolName}</strong>?
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
                onClick={() => handleApprove(selectedSchool.id)}
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
      {selectedSchool && (
        <Modal
          isOpen={showRejectionModal}
          onClose={() => {
            setShowRejectionModal(false);
            setRejectionReason('');
          }}
          title="Reject School"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for rejecting <strong>{selectedSchool.schoolName}</strong>.
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
                onClick={() => handleReject(selectedSchool.id, rejectionReason)}
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
