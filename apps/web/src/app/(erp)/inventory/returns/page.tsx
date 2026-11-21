'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
  Package,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ArrowDownLeft,
} from 'lucide-react';

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  // Aux state for form
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // Create Form
  const [form, setForm] = useState({
    customerId: '',
    warehouseId: '',
    salesOrderId: '',
    projectInitiationId: '',
    returnReason: '',
    lines: [
      {
        productVariantId: '',
        returnedQuantity: 1,
        serialNumbersText: '',
        notes: '',
      },
    ],
  });

  // Inspection Form
  const [inspectForm, setInspectForm] = useState({
    restockDecision: 'RESTOCK',
    acceptedQuantity: 1,
    rejectedQuantity: 0,
    inspectionNotes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getCustomerReturns({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setReturns(data || []);
    } catch (err) {
      console.error('Failed to load customer returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleOpenCreateModal = async () => {
    try {
      const [whData, stockData, custData] = await Promise.all([
        ApiClient.getWarehouses(),
        ApiClient.getStockOverview(),
        ApiClient.getCustomers(),
      ]);
      setWarehouses(whData || []);
      setVariants(stockData || []);
      setCustomers(custData || []);

      setForm({
        customerId: custData?.[0]?.id || '',
        warehouseId: whData?.[0]?.id || '',
        salesOrderId: '',
        projectInitiationId: '',
        returnReason: '',
        lines: [
          {
            productVariantId: stockData?.[0]?.id || '',
            returnedQuantity: 1,
            serialNumbersText: '',
            notes: '',
          },
        ],
      });
      setCreateModalOpen(true);
    } catch (err) {
      console.error('Failed to initialize return form:', err);
    }
  };

  const handleAddLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          productVariantId: variants?.[0]?.id || '',
          returnedQuantity: 1,
          serialNumbersText: '',
          notes: '',
        },
      ],
    }));
  };

  const handleRemoveLine = (idx: number) => {
    if (form.lines.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.warehouseId) {
      alert('Please select a customer and warehouse');
      return;
    }

    try {
      const payload = {
        customerId: form.customerId,
        warehouseId: form.warehouseId,
        salesOrderId: form.salesOrderId || undefined,
        projectInitiationId: form.projectInitiationId || undefined,
        returnReason: form.returnReason,
        lines: form.lines.map((l) => ({
          productVariantId: l.productVariantId,
          returnedQuantity: Number(l.returnedQuantity),
          serialNumbers: l.serialNumbersText
            ? l.serialNumbersText.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          notes: l.notes || undefined,
        })),
      };

      await ApiClient.createCustomerReturn(payload);
      setCreateModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(`Error creating return: ${err.message}`);
    }
  };

  const handleReceive = async (returnId: string) => {
    if (!confirm('Mark return as received at warehouse for inward inspection?')) return;
    try {
      await ApiClient.receiveCustomerReturn(returnId);
      await fetchData();
    } catch (err: any) {
      alert(`Error marking return received: ${err.message}`);
    }
  };

  const handleOpenInspect = (ret: any) => {
    setSelectedReturn(ret);
    const totalQty = ret.lines?.reduce((sum: number, l: any) => sum + Number(l.returnedQuantity || 0), 0) || 1;
    setInspectForm({
      restockDecision: 'RESTOCK',
      acceptedQuantity: totalQty,
      rejectedQuantity: 0,
      inspectionNotes: 'Visual inspection completed. Functional parameters verified.',
    });
    setInspectModalOpen(true);
  };

  const handleInspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      await ApiClient.inspectCustomerReturn(selectedReturn.id, {
        restockDecision: inspectForm.restockDecision,
        acceptedQuantity: Number(inspectForm.acceptedQuantity),
        rejectedQuantity: Number(inspectForm.rejectedQuantity),
        inspectionNotes: inspectForm.inspectionNotes,
      });
      setInspectModalOpen(false);
      setSelectedReturn(null);
      await fetchData();
    } catch (err: any) {
      alert(`Inspection error: ${err.message}`);
    }
  };

  const handleViewDetail = async (returnId: string) => {
    try {
      const detail = await ApiClient.getCustomerReturnById(returnId);
      setSelectedReturn(detail);
      setDetailModalOpen(true);
    } catch (err: any) {
      alert(`Error fetching return details: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Requested</span>;
      case 'RECEIVED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Received</span>;
      case 'INSPECTION_PENDING':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Inspection Pending</span>;
      case 'RESTOCKED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">Restocked</span>;
      case 'QUARANTINED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Quarantined</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-800">Scrapped / Rejected</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-800">Closed</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer & Project Returns</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            RMA processing, inbound quality inspection, restocking to warehouse bays, and serial quarantine workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#714B67] hover:bg-[#5b3c53] text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Return (RMA)
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search return # or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-md text-sm px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="INSPECTION_PENDING">Inspection Pending</option>
            <option value="RESTOCKED">Restocked</option>
            <option value="QUARANTINED">Quarantined</option>
            <option value="REJECTED">Scrapped / Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading customer returns...</div>
        ) : returns.length === 0 ? (
          <div className="p-12 text-center">
            <RotateCcw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No customer returns found</p>
            <p className="text-xs text-slate-400 mt-1">Create an RMA ticket to record returned equipment from site.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Return Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Order / Project</th>
                  <th className="py-3 px-4">Lines</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Disposition</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#714B67]">{ret.returnNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{ret.customer?.name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 mr-1.5">
                        {ret.warehouse?.code}
                      </span>
                      {ret.warehouse?.name}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      {ret.salesOrder?.orderNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {ret._count?.lines || ret.lines?.length || 0} line(s)
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ret.status)}</td>
                    <td className="py-3 px-4">
                      {ret.restockDecision ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          ret.restockDecision === 'RESTOCK'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ret.restockDecision === 'QUARANTINE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {ret.restockDecision}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {ret.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleReceive(ret.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        >
                          Receive Bay
                        </button>
                      )}
                      {(ret.status === 'RECEIVED' || ret.status === 'INSPECTION_PENDING') && (
                        <button
                          onClick={() => handleOpenInspect(ret)}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-[#714B67]/10 text-[#714B67] hover:bg-[#714B67]/20 border border-[#714B67]/30"
                        >
                          Inspect & Decide
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetail(ret.id)}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Customer Return (RMA) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#714B67]" />
                Create Customer Return (RMA)
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Customer *</label>
                  <select
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    className="w-full border border-slate-200 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
                    required
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Destination Warehouse *</label>
                  <select
                    value={form.warehouseId}
                    onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                    className="w-full border border-slate-200 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
                    required
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Return Reason / Fault Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Inverter communication failure on site; solar panel micro-cracks detected"
                  value={form.returnReason}
                  onChange={(e) => setForm({ ...form, returnReason: e.target.value })}
                  className="w-full border border-slate-200 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  required
                />
              </div>

              {/* Lines */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900">Returned Equipment Lines</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-[#714B67] hover:underline font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                {form.lines.map((line, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">Item #{idx + 1}</span>
                      {form.lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-500 mb-0.5">Product Variant</label>
                        <select
                          value={line.productVariantId}
                          onChange={(e) => {
                            const newLines = [...form.lines];
                            newLines[idx].productVariantId = e.target.value;
                            setForm({ ...form, lines: newLines });
                          }}
                          className="w-full border border-slate-200 rounded text-xs px-2 py-1.5 bg-white"
                          required
                        >
                          <option value="">Select variant...</option>
                          {variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.sku})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={line.returnedQuantity}
                          onChange={(e) => {
                            const newLines = [...form.lines];
                            newLines[idx].returnedQuantity = Number(e.target.value);
                            setForm({ ...form, lines: newLines });
                          }}
                          className="w-full border border-slate-200 rounded text-xs px-2 py-1.5 bg-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">Serial Numbers (comma-separated if serial tracked)</label>
                      <input
                        type="text"
                        placeholder="SN-100234, SN-100235..."
                        value={line.serialNumbersText}
                        onChange={(e) => {
                          const newLines = [...form.lines];
                          newLines[idx].serialNumbersText = e.target.value;
                          setForm({ ...form, lines: newLines });
                        }}
                        className="w-full border border-slate-200 rounded text-xs px-2 py-1 bg-white font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#5b3c53] text-white text-sm font-medium rounded-md shadow-sm"
                >
                  Create Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect & Disposition Return */}
      {inspectModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#714B67]" />
                Quality Inspection & Stock Disposition
              </h2>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-md text-xs space-y-1">
              <div><span className="font-semibold text-slate-700">RMA Number:</span> {selectedReturn.returnNumber}</div>
              <div><span className="font-semibold text-slate-700">Warehouse:</span> {selectedReturn.warehouse?.name} ({selectedReturn.warehouse?.code})</div>
              <div><span className="font-semibold text-slate-700">Reported Issue:</span> {selectedReturn.returnReason}</div>
            </div>

            <form onSubmit={handleInspectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">Disposition Decision *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectForm({ ...inspectForm, restockDecision: 'RESTOCK' })}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                      inspectForm.restockDecision === 'RESTOCK'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>RESTOCK</span>
                    <span className="text-[10px] text-slate-500 font-normal">Return to Inventory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectForm({ ...inspectForm, restockDecision: 'QUARANTINE' })}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                      inspectForm.restockDecision === 'QUARANTINE'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>QUARANTINE</span>
                    <span className="text-[10px] text-slate-500 font-normal">Faulty / Needs RMA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectForm({ ...inspectForm, restockDecision: 'REJECT' })}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                      inspectForm.restockDecision === 'REJECT'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 font-semibold ring-1 ring-rose-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>SCRAP / REJECT</span>
                    <span className="text-[10px] text-slate-500 font-normal">Beyond Repair</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Accepted Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={inspectForm.acceptedQuantity}
                  onChange={(e) => setInspectForm({ ...inspectForm, acceptedQuantity: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Inspection Report & Notes *</label>
                <textarea
                  rows={3}
                  value={inspectForm.inspectionNotes}
                  onChange={(e) => setInspectForm({ ...inspectForm, inspectionNotes: e.target.value })}
                  placeholder="Summarize QA testing and reason for disposition..."
                  className="w-full border border-slate-200 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#5b3c53] text-white text-sm font-medium rounded-md shadow-sm"
                >
                  Commit Disposition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Return Details */}
      {detailModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-[#714B67]">{selectedReturn.returnNumber}</span>
                {getStatusBadge(selectedReturn.status)}
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-md">
              <div><span className="text-slate-500">Customer:</span> <span className="font-medium text-slate-900">{selectedReturn.customer?.name}</span></div>
              <div><span className="text-slate-500">Warehouse:</span> <span className="font-medium text-slate-900">{selectedReturn.warehouse?.name}</span></div>
              <div><span className="text-slate-500">Sales Order:</span> <span className="font-medium text-slate-900">{selectedReturn.salesOrder?.orderNumber || '—'}</span></div>
              <div><span className="text-slate-500">Created:</span> <span className="font-medium text-slate-900">{new Date(selectedReturn.createdAt).toLocaleDateString()}</span></div>
              <div className="col-span-2"><span className="text-slate-500">Reason:</span> <span className="font-medium text-slate-900">{selectedReturn.returnReason}</span></div>
              {selectedReturn.inspectionNotes && (
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Inspection Note:</span> <span className="font-medium text-slate-900">{selectedReturn.inspectionNotes}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Line Items</h4>
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3 text-right">Returned</th>
                      <th className="py-2 px-3 text-right">Accepted</th>
                      <th className="py-2 px-3">Serials</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReturn.lines?.map((line: any) => (
                      <tr key={line.id}>
                        <td className="py-2 px-3 font-medium text-slate-800">{line.productVariant?.name || '—'}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{line.productVariant?.sku || '—'}</td>
                        <td className="py-2 px-3 text-right font-medium">{line.returnedQuantity}</td>
                        <td className="py-2 px-3 text-right text-emerald-600 font-medium">{line.acceptedQuantity || 0}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {line.serialNumbers?.length > 0 ? line.serialNumbers.join(', ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50"
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
