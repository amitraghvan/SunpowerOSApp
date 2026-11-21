'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Scale,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
  FileSpreadsheet,
  ShieldAlert,
} from 'lucide-react';

export default function StockAdjustmentsPage() {
  const [counts, setCounts] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ADJUSTMENTS' | 'COUNTS'>('ADJUSTMENTS');
  const [search, setSearch] = useState('');

  // Modals
  const [createAdjModalOpen, setCreateAdjModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // Form
  const [adjForm, setAdjForm] = useState({
    warehouseId: '',
    productVariantId: '',
    adjustmentType: 'CORRECTION',
    quantity: 0,
    reason: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countsData, adjData] = await Promise.all([
        ApiClient.getStockCounts(),
        ApiClient.getStockAdjustments({ search }),
      ]);
      setCounts(countsData || []);
      setAdjustments(adjData || []);
    } catch (err) {
      console.error('Failed to load adjustments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenCreateModal = async () => {
    try {
      const [whData, stockData] = await Promise.all([
        ApiClient.getWarehouses(),
        ApiClient.getStockOverview(),
      ]);
      setWarehouses(whData || []);
      setVariants(stockData || []);
      if (whData && whData.length > 0) {
        setAdjForm((prev) => ({ ...prev, warehouseId: whData[0].id }));
      }
      setCreateAdjModalOpen(true);
    } catch (err) {
      console.error('Failed to prepare adjustment modal:', err);
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjForm.warehouseId || !adjForm.productVariantId) return;

    try {
      await ApiClient.createStockAdjustment({
        warehouseId: adjForm.warehouseId,
        productVariantId: adjForm.productVariantId,
        adjustmentType: adjForm.adjustmentType,
        quantity: Number(adjForm.quantity),
        reason: adjForm.reason,
      });

      setCreateAdjModalOpen(false);
      setAdjForm({
        warehouseId: '',
        productVariantId: '',
        adjustmentType: 'CORRECTION',
        quantity: 0,
        reason: '',
      });
      await fetchData();
    } catch (err: any) {
      alert(`Error creating adjustment: ${err.message}`);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await ApiClient.approveStockAdjustment(id, { notes: 'Approved after physical audit' });
      await fetchData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Stock Counts & Balance Adjustments</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical stock takes, cycle count variance reconciliation, and segregated supervisor authorizations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Request Adjustment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ADJUSTMENTS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            activeTab === 'ADJUSTMENTS'
              ? 'bg-[#714B67] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Adjustment Requests ({adjustments.length})
        </button>
        <button
          onClick={() => setActiveTab('COUNTS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            activeTab === 'COUNTS'
              ? 'bg-[#714B67] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Physical & Cycle Counts ({counts.length})
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search adjustments or count reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-1.5 text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Adjustments Table */}
      {activeTab === 'ADJUSTMENTS' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Adjustment #</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Product Variant</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Qty (+/-)</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Loading adjustments...
                    </td>
                  </tr>
                ) : adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No stock adjustments requested.
                    </td>
                  </tr>
                ) : (
                  adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                        {adj.adjustmentNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {adj.warehouse?.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{adj.productVariant?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{adj.productVariant?.sku}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {adj.adjustmentType}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          Number(adj.quantity) > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {Number(adj.quantity) > 0 ? `+${adj.quantity}` : adj.quantity}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {adj.reason}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {adj.createdBy?.firstName} {adj.createdBy?.lastName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            adj.status === 'POSTED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {adj.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {adj.status !== 'POSTED' && adj.status !== 'REJECTED' ? (
                          <button
                            onClick={() => handleApprove(adj.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded"
                          >
                            Approve & Post
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Posted</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Counts Table */}
      {activeTab === 'COUNTS' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Count Sheet #</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Items Counted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {counts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No stock count records found.
                    </td>
                  </tr>
                ) : (
                  counts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                        {c.countNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {c.warehouse?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {c.countType}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {c._count?.lines || 0} product lines
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {c.status}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Adjustment Modal */}
      {createAdjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Request Stock Adjustment</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Requires segregated supervisor approval before posting</p>
              </div>
              <button onClick={() => setCreateAdjModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse *</label>
                <select
                  required
                  value={adjForm.warehouseId}
                  onChange={(e) => setAdjForm({ ...adjForm, warehouseId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                >
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.code} - {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Component *</label>
                <select
                  required
                  value={adjForm.productVariantId}
                  onChange={(e) => setAdjForm({ ...adjForm, productVariantId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                >
                  <option value="">-- Choose Component --</option>
                  {variants.map((v) => (
                    <option key={v.productVariantId} value={v.productVariantId}>
                      {v.sku} - {v.productName} ({v.onHandStock} on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adjustment Type *</label>
                  <select
                    value={adjForm.adjustmentType}
                    onChange={(e) => setAdjForm({ ...adjForm, adjustmentType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                  >
                    <option value="CORRECTION">CORRECTION (Count Variance)</option>
                    <option value="DAMAGE">DAMAGE (Transit/Handling Damage)</option>
                    <option value="LOSS">LOSS (Missing / Scrap)</option>
                    <option value="FOUND">FOUND (Surplus / Found Item)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity (+ or -) *</label>
                  <input
                    type="number"
                    required
                    placeholder="-2 or +5"
                    value={adjForm.quantity}
                    onChange={(e) => setAdjForm({ ...adjForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Reason / Justification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical cycle count audit discovered 1 panel damaged during unloading"
                  value={adjForm.reason}
                  onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setCreateAdjModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
