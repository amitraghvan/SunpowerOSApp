'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Building2,
  RefreshCw,
  Send,
  MessageSquare,
  AlertCircle,
  Lock,
  ChevronRight,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export default function PlatformSupportCenterPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Reply form state
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getSupportTickets({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm || undefined,
        limit: 25,
      });
      setTickets(res?.items || []);
      setTotal(res?.total || 0);

      if (res?.items?.length > 0 && !selectedTicket) {
        handleSelectTicket(res.items[0]);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await ApiClient.getAdministrators();
      setAdmins(res || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAdmins();
  }, [statusFilter]);

  const handleSelectTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      const detail = await ApiClient.getSupportTicketDetail(ticket.id);
      setSelectedTicket(detail);
    } catch (err) {
      console.error('Failed to get ticket detail:', err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setActionLoading(true);
    try {
      await ApiClient.replySupportTicket(
        selectedTicket.id,
        replyMessage.trim(),
        isInternalOnly,
      );
      setReplyMessage('');
      setIsInternalOnly(false);
      // Reload detail
      const detail = await ApiClient.getSupportTicketDetail(selectedTicket.id);
      setSelectedTicket(detail);
      fetchTickets();
    } catch (err: any) {
      alert(`Error sending reply: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      const updated = await ApiClient.updateSupportTicketStatus(
        selectedTicket.id,
        status,
      );
      setSelectedTicket(updated);
      fetchTickets();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTicket = async (adminId: string) => {
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      const updated = await ApiClient.assignSupportTicket(selectedTicket.id, adminId);
      setSelectedTicket(updated);
      fetchTickets();
    } catch (err: any) {
      alert(`Error assigning ticket: ${err.message}`);
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
            Customer Support Center
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Resolve customer operational issues, technical requests, and enterprise support inquiries
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E5E9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'].map((st) => (
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
            onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
            placeholder="Search ticket # or subject..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67]"
          />
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-[#E4E5E9] bg-[#FAFAFB] text-xs font-bold text-[#8A92A6] uppercase tracking-wider">
            Ticket Directory ({total})
          </div>

          <div className="divide-y divide-[#E4E5E9] max-h-[650px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#8A92A6]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#8A92A6]">
                No support tickets found.
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#F1EAF0]/50 border-l-4 border-l-[#714B67]' : 'hover:bg-[#FAFAFB]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#714B67]">
                        {t.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-[#151A2B] mt-1 line-clamp-1">
                      {t.subject}
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-[#737B8B]">
                      <span className="truncate max-w-[150px]">
                        {t.organization?.name || 'Tenant Org'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'OPEN'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.status === 'RESOLVED'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Workspace */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E5E9] shadow-xs p-6 space-y-5">
          {selectedTicket ? (
            <>
              {/* Ticket Header & Status bar */}
              <div className="pb-4 border-b border-[#E4E5E9] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#714B67]">
                      {selectedTicket.ticketNumber} · {selectedTicket.category}
                    </span>
                    <h2 className="text-base font-bold text-[#151A2B] mt-0.5">
                      {selectedTicket.subject}
                    </h2>
                  </div>
                  <span
                    className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedTicket.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedTicket.status === 'RESOLVED'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#737B8B]">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#8A92A6]" />
                    <span className="font-medium text-[#151A2B]">
                      {selectedTicket.organization?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#8A92A6]" />
                    <span>
                      {selectedTicket.submittedBy?.firstName} {selectedTicket.submittedBy?.lastName} (
                      {selectedTicket.submittedBy?.email})
                    </span>
                  </div>
                </div>

                {/* Workflow controls */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8A92A6] uppercase mb-1">
                      Status:
                    </label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      disabled={actionLoading}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E4E5E9] text-xs font-semibold bg-white"
                    >
                      {['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8A92A6] uppercase mb-1">
                      Assign Support Agent:
                    </label>
                    <select
                      value={selectedTicket.assignedToId || ''}
                      onChange={(e) => handleAssignTicket(e.target.value)}
                      disabled={actionLoading}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E4E5E9] text-xs font-semibold bg-white"
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
              </div>

              {/* Conversation Messages Thread */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {selectedTicket.messages?.map((msg: any) => {
                  const isPlatform = msg.senderType === 'PLATFORM_ADMIN';
                  const isInternal = msg.isInternalOnly;
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                        isInternal
                          ? 'bg-amber-50/70 border-amber-200 text-[#151A2B]'
                          : isPlatform
                          ? 'bg-[#F1EAF0]/40 border-[#714B67]/20 text-[#151A2B]'
                          : 'bg-[#FAFAFB] border-[#E4E5E9] text-[#202536]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#151A2B]">
                            {msg.sender?.firstName} {msg.sender?.lastName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isInternal
                                ? 'bg-amber-200 text-amber-900'
                                : isPlatform
                                ? 'bg-[#714B67] text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {isInternal ? 'INTERNAL NOTE' : isPlatform ? 'PLATFORM SUPPORT' : 'CUSTOMER'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8A92A6] font-mono">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.message}</div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-[#E4E5E9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#151A2B]">Send Message or Note:</span>
                  <label className="flex items-center gap-1.5 text-xs text-[#737B8B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalOnly}
                      onChange={(e) => setIsInternalOnly(e.target.checked)}
                      className="rounded text-[#714B67] focus:ring-[#714B67]"
                    />
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-medium text-amber-800">Internal Note Only</span>
                  </label>
                </div>

                <textarea
                  rows={3}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={
                    isInternalOnly
                      ? 'Add private note visible only to Platform Administrators...'
                      : 'Type response to customer...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading || !replyMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInternalOnly ? 'Save Internal Note' : 'Send Reply to Customer'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-24 text-center text-xs text-[#8A92A6]">
              Select a support ticket from the directory to review and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
