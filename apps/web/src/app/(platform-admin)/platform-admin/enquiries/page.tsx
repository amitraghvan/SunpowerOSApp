'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Mail,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Building,
  RefreshCw,
  X,
  Send,
  MessageSquare,
  ArrowRight,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export default function PlatformEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getPlatformEnquiries({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm || undefined,
        limit: 20,
      });
      setEnquiries(res?.items || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await ApiClient.getPlatformAdministrators();
      setAdmins(res || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchAdmins();
  }, [statusFilter]);

  const handleSelectEnquiry = async (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    try {
      const detail = await ApiClient.getPlatformEnquiryDetail(enquiry.id);
      setSelectedEnquiry(detail);
    } catch (err) {
      console.error('Failed to get enquiry detail:', err);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedEnquiry) return;
    setActionLoading(true);
    try {
      const updated = await ApiClient.updatePlatformEnquiryStatus(
        selectedEnquiry.id,
        newStatus,
      );
      setSelectedEnquiry(updated);
      fetchEnquiries();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAdmin = async (adminId: string) => {
    if (!selectedEnquiry) return;
    setActionLoading(true);
    try {
      const updated = await ApiClient.assignPlatformEnquiry(selectedEnquiry.id, adminId);
      setSelectedEnquiry(updated);
      fetchEnquiries();
    } catch (err: any) {
      alert(`Error assigning enquiry: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !noteText.trim()) return;
    setActionLoading(true);
    try {
      const updated = await ApiClient.addPlatformEnquiryNote(selectedEnquiry.id, noteText.trim());
      setSelectedEnquiry(updated);
      setNoteText('');
      fetchEnquiries();
    } catch (err: any) {
      alert(`Error adding note: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            Public Website Enquiries Inbox
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Centralized intake of sales leads, demo requests, and corporate solar inquiries
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E5E9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'NEW', 'IN_REVIEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'text-[#737B8B] hover:bg-[#F6F6F6] hover:text-[#151A2B]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8A92A6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEnquiries()}
            placeholder="Search reference, email or company..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67]"
          />
        </div>
      </div>

      {/* Enquiries Master Table & Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table column */}
        <div className={`${selectedEnquiry ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden transition-all`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAFAFB] border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Contact & Company</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E5E9]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                      Loading enquiries...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                      No enquiries found.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq) => {
                    const isSelected = selectedEnquiry?.id === enq.id;
                    return (
                      <tr
                        key={enq.id}
                        onClick={() => handleSelectEnquiry(enq)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#F1EAF0]/40' : 'hover:bg-[#FAFAFB]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                          {enq.referenceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#151A2B]">{enq.name}</div>
                          <div className="text-[11px] text-[#737B8B]">
                            {enq.company || enq.email}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#475065]">
                          {enq.projectCapacity || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              enq.status === 'NEW'
                                ? 'bg-emerald-100 text-emerald-700'
                                : enq.status === 'CONTACTED'
                                ? 'bg-blue-100 text-blue-700'
                                : enq.status === 'QUALIFIED'
                                ? 'bg-purple-100 text-purple-700'
                                : enq.status === 'CLOSED'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#737B8B]">
                          {enq.assignedTo?.user ? (
                            <span className="font-medium text-[#151A2B]">
                              {enq.assignedTo.user.firstName}
                            </span>
                          ) : (
                            <span className="text-[#8A92A6] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#8A92A6] font-mono text-[11px]">
                          {new Date(enq.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drawer detail panel */}
        {selectedEnquiry && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E5E9] shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E5E9]">
              <div>
                <span className="font-mono text-xs font-bold text-[#714B67]">
                  {selectedEnquiry.referenceNumber}
                </span>
                <h2 className="text-base font-bold text-[#151A2B] mt-0.5">
                  {selectedEnquiry.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 rounded-lg hover:bg-[#F6F6F6] text-[#8A92A6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact details grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAFAFB] p-3.5 rounded-xl border border-[#E4E5E9]">
              <div>
                <span className="text-[#737B8B] block text-[10px] uppercase font-bold">Email:</span>
                <a href={`mailto:${selectedEnquiry.email}`} className="text-[#714B67] font-semibold hover:underline">
                  {selectedEnquiry.email}
                </a>
              </div>
              <div>
                <span className="text-[#737B8B] block text-[10px] uppercase font-bold">Phone:</span>
                <span className="text-[#151A2B] font-semibold">{selectedEnquiry.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737B8B] block text-[10px] uppercase font-bold">Company:</span>
                <span className="text-[#151A2B] font-semibold">{selectedEnquiry.company || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737B8B] block text-[10px] uppercase font-bold">Project Capacity:</span>
                <span className="text-[#151A2B] font-semibold">{selectedEnquiry.projectCapacity || 'N/A'}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider block mb-1">
                Inquiry Message:
              </span>
              <div className="p-3.5 rounded-xl bg-[#FAFAFB] border border-[#E4E5E9] text-xs text-[#202536] leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Workflow controls: Status & Assigned Admin */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider mb-1">
                  Update Status:
                </label>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={actionLoading}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs font-semibold bg-white focus:ring-2 focus:ring-[#714B67]"
                >
                  {['NEW', 'IN_REVIEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider mb-1">
                  Assign To:
                </label>
                <select
                  value={selectedEnquiry.assignedToId || ''}
                  onChange={(e) => handleAssignAdmin(e.target.value)}
                  disabled={actionLoading}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs font-semibold bg-white focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="">-- Unassigned --</option>
                  {admins.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.user?.firstName} {adm.user?.lastName} ({adm.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Internal Notes Section */}
            <div className="space-y-3 pt-3 border-t border-[#E4E5E9]">
              <span className="text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider block">
                Internal Team Notes:
              </span>

              {selectedEnquiry.internalNotes ? (
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-[#202536] whitespace-pre-wrap font-mono text-[11px]">
                  {selectedEnquiry.internalNotes}
                </div>
              ) : (
                <div className="text-[11px] text-[#8A92A6] italic">No internal notes added yet.</div>
              )}

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add administrative note or follow-up summary..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67]"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !noteText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white font-semibold text-xs disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
