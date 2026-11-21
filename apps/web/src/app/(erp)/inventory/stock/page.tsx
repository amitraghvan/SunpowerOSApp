'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Boxes,
  Key,
  History,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function StockOverviewPage() {
  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Drawer state for detailed view
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantDetails, setVariantDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getStockOverview({ search });
      setStockList(data || []);
    } catch (err) {
      console.error('Failed to load stock overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [search]);

  const handleOpenDetails = async (variantId: string) => {
    setSelectedVariantId(variantId);
    setLoadingDetails(true);
    try {
      const details = await ApiClient.getProductStockDetails(variantId);
      setVariantDetails(details);
    } catch (err) {
      console.error('Failed to load variant details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Stock Visibility & Inventory Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Accurate real-time stock balances dynamically calculated from accepted GRNs, allocations, and dispatch issues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Formula Info Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
            Available Stock
          </span>
          <span>=</span>
          <span className="font-semibold text-slate-800 bg-slate-200/60 px-2 py-0.5 rounded">
            Accepted On-Hand Stock
          </span>
          <span>-</span>
          <span className="font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
            Active Reservations
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Source of Truth: Immutable Inbound/Outbound Ledger
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Product Variant / SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4 text-right">Total Received</th>
                <th className="py-3 px-4 text-right">On-Hand</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4 text-right bg-emerald-50/40 text-emerald-900 font-extrabold">Available</th>
                <th className="py-3 px-4 text-right">Picked</th>
                <th className="py-3 px-4 text-right">Dispatched</th>
                <th className="py-3 px-4 text-right">Quarantine</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Loading stock records...
                  </td>
                </tr>
              ) : stockList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No product stock records found.
                  </td>
                </tr>
              ) : (
                stockList.map((item) => (
                  <tr key={item.productVariantId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{item.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 text-slate-600">{item.manufacturer}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {item.totalReceived} <span className="text-[10px] text-slate-400">{item.uom}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      {item.onHandStock} <span className="text-[10px] text-slate-400">{item.uom}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-700 font-semibold">
                      {item.activeReservations} <span className="text-[10px] text-slate-400">{item.uom}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 bg-emerald-50/40">
                      {item.availableStock} <span className="text-[10px] text-emerald-600">{item.uom}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {item.pickedStock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {item.dispatchedStock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700 font-semibold">
                      {item.quarantinedStock > 0 ? item.quarantinedStock : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetails(item.productVariantId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#714B67] bg-[#714B67]/5 hover:bg-[#714B67]/15 rounded transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Variant Details Drawer */}
      {selectedVariantId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {variantDetails?.variant?.product || 'Product Stock Detail'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {variantDetails?.variant?.sku} • {variantDetails?.variant?.manufacturer}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVariantId(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingDetails ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  Loading product serials and movement details...
                </div>
              ) : variantDetails ? (
                <div className="space-y-5 text-xs">
                  {/* Stock Metrics summary */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">On-Hand</div>
                      <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                        {variantDetails.stock.onHandStock}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-blue-600 uppercase font-semibold">Reserved</div>
                      <div className="text-base font-bold text-blue-700 font-mono mt-0.5">
                        {variantDetails.stock.activeReserved}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-700 uppercase font-semibold">Available</div>
                      <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                        {variantDetails.stock.availableStock}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-700 uppercase font-semibold">Quarantine</div>
                      <div className="text-base font-bold text-amber-700 font-mono mt-0.5">
                        {variantDetails.stock.quarantinedStock}
                      </div>
                    </div>
                  </div>

                  {/* Registered Serials */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Key className="w-3.5 h-3.5 text-[#714B67]" />
                      Tracked Serials ({variantDetails.serials?.length || 0})
                    </h4>
                    {variantDetails.serials?.length === 0 ? (
                      <p className="text-slate-400 italic">No serial numbers registered yet for this variant.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100">
                        {variantDetails.serials.map((s: any) => (
                          <div key={s.id} className="p-2 flex items-center justify-between text-[11px]">
                            <div>
                              <div className="font-mono font-semibold text-slate-800">{s.manufacturerSerialNumber}</div>
                              <div className="text-slate-400 text-[10px]">{s.internalAssetCode}</div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  s.status === 'IN_STOCK'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.status === 'ALLOCATED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : s.status === 'DISPATCHED'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {s.status}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {s.storageLocation?.code || 'General'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Reservations */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Boxes className="w-3.5 h-3.5 text-blue-600" />
                      Active Project Reservations
                    </h4>
                    {variantDetails.reservations?.length === 0 ? (
                      <p className="text-slate-400 italic">No current project reservations.</p>
                    ) : (
                      <div className="border border-slate-200 rounded divide-y divide-slate-100">
                        {variantDetails.reservations.map((r: any, idx: number) => (
                          <div key={idx} className="p-2 flex items-center justify-between text-[11px]">
                            <div>
                              <div className="font-semibold text-slate-800">{r.projectCode || r.orderNumber}</div>
                              <div className="text-slate-500">{r.reservationNumber}</div>
                            </div>
                            <div className="font-mono font-bold text-blue-700">
                              {r.quantityReserved} reserved
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Movement History */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <History className="w-3.5 h-3.5 text-slate-600" />
                      Recent Ledger Movements
                    </h4>
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100 text-[11px]">
                      {variantDetails.movements?.map((m: any) => (
                        <div key={m.id} className="p-2 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{m.movementType}</span>
                            <div className="text-slate-400 text-[10px]">{m.movementNumber} • {m.notes}</div>
                          </div>
                          <div className="text-right font-mono font-bold text-slate-700">
                            {m.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-6 flex justify-end">
              <button
                onClick={() => setSelectedVariantId(null)}
                className="px-4 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
