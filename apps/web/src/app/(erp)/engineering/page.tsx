'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Sun,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Layers,
  Zap,
  Activity,
  FileCheck,
  RefreshCw,
} from 'lucide-react';

export default function EngineeringListPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [form, setForm] = useState({
    customerId: '',
    siteId: '',
    surveyId: '',
    title: '',
    systemType: 'ON_GRID',
    connectionType: 'THREE_PHASE',
    targetCapacityKw: 5.0,
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getDesigns(params);
      setDesigns(res || []);
    } catch (err: any) {
      console.error('Failed to fetch designs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
    loadLookups();
  }, [statusFilter]);

  const loadLookups = async () => {
    try {
      const [custRes, survRes] = await Promise.all([
        ApiClient.getCustomers().catch(() => ({ data: [] })),
        ApiClient.getSurveys({ status: 'APPROVED' }).catch(() => ({ data: [] })),
      ]);
      setCustomers(custRes.data || []);
      setSurveys(survRes.data || []);
    } catch {
      // fallback
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await ApiClient.createDesign({
        customerId: form.customerId,
        siteId: form.siteId,
        surveyId: form.surveyId || undefined,
        title: form.title,
        systemType: form.systemType,
        connectionType: form.connectionType,
        targetCapacityKw: Number(form.targetCapacityKw),
      });
      setIsModalOpen(false);
      setForm({
        customerId: '',
        siteId: '',
        surveyId: '',
        title: '',
        systemType: 'ON_GRID',
        connectionType: 'THREE_PHASE',
        targetCapacityKw: 5.0,
      });
      await fetchDesigns();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create engineering design');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDesigns = designs.filter((d) => {
    const term = search.toLowerCase();
    const matchesSearch =
      d.designNumber?.toLowerCase().includes(term) ||
      d.title?.toLowerCase().includes(term) ||
      d.customer?.name?.toLowerCase().includes(term);
    return matchesSearch;
  });

  const totalCap = designs.reduce((acc, d) => acc + (Number(d.targetCapacityKw) || 0), 0);
  const approvedCount = designs.filter((d) => d.status === 'APPROVED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Sun className="w-7 h-7 text-[#714B67]" />
            Solar Engineering & Technical Design
          </h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Photovoltaic system sizing, electrical protection, standards validation and automated BOM generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDesigns()}
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
            New Engineering Design
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Total Designs</p>
            <p className="text-2xl font-bold text-[#212529] mt-1">{designs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#714B67]/10 flex items-center justify-center text-[#714B67]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Approved Designs</p>
            <p className="text-2xl font-bold text-[#017E84] mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#017E84]/10 flex items-center justify-center text-[#017E84]">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">In Review / Draft</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {designs.filter((d) => d.status === 'DRAFT' || d.status === 'UNDER_REVIEW').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6C757D] uppercase">Design Capacity</p>
            <p className="text-2xl font-bold text-[#212529] mt-1">{totalCap.toFixed(1)} kWp</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#DEE2E6] shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Design #, customer, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6C757D] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'DRAFT', 'UNDER_REVIEW', 'APPROVED'].map((status) => (
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

      {/* Designs Table */}
      <div className="bg-white rounded-lg border border-[#DEE2E6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-xs font-semibold text-[#495057] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Design Number</th>
                <th className="px-4 py-3">Project Title & Customer</th>
                <th className="px-4 py-3">System Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Compatibility</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6C757D]">
                    Loading engineering designs...
                  </td>
                </tr>
              ) : filteredDesigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6C757D]">
                    No engineering designs found. Click "New Engineering Design" to start technical sizing.
                  </td>
                </tr>
              ) : (
                filteredDesigns.map((d) => {
                  const currentRev = d.revisions?.[0] || {};
                  return (
                    <tr key={d.id} className="hover:bg-[#F8F9FA] transition">
                      <td className="px-4 py-3 font-semibold text-[#714B67]">
                        <Link href={`/engineering/${d.id}`} className="hover:underline">
                          {d.designNumber}
                        </Link>
                        <div className="text-[11px] font-normal text-[#6C757D]">
                          Rev {d.currentRevisionNumber || 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#212529]">{d.title}</div>
                        <div className="text-xs text-[#6C757D]">
                          {d.customer?.name || 'Customer'} • {d.site?.siteName || 'Rooftop Site'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                          {d.systemType} ({d.connectionType === 'THREE_PHASE' ? '3-Ph' : '1-Ph'})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#212529]">
                          {Number(d.targetCapacityKw).toFixed(1)} kWp
                        </div>
                        {currentRev.totalDcCapacityKw && (
                          <div className="text-[11px] text-[#6C757D]">
                            DC: {Number(currentRev.totalDcCapacityKw).toFixed(2)} kW
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {currentRev.compatibilityStatus === 'COMPATIBLE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Compatible
                          </span>
                        ) : currentRev.compatibilityStatus === 'INCOMPATIBLE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Incompatible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending Calc
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            d.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'UNDER_REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/engineering/${d.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#714B67] hover:text-[#58394F] bg-[#714B67]/10 px-2.5 py-1.5 rounded transition"
                        >
                          Open Workspace <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#212529] flex items-center gap-2">
                <Sun className="w-5 h-5 text-[#714B67]" />
                Initiate New Engineering Design
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
                <label className="block text-xs font-semibold text-[#495057] mb-1">Project / Design Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5kWp Rooftop Solar - Roy Clinic"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded focus:ring-1 focus:ring-[#714B67] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#495057] mb-1">Customer</label>
                  {customers.length > 0 ? (
                    <select
                      required
                      value={form.customerId}
                      onChange={(e) => {
                        const cid = e.target.value;
                        const c = customers.find((x) => x.id === cid);
                        setForm({
                          ...form,
                          customerId: cid,
                          siteId: c?.sites?.[0]?.id || '',
                        });
                        setSites(c?.sites || []);
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                    >
                      <option value="">Select Customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.customerNumber})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Customer UUID"
                      value={form.customerId}
                      onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#495057] mb-1">Customer Site</label>
                  {sites.length > 0 ? (
                    <select
                      required
                      value={form.siteId}
                      onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                    >
                      <option value="">Select Site...</option>
                      {sites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.siteName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Site UUID"
                      value={form.siteId}
                      onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">
                  Approved Site Survey Reference (Optional)
                </label>
                {surveys.length > 0 ? (
                  <select
                    value={form.surveyId}
                    onChange={(e) => setForm({ ...form, surveyId: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  >
                    <option value="">None / Manual Engineering</option>
                    {surveys.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.surveyNumber} - {s.customer?.name} ({s.recommendedCapacityKw} kW recommended)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Survey UUID (Optional)"
                    value={form.surveyId}
                    onChange={(e) => setForm({ ...form, surveyId: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#495057] mb-1">System Type</label>
                  <select
                    value={form.systemType}
                    onChange={(e) => setForm({ ...form, systemType: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  >
                    <option value="ON_GRID">On-Grid</option>
                    <option value="OFF_GRID">Off-Grid</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#495057] mb-1">Phase</label>
                  <select
                    value={form.connectionType}
                    onChange={(e) => setForm({ ...form, connectionType: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  >
                    <option value="SINGLE_PHASE">Single Phase</option>
                    <option value="THREE_PHASE">Three Phase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#495057] mb-1">Target kW</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={form.targetCapacityKw}
                    onChange={(e) => setForm({ ...form, targetCapacityKw: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                  />
                </div>
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
                  {submitting ? 'Creating...' : 'Create Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
