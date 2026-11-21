'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  Truck,
  FileText,
  RefreshCw,
  IndianRupee,
  AlertOctagon,
} from 'lucide-react';

export default function SupplierReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getSupplierReturns(params);
      setReturns(res || []);
    } catch (err: any) {
      console.error('Failed to load supplier returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const filtered = returns.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.returnNumber?.toLowerCase().includes(q) ||
      r.debitNoteNumber?.toLowerCase().includes(q) ||
      r.supplier?.legalName?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#DC3545]" />
            Supplier Rejections & Returns (Debit Notes)
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Defective goods return dispatch, financial debit notes & stock removal from active inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReturns}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-[#495057] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Status Filter */}
      <div className="bg-white border border-[#DEE2E6] rounded p-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#ADB5BD] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by return number, debit note or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded text-xs focus:outline-none focus:border-[#DC3545]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6C757D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#CED4DA] rounded py-1.5 px-2 text-xs focus:outline-none focus:border-[#DC3545]"
            >
              <option value="ALL">All Return Statuses</option>
              <option value="SUBMITTED">Submitted / In-Transit</option>
              <option value="ACKNOWLEDGED_BY_VENDOR">Acknowledged by Vendor</option>
              <option value="CREDIT_NOTE_RECEIVED">Credit Note Received</option>
              <option value="REPLACED">Replaced with New Goods</option>
            </select>
          </div>
        </div>

        <div className="text-[#6C757D]">
          Total Returns: <span className="font-semibold text-[#212529]">{filtered.length}</span>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b text-[#495057] font-semibold">
              <th className="py-2.5 px-3">Return Document</th>
              <th className="py-2.5 px-3">Debit Note Reference</th>
              <th className="py-2.5 px-3">Supplier Name</th>
              <th className="py-2.5 px-3">Return Category</th>
              <th className="py-2.5 px-3">Items & Quantities</th>
              <th className="py-2.5 px-3">Debit Amount (₹)</th>
              <th className="py-2.5 px-3">Return Reason</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                  Loading supplier returns...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                  No supplier returns or debit notes recorded.
                </td>
              </tr>
            ) : (
              filtered.map((ret) => (
                <tr key={ret.id} className="hover:bg-[#F8F9FA]">
                  <td className="py-2.5 px-3 font-semibold text-[#DC3545] font-mono">
                    {ret.returnNumber}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-[#212529]">
                    {ret.debitNoteNumber || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#212529]">{ret.supplier?.legalName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-[#495057]">
                      {ret.returnType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#495057]">
                    {ret.lines?.length || 0} items ({ret.lines?.reduce((a: number, l: any) => a + Number(l.returnedQuantity || 0), 0)} units)
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#DC3545]">
                    ₹{Number(ret.totalReturnAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-[#6C757D] max-w-xs truncate">{ret.reason}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ret.status === 'CREDIT_NOTE_RECEIVED' || ret.status === 'REPLACED'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : 'bg-[#FFF3CD] text-[#664D03]'
                      }`}
                    >
                      {ret.status}
                    </span>
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
