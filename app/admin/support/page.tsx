'use client';

import { useState, useEffect } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { CustomInput } from '@/components/ui/custom-input';
import { Modal } from '@/components/ui/modal';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/status-badge';

const TICKET_COLUMNS = [
  { key: 'ticketNumber', label: 'Ticket #' },
  { key: 'userName', label: 'User' },
  { key: 'userEmail', label: 'Email' },
  { key: 'subject', label: 'Subject' },
  { key: 'category', label: 'Category' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTickets(1);
  }, [statusFilter]);

  const fetchTickets = async (page: number) => {
    try {
      setLoading(true);
      const url = `/api/admin/support?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setTickets(data.data || []);
        setPagination(data.metadata?.pagination);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (ticket: any) => {
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedTicket(data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !response) return;

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/support/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: response })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowResponseModal(false);
        setResponse('');
        // Refresh ticket details
        handleViewDetails(selectedTicket);
      }
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/support/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowStatusModal(false);
        setShowDetailsModal(false);
        setNewStatus('');
        fetchTickets(pagination?.page || 1);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formattedTickets = tickets.map(ticket => ({
    ...ticket,
    userName: ticket.user?.fullName || 'N/A',
    userEmail: ticket.user?.email || 'N/A',
    createdAt: new Date(ticket.createdAt).toLocaleDateString()
  }));

  return (
    <div className="p-4 md:p-6 pt-6 md:pt-0">
      <div className="mb-6">
        <h2 className='mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]'>Support Tickets</h2>
        <p className='text-[#5F5F5F] text-sm md:text-base'>Manage and respond to customer support requests</p>
      </div>

      <div className="mb-6 max-w-xs">
        <CustomInput
          label="Filter by Status"
          type="select"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: '', label: 'All Tickets' },
            { value: 'OPEN', label: 'Open' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'RESOLVED', label: 'Resolved' },
            { value: 'CLOSED', label: 'Closed' },
          ]}
        />
      </div>

      <DataTable
        title="All Support Tickets"
        columns={TICKET_COLUMNS}
        data={formattedTickets}
        paginationInfo={pagination || undefined}
        onPageChange={fetchTickets}
        itemsPerPage={10}
        isLoading={loading}
        onRowClick={handleViewDetails}
        searchable={true}
        filterable={true}
      />

      {/* Ticket Details Modal */}
      {showDetailsModal && selectedTicket && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Ticket #${selectedTicket.ticketNumber}`}
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Ticket Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Ticket Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">User</p>
                  <p className="font-medium">{selectedTicket.user?.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedTicket.user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{selectedTicket.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Priority</p>
                  <p className={`font-medium ${
                    selectedTicket.priority === 'URGENT' ? 'text-red-600' :
                    selectedTicket.priority === 'HIGH' ? 'text-orange-600' :
                    selectedTicket.priority === 'MEDIUM' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {selectedTicket.priority}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Subject & Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Subject</h3>
              <p className="text-gray-700">{selectedTicket.subject}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Messages */}
            {selectedTicket.messages && selectedTicket.messages.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Conversation ({selectedTicket.messages.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedTicket.messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.senderRole === 'ADMIN'
                          ? 'bg-blue-50 ml-8'
                          : 'bg-gray-50 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-gray-600">
                          {msg.senderRole === 'ADMIN' ? 'Admin' : 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Attachments</h3>
                <div className="space-y-2">
                  {selectedTicket.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{att.fileName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowResponseModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                Send Response
              </button>
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4" />
                Update Status
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <Modal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setResponse('');
          }}
          title="Send Response"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponse('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleSendResponse}
                disabled={processing || !response}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setNewStatus('');
          }}
          title="Update Ticket Status"
        >
          <div className="space-y-4">
            <CustomInput
              label="New Status"
              type="select"
              value={newStatus}
              onChange={setNewStatus}
              options={[
                { value: '', label: 'Select Status' },
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' },
              ]}
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={processing || !newStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
