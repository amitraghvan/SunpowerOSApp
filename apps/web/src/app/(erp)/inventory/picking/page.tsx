'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  CheckSquare,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Barcode,
  CheckCircle,
  AlertTriangle,
  X,
  Warehouse,
} from 'lucide-react';

export default function PickingOperationsPage() {
  const [pickingOrders, setPickingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Picking execution modal
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [pickedLines, setPickedLines] = useState<Record<string, { qty: number; serials: string }>>({});

  const fetchPickingOrders = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getPickingOrders({ search });
      setPickingOrders(data || []);
    } catch (err) {
      console.error('Failed to load picking orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickingOrders();
  }, [search]);

  const handleOpenExecuteModal = async (orderId: string) => {
    try {
      const order = await ApiClient.getPickingOrderById(orderId);
      setSelectedOrder(order);

      const initialLines: Record<string, { qty: number; serials: string }> = {};
      for (const line of order.lines || []) {
        initialLines[line.id] = {
          qty: Number(line.requiredQuantity),
          serials: (line.scannedSerials || []).join(', '),
        };
      }
      setPickedLines(initialLines);
      setExecuteModalOpen(true);
    } catch (err) {
      console.error('Failed to load order for picking:', err);
    }
  };

  const handleConfirmPicking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const linesPayload = (selectedOrder.lines || []).map((line: any) => {
        const item = pickedLines[line.id];
        const serialsArr = item?.serials
          ? item.serials.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
          : [];

        return {
          pickingOrderLineId: line.id,
          pickedQuantity: Number(item?.qty ?? line.requiredQuantity),
          scannedSerials: serialsArr,
        };
      });

      await ApiClient.confirmPickingOrder(selectedOrder.id, {
        lines: linesPayload,
        notes: 'Picking verified at staging dock',
      });

      setExecuteModalOpen(false);
      setSelectedOrder(null);
      await fetchPickingOrders();
    } catch (err: any) {
      alert(`Error confirming picking: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Material Picking & Serial Validation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Process warehouse pick tickets, scan barcode asset tags, and verify staging for project orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPickingOrders}
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
            placeholder="Search by pick number, sales order, or project code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
      </div>

      {/* Picking Orders Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Pick Ticket #</th>
                <th className="py-3 px-4">Sales Order</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading picking tickets...
                  </td>
                </tr>
              ) : pickingOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No picking orders active. Create stock reservations from confirmed sales orders to generate pick lists.
                  </td>
                </tr>
              ) : (
                pickingOrders.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                      {p.pickingNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {p.salesOrder?.orderNumber || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.projectInitiation?.projectCode || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.warehouse?.name || 'Primary Facility'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {p._count?.lines || 0} line items
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'PICKED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'PARTIALLY_PICKED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenExecuteModal(p.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#714B67] bg-[#714B67]/5 hover:bg-[#714B67]/15 rounded transition"
                      >
                        {p.status === 'PICKED' ? 'View Slip' : 'Pick Items &rarr;'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Picking Execution Modal */}
      {executeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Execute Pick Ticket: {selectedOrder.pickingNumber}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Order: {selectedOrder.salesOrder?.orderNumber} • Project: {selectedOrder.projectInitiation?.projectCode}
                </p>
              </div>
              <button onClick={() => setExecuteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPicking} className="space-y-4 text-xs">
              <div className="border border-slate-200 rounded divide-y divide-slate-100">
                {(selectedOrder.lines || []).map((line: any) => (
                  <div key={line.id} className="p-3 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{line.productVariant?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{line.productVariant?.sku}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500">Reserved:</span>{' '}
                        <strong className="font-mono text-slate-800">{line.requiredQuantity}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Picked Quantity
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={Number(line.requiredQuantity)}
                          value={pickedLines[line.id]?.qty ?? line.requiredQuantity}
                          onChange={(e) =>
                            setPickedLines({
                              ...pickedLines,
                              [line.id]: {
                                ...pickedLines[line.id],
                                qty: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          Scanned Serials (comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. SN-INV-9921, SN-INV-9922"
                          value={pickedLines[line.id]?.serials ?? ''}
                          onChange={(e) =>
                            setPickedLines({
                              ...pickedLines,
                              [line.id]: {
                                ...pickedLines[line.id],
                                serials: e.target.value,
                              },
                            })
                          }
                          className="w-full p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setExecuteModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
                >
                  Confirm & Stage for Packing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
