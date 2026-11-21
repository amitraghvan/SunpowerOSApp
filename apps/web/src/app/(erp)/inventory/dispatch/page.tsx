'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Printer,
  FileCheck,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function DispatchManagementPage() {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'CHALLANS'>('DISPATCH');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);
  const [podModalOpen, setPodModalOpen] = useState<boolean>(false);
  const [challanModalOpen, setChallanModalOpen] = useState<boolean>(false);
  const [selectedChallan, setSelectedChallan] = useState<any>(null);

  // POD form
  const [podForm, setPodForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverSignatureUrl: '',
    isDamaged: false,
    damageDescription: '',
    shortageQuantity: 0,
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dispData, chalData] = await Promise.all([
        ApiClient.getDispatchOrders({ search }),
        ApiClient.getDeliveryChallans({ search }),
      ]);
      setDispatches(dispData || []);
      setChallans(chalData || []);
    } catch (err) {
      console.error('Failed to load dispatch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handlePostDispatch = async (dispatchId: string) => {
    try {
      await ApiClient.postDispatchOrder(dispatchId);
      await fetchData();
    } catch (err: any) {
      alert(`Error posting dispatch: ${err.message}`);
    }
  };

  const handleGenerateChallan = async (dispatch: any) => {
    try {
      const challan = await ApiClient.createDeliveryChallan({
        dispatchOrderId: dispatch.id,
        transporterName: dispatch.transporterName,
        vehicleNumber: dispatch.vehicleNumber,
        receiverName: dispatch.customer?.name,
        receiverPhone: dispatch.customer?.phone,
        deliverySite: dispatch.deliveryAddress,
      });
      setSelectedChallan(challan);
      setChallanModalOpen(true);
      await fetchData();
    } catch (err: any) {
      alert(`Error generating challan: ${err.message}`);
    }
  };

  const handleConfirmPOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispatch) return;

    try {
      await ApiClient.confirmDispatchDelivery(selectedDispatch.id, podForm);
      setPodModalOpen(false);
      setSelectedDispatch(null);
      setPodForm({
        receiverName: '',
        receiverPhone: '',
        receiverSignatureUrl: '',
        isDamaged: false,
        damageDescription: '',
        shortageQuantity: 0,
        notes: '',
      });
      await fetchData();
    } catch (err: any) {
      alert(`Error confirming POD: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            DELIVERED
          </span>
        );
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" />
            {status}
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
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Outbound Dispatch, Challan & POD</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage physical deliveries to customer sites, official Delivery Challans, and digital proof-of-delivery evidence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('DISPATCH')}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            activeTab === 'DISPATCH'
              ? 'bg-[#714B67] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dispatch Orders ({dispatches.length})
        </button>
        <button
          onClick={() => setActiveTab('CHALLANS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            activeTab === 'CHALLANS'
              ? 'bg-[#714B67] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Delivery Challans ({challans.length})
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'DISPATCH'
                ? 'Search dispatch #, transporter, or customer...'
                : 'Search challan # or customer...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
      </div>

      {/* Table: Dispatch Orders */}
      {activeTab === 'DISPATCH' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Dispatch Ticket #</th>
                  <th className="py-3 px-4">Customer & Project</th>
                  <th className="py-3 px-4">Origin Facility</th>
                  <th className="py-3 px-4">Transporter & Vehicle</th>
                  <th className="py-3 px-4">Challan Ref</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading dispatch orders...
                    </td>
                  </tr>
                ) : dispatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No outbound dispatch orders recorded.
                    </td>
                  </tr>
                ) : (
                  dispatches.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                        {d.dispatchNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{d.customer?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {d.salesOrder?.orderNumber || d.projectCode || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {d.warehouse?.name || 'Central Facility'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div>{d.transporterName || 'Self Transport'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{d.vehicleNumber || '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#714B67] font-semibold">
                        {d.deliveryChallan?.challanNumber || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(d.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {d.status === 'READY_FOR_DISPATCH' || d.status === 'APPROVED' ? (
                            <button
                              onClick={() => handlePostDispatch(d.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
                            >
                              Post Dispatch &rarr;
                            </button>
                          ) : null}

                          {!d.deliveryChallan?.challanNumber && d.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleGenerateChallan(d)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded"
                            >
                              Create Challan
                            </button>
                          )}

                          {d.status === 'DISPATCHED' || d.status === 'IN_TRANSIT' ? (
                            <button
                              onClick={() => {
                                setSelectedDispatch(d);
                                setPodForm({
                                  receiverName: d.customer?.name || '',
                                  receiverPhone: d.customer?.phone || '',
                                  receiverSignatureUrl: '',
                                  isDamaged: false,
                                  damageDescription: '',
                                  shortageQuantity: 0,
                                  notes: '',
                                });
                                setPodModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded"
                            >
                              Confirm POD
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: Delivery Challans */}
      {activeTab === 'CHALLANS' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Challan #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Sales Order</th>
                  <th className="py-3 px-4">Dispatch Order</th>
                  <th className="py-3 px-4">Site Address</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Print / View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No delivery challans generated yet.
                    </td>
                  </tr>
                ) : (
                  challans.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold font-mono text-[#714B67]">
                        {c.challanNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {c.customer?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {c.salesOrder?.orderNumber || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {c.dispatchOrder?.dispatchNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {c.deliverySite || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(c.challanDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={async () => {
                            const full = await ApiClient.getDeliveryChallanById(c.id);
                            setSelectedChallan(full);
                            setChallanModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Preview
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof of Delivery (POD) Modal */}
      {podModalOpen && selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Record Proof of Delivery (POD)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dispatch #{selectedDispatch.dispatchNumber}
                </p>
              </div>
              <button onClick={() => setPodModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPOD} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receiver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name of site engineer / client"
                  value={podForm.receiverName}
                  onChange={(e) => setPodForm({ ...podForm, receiverName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receiver Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={podForm.receiverPhone}
                  onChange={(e) => setPodForm({ ...podForm, receiverPhone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={podForm.isDamaged}
                    onChange={(e) => setPodForm({ ...podForm, isDamaged: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-rose-700 font-semibold">Report transit damage or shortage</span>
                </label>
              </div>

              {podForm.isDamaged && (
                <div className="space-y-2 bg-rose-50/50 p-3 rounded border border-rose-200">
                  <div>
                    <label className="block text-[11px] font-medium text-rose-900 mb-1">
                      Shortage Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={podForm.shortageQuantity}
                      onChange={(e) => setPodForm({ ...podForm, shortageQuantity: Number(e.target.value) })}
                      className="w-full p-1.5 border border-rose-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-rose-900 mb-1">
                      Damage Description & Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify micro-cracks, damaged carton box, etc..."
                      value={podForm.damageDescription}
                      onChange={(e) => setPodForm({ ...podForm, damageDescription: e.target.value })}
                      className="w-full p-1.5 border border-rose-300 rounded bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Sign-off Notes</label>
                <textarea
                  rows={2}
                  placeholder="Goods unloaded and accepted at site..."
                  value={podForm.notes}
                  onChange={(e) => setPodForm({ ...podForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPodModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Confirm Delivery Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Delivery Challan Modal */}
      {challanModalOpen && selectedChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Printable Challan Format */}
            <div className="border border-slate-300 p-6 rounded bg-white font-sans text-xs space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">SunPower Solutions</h2>
                  <p className="text-[10px] text-slate-500">Solar EPC & Integrated Renewable Operating Systems</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-[#714B67] font-mono">{selectedChallan.challanNumber}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    DATE: {new Date(selectedChallan.challanDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3 text-[11px]">
                <div>
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Consignee / Customer</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedChallan.customer?.name}</div>
                  <div className="text-slate-600">{selectedChallan.deliverySite}</div>
                  <div className="text-slate-500">Phone: {selectedChallan.receiverPhone || selectedChallan.customer?.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Logistics / Order Info</div>
                  <div className="text-slate-700 mt-0.5">Order Ref: <strong>{selectedChallan.salesOrder?.orderNumber}</strong></div>
                  <div className="text-slate-700">Transporter: {selectedChallan.transporterName || 'Dedicated Fleet'}</div>
                  <div className="text-slate-700">Vehicle #: <span className="font-mono">{selectedChallan.vehicleNumber || 'KA-01-EQ-9012'}</span></div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-700">
                      <th className="py-1">#</th>
                      <th className="py-1">Item Description</th>
                      <th className="py-1">Serial / Asset Numbers</th>
                      <th className="py-1 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedChallan.dispatchOrder?.lines || []).map((l: any, idx: number) => (
                      <tr key={l.id}>
                        <td className="py-1.5 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-1.5 font-semibold text-slate-900">
                          {l.productVariant?.name || l.productVariant?.sku}
                        </td>
                        <td className="py-1.5 font-mono text-[10px] text-slate-600">
                          {l.serialNumbers && l.serialNumbers.length > 0 ? l.serialNumbers.join(', ') : 'Batch Tracking'}
                        </td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-800">
                          {l.dispatchedQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terms */}
              <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
                {selectedChallan.termsAndConditions}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-[10px]">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-300"></div>
                  <div className="mt-1 font-semibold text-slate-700">Authorized Signatory (SunPower Solutions)</div>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-300"></div>
                  <div className="mt-1 font-semibold text-slate-700">Customer Receiver Signature & Stamp</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => setChallanModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Delivery Challan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
