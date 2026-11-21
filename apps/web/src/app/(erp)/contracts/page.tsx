'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  RefreshCw,
  IndianRupee,
} from 'lucide-react';

export default function ContractsListPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generation Form state
  const [form, setForm] = useState({
    quotationId: '',
  });

  const [quotations, setQuotations] = useState<any[]>([]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getContracts(params);
      setContracts(res || []);
    } catch (err: any) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    loadLookups();
  }, [statusFilter]);

  const loadLookups = async () => {
    try {
      const quotes = await ApiClient.getQuotations({ status: 'ACCEPTED' });
      setQuotations(quotes || []);
    } catch {
      // fallback
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await ApiClient.generateContract({
        quotationId: form.quotationId,
      });
      setIsModalOpen(false);
      setForm({ quotationId: '' });
      await fetchContracts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate contract');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.contractNumber?.toLowerCase().includes(term) ||
      c.customer?.name?.toLowerCase().includes(term)
    );
  });

  const totalPortfolioValue = contracts.reduce(
    (acc, c) => acc + (Number(c.contractValue) || 0),
    0
  );
  const activeCount = contracts.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212529] flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#714B67]" />
            Legal EPC Contracts & Milestones
          </h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Legally binding Solar EPC agreements, statutory warranties, milestone payment schedules, and execution signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchContracts()}
            className="p-2 border border-[#DEE2E6] rounded hover:bg-[#F8F9FA] text-[#495057] transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#714B67] hover:bg-[#58394F] text-white rounded text-sm font-medium flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Generate Legal Contract
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Total Contracts</p>
            <p className="text-2xl font-bold text-[#212529] mt-1">{contracts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#714B67]/10 flex items-center justify-center text-[#714B67]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Active Contracts</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Draft / Unsigned</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {contracts.filter((c) => c.status === 'DRAFT').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Portfolio Value</p>
            <p className="text-2xl font-bold text-[#017E84] mt-1">
              ₹{Math.round(totalPortfolioValue).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#017E84]">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#DEE2E6] shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Contract #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#CED4DA] rounded focus:ring-1 focus:ring-[#714B67] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6C757D] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'DRAFT', 'ACTIVE', 'FULFILLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                statusFilter === status
                  ? 'bg-[#714B67] text-white'
                  : 'bg-[#F8F9FA] text-[#495057] hover:bg-[#E9ECEF]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg border border-[#DEE2E6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-xs font-semibold text-[#495057] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Contract Number</th>
                <th className="px-4 py-3">Customer & Site</th>
                <th className="px-4 py-3">Quotation Reference</th>
                <th className="px-4 py-3 text-right">Contract Value</th>
                <th className="px-4 py-3">Milestones</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6C757D]">
                    Loading contracts...
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6C757D]">
                    No contracts found. Click "Generate Legal Contract" to initiate one.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="px-4 py-3 font-semibold text-[#714B67]">
                      <Link href={`/contracts/${c.id}`} className="hover:underline">
                        {c.contractNumber}
                      </Link>
                      <div className="text-[11px] font-normal text-[#6C757D]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#212529]">{c.customer?.name}</div>
                      <div className="text-xs text-[#6C757D]">{c.site?.siteName}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6C757D]">
                      Quote: <span className="font-semibold text-[#212529]">{c.quotation?.quotationNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#212529]">
                      ₹{Number(c.contractValue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                        {c.milestones?.length || 4} Milestones
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'FULFILLED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/contracts/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#714B67] hover:text-[#58394F] bg-[#714B67]/10 px-2.5 py-1.5 rounded transition"
                      >
                        Open Contract <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Contract */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#212529] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#714B67]" />
                Generate Legal Solar EPC Contract
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#6C757D] hover:text-[#212529] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">
                  Accepted Commercial Quotation
                </label>
                {quotations.length > 0 ? (
                  <select
                    required
                    value={form.quotationId}
                    onChange={(e) => setForm({ ...form, quotationId: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  >
                    <option value="">Select Accepted Quotation...</option>
                    {quotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotationNumber} - {q.customer?.name} (₹{Number(q.totalPayableAmount).toLocaleString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Accepted Quotation UUID"
                    value={form.quotationId}
                    onChange={(e) => setForm({ ...form, quotationId: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  />
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] text-xs text-[#6C757D] space-y-1">
                <span className="font-semibold text-[#212529]">Standard 4-Milestone Schedule will be generated:</span>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>20% Advance Payment on Contract Signing</li>
                  <li>40% Upon Structure Delivery & Equipment Dispatch</li>
                  <li>30% Upon Mechanical & Electrical Installation</li>
                  <li>10% Upon Discom Net Metering & System Commissioning</li>
                </ol>
              </div>

              <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#DEE2E6] rounded text-sm text-[#495057] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#714B67] text-white rounded text-sm font-semibold hover:bg-[#58394F] disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Generate Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
