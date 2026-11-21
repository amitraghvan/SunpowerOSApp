'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  FileText,
  Boxes,
} from 'lucide-react';

export default function StockReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseReason, setReleaseReason] = useState('');

  // Create form state
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState({
    salesOrderId: '',
    warehouseId: '',
    notes: '',
  });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params: any = { search };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getStockReservations(params);
      setReservations(res?.items || res || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [search, statusFilter]);

  const handleOpenCreateModal = async () => {
    try {
      const [soData, whData] = await Promise.all([
        ApiClient.getSalesOrders(),
        ApiClient.getWarehouses(),
      ]);
      setSalesOrders(soData || []);
      setWarehouses(whData || []);
      setCreateModalOpen(true);
    } catch (err) {
      console.error('Failed to prepare reservation form:', err);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.salesOrderId) return;
    try {
      await ApiClient.createStockReservation(createForm);
      setCreateModalOpen(false);
      setCreateForm({ salesOrderId: '', warehouseId: '', notes: '' });
      await fetchReservations();
    } catch (err: any) {
      alert(`Error creating reservation: ${err.message || 'Check stock availability'}`);
    }
  };

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    try {
      await ApiClient.releaseStockReservation(selectedReservation.id, { reason: releaseReason });
      setReleaseModalOpen(false);
      setSelectedReservation(null);
      setReleaseReason('');
      await fetchReservations();
    } catch (err: any) {
      alert(`Error releasing reservation: ${err.message}`);
    }
  };

  const getAllocationBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKING':
      case 'FULLY_ALLOCATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            {status}
          </span>
        );
      case 'PARTIALLY_ALLOCATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Boxes className="w-3 h-3" />
            PARTIALLY_ALLOCATED
          </span>
        );
      case 'SHORTAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            SHORTAGE
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
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Project Stock Reservations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lock and allocate physical inventory directly from confirmed sales orders and approved BOM items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Reservation
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by reservation number, project code, or SO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="RESERVED">RESERVED</option>
            <option value="PARTIALLY_RESERVED">PARTIALLY_RESERVED</option>
            <option value="RELEASED">RELEASED</option>
            <option value="CONSUMED">CONSUMED</option>
          </select>
          <button
            onClick={fetchReservations}
            className="p-1.5 text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Reservation #</th>
                <th className="py-3 px-4">Sales Order / Project</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Allocation Status</th>
                <th className="py-3 px-4">Lifecycle</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading reservations...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No material reservations recorded.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                      {res.reservationNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{res.salesOrder?.orderNumber || 'Ad-hoc'}</div>
                      <div className="text-[11px] text-slate-500">{res.projectInitiation?.projectCode || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {res.warehouse?.name || 'Central Warehouse'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {res.reservationType}
                    </td>
                    <td className="py-3 px-4">
                      {getAllocationBadge(res.allocationStatus)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[11px] text-slate-700">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {res.status !== 'RELEASED' && res.status !== 'CONSUMED' && (
                          <button
                            onClick={() => {
                              setSelectedReservation(res);
                              setReleaseModalOpen(true);
                            }}
                            className="px-2 py-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
                          >
                            Release
                          </button>
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

      {/* Create Reservation Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Allocate Stock to Sales Order</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateReservation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Confirmed Sales Order *</label>
                <select
                  required
                  value={createForm.salesOrderId}
                  onChange={(e) => setCreateForm({ ...createForm, salesOrderId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                >
                  <option value="">-- Choose Sales Order --</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {so.orderNumber} ({so.customer?.name || 'Customer'}) - {Number(so.totalAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  The system will automatically read the approved BOM and reserve all required panels, inverters, and BOS components.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fulfillment Warehouse</label>
                <select
                  value={createForm.warehouseId}
                  onChange={(e) => setCreateForm({ ...createForm, warehouseId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                >
                  <option value="">-- All / Primary Warehouse --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.code} - {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allocation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional site staging notes..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
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
                  Execute Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Release Modal */}
      {releaseModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Release Reservation {selectedReservation.reservationNumber}?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This will release all allocated solar modules and inverter serials back into the free available stock pool.
            </p>
            <form onSubmit={handleRelease} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Release</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project rescheduled or cancelled"
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReleaseModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded"
                >
                  Confirm Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
