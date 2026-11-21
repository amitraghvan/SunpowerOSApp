'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  X,
  Warehouse,
} from 'lucide-react';

export default function WarehouseTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [transferForm, setTransferForm] = useState({
    transferType: 'INTER_WAREHOUSE',
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    productVariantId: '',
    quantity: 1,
    reason: '',
  });

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getStockTransfers({ search });
      setTransfers(data?.items || data || []);
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [search]);

  const handleOpenCreateModal = async () => {
    try {
      const [whData, stockData] = await Promise.all([
        ApiClient.getWarehouses(),
        ApiClient.getStockOverview(),
      ]);
      setWarehouses(whData || []);
      setVariants(stockData || []);
      if (whData && whData.length >= 2) {
        setTransferForm((prev) => ({
          ...prev,
          sourceWarehouseId: whData[0].id,
          destinationWarehouseId: whData[1].id,
        }));
      }
      setCreateModalOpen(true);
    } catch (err) {
      console.error('Failed to prepare transfer modal:', err);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.productVariantId || !transferForm.sourceWarehouseId) return;
    try {
      await ApiClient.createStockTransfer({
        transferType: transferForm.transferType,
        sourceWarehouseId: transferForm.sourceWarehouseId,
        destinationWarehouseId: transferForm.destinationWarehouseId,
        reason: transferForm.reason,
        lines: [
          {
            productVariantId: transferForm.productVariantId,
            requestedQuantity: Number(transferForm.quantity),
          },
        ],
      });
      setCreateModalOpen(false);
      await fetchTransfers();
    } catch (err: any) {
      alert(`Error creating transfer: ${err.message}`);
    }
  };

  const handleShip = async (transferId: string) => {
    try {
      await ApiClient.shipStockTransfer(transferId, { notes: 'Dispatched via internal vehicle' });
      await fetchTransfers();
    } catch (err: any) {
      alert(`Error shipping transfer: ${err.message}`);
    }
  };

  const handleReceive = async (transferId: string) => {
    try {
      await ApiClient.receiveStockTransfer(transferId, { notes: 'Received and verified at destination' });
      await fetchTransfers();
    } catch (err: any) {
      alert(`Error receiving transfer: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" />
            IN_TRANSIT
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            APPROVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <ArrowLeftRight className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Warehouse & Bin Transfers</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute controlled inter-facility transfers with synchronized source deduction and destination receiving
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Transfer Request
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by transfer reference or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
        <button
          onClick={fetchTransfers}
          className="p-1.5 text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Transfer #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4">Destination Location</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No warehouse transfers recorded yet.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                      {t.transferNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                      {t.transferType}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {t.sourceWarehouse?.name || 'Central Facility'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {t.destinationWarehouse?.name || 'Regional Depot'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {t.reason || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.status === 'REQUESTED' || t.status === 'APPROVED' ? (
                        <button
                          onClick={() => handleShip(t.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded"
                        >
                          Ship &rarr;
                        </button>
                      ) : t.status === 'IN_TRANSIT' ? (
                        <button
                          onClick={() => handleReceive(t.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded"
                        >
                          Receive Inward
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Transfer Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Create Material Transfer</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Warehouse *</label>
                  <select
                    required
                    value={transferForm.sourceWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, sourceWarehouseId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                  >
                    <option value="">-- Choose Source --</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.code} - {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination *</label>
                  <select
                    required
                    value={transferForm.destinationWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, destinationWarehouseId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                  >
                    <option value="">-- Choose Destination --</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.code} - {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Component *</label>
                <select
                  required
                  value={transferForm.productVariantId}
                  onChange={(e) => setTransferForm({ ...transferForm, productVariantId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                >
                  <option value="">-- Choose Component --</option>
                  {variants.map((v) => (
                    <option key={v.productVariantId} value={v.productVariantId}>
                      {v.sku} ({v.productName}) - {v.availableStock} {v.uom} available
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity to Transfer *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Transfer</label>
                <input
                  type="text"
                  placeholder="e.g. Regional project stock replenishment"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
                >
                  Initiate Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
