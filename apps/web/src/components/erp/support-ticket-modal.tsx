'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  LifeBuoy,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportTicketModal({ isOpen, onClose }: SupportTicketModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'list') {
      loadTickets();
    }
  }, [isOpen, activeTab]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await ApiClient.getTenantSupportTickets();
      const list = Array.isArray(res) ? res : res?.items || res?.data || [];
      setTickets(list);
    } catch {
      // ignore
    } finally {
      setLoadingTickets(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMessage('Please fill in both a subject and details for your request.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await ApiClient.createTenantSupportTicket({
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });
      setSuccessTicket(res);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#DEE2E6] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#714B67] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight text-white">SunPowerOS Support Desk</h2>
              <p className="text-[11px] text-white/80">Direct assistance from our technical engineering operations team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#E4E5E9] bg-[#F8F9FA] px-5 pt-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('create');
              setSuccessTicket(null);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            Open New Ticket
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'list'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            My Open Tickets ({tickets.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'create' ? (
            successTicket ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#151A2B]">Ticket Submitted Successfully</h3>
                  <p className="text-xs text-[#6C757D] mt-1 max-w-sm mx-auto">
                    Your request has been routed directly to our Platform Operations control center.
                  </p>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E4E5E9] inline-block font-mono text-xs text-[#714B67] font-semibold">
                  Ticket #{successTicket.ticketNumber || successTicket.id}
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSuccessTicket(null)}
                    className="px-4 py-2 rounded-xl border border-[#DEE2E6] hover:bg-[#F8F9FA] text-xs font-semibold text-[#495057]"
                  >
                    Open Another Ticket
                  </button>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold"
                  >
                    View My Tickets
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Subject / Summary <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Inverter sizing calculation discrepancy on 10kW system"
                    className="w-full px-3 py-2 rounded-xl border border-[#DEE2E6] text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#212529] mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEE2E6] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    >
                      <option value="TECHNICAL">Technical & Calculation</option>
                      <option value="BILLING">Billing & Subscription</option>
                      <option value="FEATURE_REQUEST">Feature Request</option>
                      <option value="GENERAL">General Operational Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212529] mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEE2E6] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    >
                      <option value="LOW">Low (Informational)</option>
                      <option value="MEDIUM">Medium (Standard)</option>
                      <option value="HIGH">High (Urgent project impacted)</option>
                      <option value="URGENT">Urgent (Operation blocked)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Issue Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what occurred, steps to reproduce, or project details..."
                    className="w-full px-3 py-2 rounded-xl border border-[#DEE2E6] text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-[#DEE2E6] hover:bg-[#F8F9FA] text-xs font-semibold text-[#495057]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-3">
              {loadingTickets ? (
                <div className="py-10 text-center text-xs text-[#6C757D]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                  Loading your tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-12 text-center text-[#6C757D] space-y-2">
                  <LifeBuoy className="w-8 h-8 mx-auto text-[#CED4DA]" />
                  <p className="text-xs font-semibold text-[#151A2B]">No support tickets recorded</p>
                  <p className="text-[11px]">You have not opened any support requests yet.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#714B67] text-white text-xs font-semibold"
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-[#DEE2E6] bg-white hover:bg-[#FAFAFB] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#714B67]">
                        #{t.ticketNumber || t.id.slice(0, 8)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#151A2B]">{t.subject}</h4>
                    <p className="text-[11px] text-[#6C757D] line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#F1F3F5] text-[10px] text-[#8A92A6]">
                      <span>Priority: <strong className="text-[#495057]">{t.priority}</strong></span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
