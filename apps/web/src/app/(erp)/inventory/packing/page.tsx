'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  PackageCheck,
  Search,
  Filter,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertTriangle,
  X,
  Package,
  CheckSquare,
} from 'lucide-react';

export default function PackingWorkspacePage() {
  const [packingOrders, setPackingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedPacking, setSelectedPacking] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [dimensions, setDimensions] = useState<string>('120x80x160 cm');
  const [packageCount, setPackageCount] = useState<number>(1);

  const fetchPackingOrders = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getPackingOrders({ search });
      setPackingOrders(data || []);
    } catch (err) {
      console.error('Failed to load packing orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackingOrders();
  }, [search]);

  const handleOpenVerifyModal = async (packingId: string) => {
    try {
      const order = await ApiClient.getPackingOrderById(packingId);
      setSelectedPacking(order);
      setChecklist(order.checklistResults || []);
      setWeightKg(Number(order.totalWeightKg) || 120);
      setDimensions(order.dimensions || '120x80x160 cm');
      setPackageCount(order.packageCount || 1);
      setVerifyModalOpen(true);
    } catch (err) {
      console.error('Failed to load packing order:', err);
    }
  };

  const handleToggleChecklistItem = (index: number) => {
    const updated = [...checklist];
    updated[index].verified = !updated[index].verified;
    setChecklist(updated);
  };

  const handleConfirmPacking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacking) return;

    try {
      await ApiClient.confirmPackingOrder(selectedPacking.id, {
        packageCount,
        totalWeightKg: weightKg,
        dimensions,
        checklistResults: checklist,
        notes: 'Full QA checklist verified and approved for outbound dispatch',
      });

      setVerifyModalOpen(false);
      setSelectedPacking(null);
      await fetchPackingOrders();
    } catch (err: any) {
      alert(`Error verifying packing: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <PackageCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Packing Workspace & Dispatch Preparation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Conduct 8-point physical verification, log package weights/dimensions, and secure crates for site transport
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPackingOrders}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by packing ticket # or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
      </div>

      {/* Packing Orders Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Packing Ticket #</th>
                <th className="py-3 px-4">Sales Order / Project</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4 text-right">Packages</th>
                <th className="py-3 px-4 text-right">Weight (kg)</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading packing packages...
                  </td>
                </tr>
              ) : packingOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No packages currently staged for packing verification.
                  </td>
                </tr>
              ) : (
                packingOrders.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                      {p.packingNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {p.salesOrder?.orderNumber || p.projectInitiation?.projectCode || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.warehouse?.name || 'Central Facility'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      {p.packageCount} box(es)
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      {p.totalWeightKg ? `${p.totalWeightKg} kg` : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {p.dimensions || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenVerifyModal(p.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#714B67] bg-[#714B67]/5 hover:bg-[#714B67]/15 rounded transition"
                      >
                        {p.status === 'VERIFIED' ? 'View Checklist' : 'Verify & Sign-off &rarr;'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checklist Verification Modal */}
      {verifyModalOpen && selectedPacking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Packing Checklist & QA Verification: {selectedPacking.packingNumber}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confirm physical integrity before generating dispatch order
                </p>
              </div>
              <button onClick={() => setVerifyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPacking} className="space-y-4 text-xs">
              {/* Checklist items */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2 uppercase text-[10px] tracking-wider">
                  Mandatory Verification Checklist
                </label>
                <div className="space-y-2 border border-slate-200 rounded p-3 bg-slate-50/50">
                  {checklist.map((item, index) => (
                    <label
                      key={index}
                      className="flex items-start gap-2.5 cursor-pointer hover:bg-white p-1.5 rounded transition"
                    >
                      <input
                        type="checkbox"
                        checked={item.verified}
                        onChange={() => handleToggleChecklistItem(index)}
                        className="mt-0.5 rounded text-[#714B67] focus:ring-[#714B67]"
                      />
                      <span
                        className={`text-xs ${
                          item.verified ? 'text-slate-900 font-medium' : 'text-slate-600'
                        }`}
                      >
                        {item.item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Physical specifications */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Package Count</label>
                  <input
                    type="number"
                    min={1}
                    value={packageCount}
                    onChange={(e) => setPackageCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
                >
                  Confirm & Certify Packing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
