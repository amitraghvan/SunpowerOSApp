'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Key,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Tag,
  Zap,
} from 'lucide-react';

export default function SerialTraceabilityPage() {
  const [serials, setSerials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchSerials = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getProductSerials(params);
      setSerials(res || []);
    } catch (err: any) {
      console.error('Failed to load serial numbers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSerials();
  }, [statusFilter]);

  const filtered = serials.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.manufacturerSerialNumber?.toLowerCase().includes(q) ||
      s.internalAssetCode?.toLowerCase().includes(q) ||
      s.productVariant?.name?.toLowerCase().includes(q) ||
      s.batchNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#6366F1]" />
            Asset Serial Traceability & Technical Specs Ledger
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Individual barcode tracking for solar PV modules, string inverters & batteries from receipt to commissioning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSerials}
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
              placeholder="Search by OEM serial, asset code, batch or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded text-xs focus:outline-none focus:border-[#6366F1]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6C757D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#CED4DA] rounded py-1.5 px-2 text-xs focus:outline-none focus:border-[#6366F1]"
            >
              <option value="ALL">All Asset Statuses</option>
              <option value="IN_STOCK">In Stock (Available)</option>
              <option value="ALLOCATED">Allocated to Project</option>
              <option value="DISPATCHED">Dispatched to Site</option>
              <option value="INSTALLED">Installed & Commissioned</option>
              <option value="RETURNED_TO_VENDOR">Returned to Vendor</option>
            </select>
          </div>
        </div>

        <div className="text-[#6C757D]">
          Tracked Serials: <span className="font-semibold text-[#212529]">{filtered.length}</span>
        </div>
      </div>

      {/* Serials Table */}
      <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b text-[#495057] font-semibold">
              <th className="py-2.5 px-3">Internal Asset Code</th>
              <th className="py-2.5 px-3">Manufacturer Serial No</th>
              <th className="py-2.5 px-3">Equipment Product & Variant</th>
              <th className="py-2.5 px-3">Batch Number</th>
              <th className="py-2.5 px-3">Electrical Measurements</th>
              <th className="py-2.5 px-3">Warranty (Months)</th>
              <th className="py-2.5 px-3">GRN Document</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                  Loading serial numbers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                  No product serials found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8F9FA]">
                  <td className="py-2.5 px-3 font-semibold text-[#6366F1] font-mono">
                    {s.internalAssetCode}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-[#212529]">
                    {s.manufacturerSerialNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#212529]">{s.productVariant?.name}</div>
                    <div className="text-[11px] font-mono text-[#6C757D]">{s.productVariant?.sku}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#495057]">{s.batchNumber || '—'}</td>
                  <td className="py-2.5 px-3">
                    {s.electricalSpecs ? (
                      <div className="text-[11px] font-mono text-[#0F5132]">
                        {s.electricalSpecs.pmax && `Pmax: ${s.electricalSpecs.pmax}W `}
                        {s.electricalSpecs.voc && `Voc: ${s.electricalSpecs.voc}V `}
                        {s.electricalSpecs.isc && `Isc: ${s.electricalSpecs.isc}A`}
                      </div>
                    ) : (
                      <span className="text-[#ADB5BD]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#495057]">{s.warrantyPeriodMonths || 60} Mo</td>
                  <td className="py-2.5 px-3 font-mono text-[#714B67]">
                    {s.goodsReceiptNote?.grnNumber || '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'IN_STOCK'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : s.status === 'INSTALLED'
                          ? 'bg-[#CFF4FC] text-[#055160]'
                          : s.status === 'RETURNED_TO_VENDOR'
                          ? 'bg-[#F8D7DA] text-[#842029]'
                          : 'bg-[#FFF3CD] text-[#664D03]'
                      }`}
                    >
                      {s.status}
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
