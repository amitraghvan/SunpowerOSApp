'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Send,
  RefreshCw,
  Boxes,
  IndianRupee,
} from 'lucide-react';

export default function PurchaseRequisitionsPage() {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getPurchaseRequisitions(params);
      setRequisitions(res || []);
    } catch (err: any) {
      console.error('Failed to load requisitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [statusFilter]);

  const handleSubmit = async (id: string) => {
    setActionLoading(id);
    try {
      await ApiClient.submitPurchaseRequisition(id);
      fetchRequisitions();
    } catch (err: any) {
      alert(err.message || 'Failed to submit PR');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    const notes = prompt('Enter approval remarks (optional):') || 'Approved';
    setActionLoading(id);
    try {
      await ApiClient.approvePurchaseRequisition(id, { notes });
      fetchRequisitions();
    } catch (err: any) {
      alert(err.message || 'Failed to approve PR');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const rejectionReason = prompt('Enter rejection reason:');
    if (!rejectionReason) return;
    setActionLoading(id);
    try {
      await ApiClient.rejectPurchaseRequisition(id, { rejectionReason });
      fetchRequisitions();
    } catch (err: any) {
      alert(err.message || 'Failed to reject PR');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requisitions.filter((pr) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      pr.requisitionNumber?.toLowerCase().includes(q) ||
      pr.title?.toLowerCase().includes(q) ||
      pr.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#714B67]" />
            Purchase Requisitions (PR)
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Internal demand authorization, managerial approval workflows & RFQ trigger point
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequisitions}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-[#495057] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/procurement/requirements"
            className="bg-[#714B67] hover:bg-[#58394F] text-white px-3.5 py-2 rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate from MRP
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#DEE2E6] rounded p-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#ADB5BD] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by PR number or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded text-xs focus:outline-none focus:border-[#714B67]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6C757D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#CED4DA] rounded py-1.5 px-2 text-xs focus:outline-none focus:border-[#714B67]"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted / Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CONVERTED_TO_PO">Converted to PO</option>
            </select>
          </div>
        </div>

        <div className="text-[#6C757D]">
          Requisitions: <span className="font-semibold text-[#212529]">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b text-[#495057] font-semibold">
              <th className="py-2.5 px-3">PR Number</th>
              <th className="py-2.5 px-3">Title & Purpose</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3">Line Items</th>
              <th className="py-2.5 px-3">Est. Amount (₹)</th>
              <th className="py-2.5 px-3">Required By</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                  Loading purchase requisitions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                  No purchase requisitions found.
                </td>
              </tr>
            ) : (
              filtered.map((pr) => (
                <tr key={pr.id} className="hover:bg-[#F8F9FA]">
                  <td className="py-2.5 px-3 font-semibold text-[#714B67] font-mono">
                    {pr.requisitionNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-[#212529]">{pr.title}</div>
                    {pr.justification && (
                      <div className="text-[11px] text-[#6C757D] line-clamp-1">{pr.justification}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#495057]">{pr.department || 'OPERATIONS'}</td>
                  <td className="py-2.5 px-3 text-[#495057]">{pr.lines?.length || 0} line items</td>
                  <td className="py-2.5 px-3 font-semibold text-[#212529]">
                    ₹{Number(pr.totalEstimatedAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-[#6C757D]">
                    {pr.requiredByDate ? new Date(pr.requiredByDate).toLocaleDateString() : 'Immediate'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pr.status === 'APPROVED' || pr.status === 'CONVERTED_TO_PO'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : pr.status === 'SUBMITTED'
                          ? 'bg-[#CFF4FC] text-[#055160]'
                          : pr.status === 'REJECTED'
                          ? 'bg-[#F8D7DA] text-[#842029]'
                          : 'bg-[#E9ECEF] text-[#495057]'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {pr.status === 'DRAFT' && (
                        <button
                          disabled={actionLoading === pr.id}
                          onClick={() => handleSubmit(pr.id)}
                          className="px-2.5 py-1 bg-[#714B67] hover:bg-[#58394F] text-white rounded font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" /> Submit
                        </button>
                      )}

                      {pr.status === 'SUBMITTED' && (
                        <>
                          <button
                            disabled={actionLoading === pr.id}
                            onClick={() => handleApprove(pr.id)}
                            className="px-2.5 py-1 bg-[#198754] hover:bg-[#146C43] text-white rounded font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button
                            disabled={actionLoading === pr.id}
                            onClick={() => handleReject(pr.id)}
                            className="px-2 py-1 bg-[#DC3545] hover:bg-[#BB2D3B] text-white rounded font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}

                      {pr.status === 'APPROVED' && (
                        <Link
                          href="/procurement/purchase-orders"
                          className="px-2.5 py-1 border border-[#714B67] text-[#714B67] hover:bg-[#F8F9FA] rounded font-medium flex items-center gap-1"
                        >
                          Generate PO &rarr;
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
