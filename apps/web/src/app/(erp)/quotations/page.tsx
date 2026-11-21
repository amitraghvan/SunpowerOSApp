'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  Receipt,
  FileCheck,
  RefreshCw,
  Tag,
  IndianRupee,
} from 'lucide-react';

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Creation form state
  const [form, setForm] = useState({
    customerId: '',
    siteId: '',
    designId: '',
    bomId: '',
    discountPercent: 0,
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getQuotations(params);
      setQuotations(res || []);
    } catch (err: any) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    loadLookups();
  }, [statusFilter]);

  const loadLookups = async () => {
    try {
      const [custRes, desRes] = await Promise.all([
        ApiClient.getCustomers().catch(() => ({ data: [] })),
        ApiClient.getDesigns({ status: 'APPROVED' }).catch(() => []),
      ]);
      setCustomers(custRes.data || []);
      setDesigns(desRes || []);
    } catch {
      // fallback
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await ApiClient.createQuotation({
        customerId: form.customerId,
        siteId: form.siteId,
        designId: form.designId,
        bomId: form.bomId,
        discountPercent: Number(form.discountPercent),
      });
      setIsModalOpen(false);
      setForm({
        customerId: '',
        siteId: '',
        designId: '',
        bomId: '',
        discountPercent: 0,
      });
      await fetchQuotations();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    const term = search.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(term) ||
      q.customer?.name?.toLowerCase().includes(term)
    );
  });

  const totalPayableValue = quotations.reduce(
    (acc, q) => acc + (Number(q.totalPayableAmount) || 0),
    0
  );
  const acceptedCount = quotations.filter((q) => q.status === 'ACCEPTED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Receipt className="w-7 h-7 text-[#714B67]" />
            Commercial Quotations & Pricing
          </h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Transparent solar EPC costing, margins, 13.8% composite Indian GST, PM Surya Ghar subsidy tiers, and digital acceptance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchQuotations()}
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
            New Commercial Quotation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Total Quotations</p>
            <p className="text-2xl font-bold text-[#212529] mt-1">{quotations.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#714B67]/10 flex items-center justify-center text-[#714B67]">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Accepted Quotes</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{acceptedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Under Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {quotations.filter((q) => q.status === 'DRAFT' || q.status === 'SUBMITTED').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Total Pipeline</p>
            <p className="text-2xl font-bold text-[#017E84] mt-1">
              ₹{Math.round(totalPayableValue).toLocaleString()}
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
            placeholder="Search Quotation #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#CED4DA] rounded focus:ring-1 focus:ring-[#714B67] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6C757D] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'DRAFT', 'APPROVED', 'ACCEPTED'].map((status) => (
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

      {/* Quotations Table */}
      <div className="bg-white rounded-lg border border-[#DEE2E6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-xs font-semibold text-[#495057] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Quotation Number</th>
                <th className="px-4 py-3">Customer & Site</th>
                <th className="px-4 py-3">Engineering Ref</th>
                <th className="px-4 py-3 text-right">Base / GST</th>
                <th className="px-4 py-3 text-right">PM Subsidy</th>
                <th className="px-4 py-3 text-right">Customer Payable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#6C757D]">
                    Loading quotations...
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#6C757D]">
                    No quotations found. Click "New Commercial Quotation" to create one.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="px-4 py-3 font-semibold text-[#714B67]">
                      <Link href={`/quotations/${q.id}`} className="hover:underline">
                        {q.quotationNumber}
                      </Link>
                      <div className="text-[11px] font-normal text-[#6C757D]">
                        v{q.versionNumber || 1} • {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#212529]">{q.customer?.name}</div>
                      <div className="text-xs text-[#6C757D]">{q.site?.siteName}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6C757D]">
                      <div>Design: <span className="font-medium text-[#212529]">{q.design?.designNumber}</span></div>
                      <div>BOM: <span className="font-medium text-[#212529]">{q.bom?.bomNumber}</span></div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      <div className="font-semibold text-[#212529]">
                        ₹{Number(q.finalPrice || 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#6C757D]">
                        +₹{Number(q.totalTaxAmount || 0).toLocaleString()} GST
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      {Number(q.subsidyAmount || 0) > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          -₹{Number(q.subsidyAmount).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#6C757D]">₹0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-sm text-[#017E84]">
                      ₹{Number(q.totalPayableAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          q.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/quotations/${q.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#714B67] hover:text-[#58394F] bg-[#714B67]/10 px-2.5 py-1.5 rounded transition"
                      >
                        View Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Quotation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#212529] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#714B67]" />
                Generate Commercial Quotation
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
                <label className="block text-xs font-semibold text-[#495057] mb-1">Approved Engineering Design</label>
                {designs.length > 0 ? (
                  <select
                    required
                    value={form.designId}
                    onChange={(e) => {
                      const did = e.target.value;
                      const d = designs.find((x) => x.id === did);
                      setForm({
                        ...form,
                        designId: did,
                        customerId: d?.customerId || '',
                        siteId: d?.siteId || '',
                        bomId: d?.billsOfMaterials?.[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  >
                    <option value="">Select Design...</option>
                    {designs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.designNumber} - {d.title} ({d.customer?.name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Engineering Design UUID"
                    value={form.designId}
                    onChange={(e) => setForm({ ...form, designId: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#495057] mb-1">Customer ID</label>
                  <input
                    type="text"
                    required
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#495057] mb-1">Customer Site ID</label>
                  <input
                    type="text"
                    required
                    value={form.siteId}
                    onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">Approved BOM Reference</label>
                <input
                  type="text"
                  required
                  placeholder="BOM UUID"
                  value={form.bomId}
                  onChange={(e) => setForm({ ...form, bomId: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">Commercial Discount (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="25"
                  value={form.discountPercent}
                  onChange={(e) => setForm({ ...form, discountPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                />
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
                  {submitting ? 'Creating...' : 'Create Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
