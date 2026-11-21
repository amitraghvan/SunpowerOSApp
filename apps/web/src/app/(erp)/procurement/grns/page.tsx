'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  FileText,
  AlertTriangle,
  Eye,
} from 'lucide-react';

export default function GoodsReceiptNotesListPage() {
  const [grns, setGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Inspection modal state
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<any>(null);
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [inspectForm, setInspectForm] = useState({
    inspectedQuantity: 0,
    passedQuantity: 0,
    rejectedQuantity: 0,
    overallOutcome: 'PASS',
    sampleVocVolts: 0,
    sampleIscAmps: 0,
    measuredPmaxWatts: 0,
    inspectorNotes: '',
  });

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getGoodsReceiptNotes(params);
      setGrns(res || []);
    } catch (err: any) {
      console.error('Failed to load GRNs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGRNs();
  }, [statusFilter]);

  const handleOpenInspection = (grn: any, line: any) => {
    setSelectedGrn(grn);
    setSelectedLine(line);
    const qty = Number(line.receivedQuantity);
    setInspectForm({
      inspectedQuantity: qty,
      passedQuantity: qty,
      rejectedQuantity: 0,
      overallOutcome: 'PASS',
      sampleVocVolts: 49.8,
      sampleIscAmps: 13.9,
      measuredPmaxWatts: 545.0,
      inspectorNotes: 'STC Verification Completed',
    });
    setInspectModalOpen(true);
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrn || !selectedLine) return;
    try {
      await ApiClient.performQualityInspection({
        goodsReceiptNoteId: selectedGrn.id,
        goodsReceiptLineId: selectedLine.id,
        productVariantId: selectedLine.productVariantId,
        totalInspectedQuantity: Number(inspectForm.inspectedQuantity),
        passedQuantity: Number(inspectForm.passedQuantity),
        rejectedQuantity: Number(inspectForm.rejectedQuantity),
        overallOutcome: inspectForm.overallOutcome,
        measurements: {
          sampleVocVolts: Number(inspectForm.sampleVocVolts),
          sampleIscAmps: Number(inspectForm.sampleIscAmps),
          measuredPmaxWatts: Number(inspectForm.measuredPmaxWatts),
        },
        inspectorNotes: inspectForm.inspectorNotes,
      });
      setInspectModalOpen(false);
      fetchGRNs();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quality inspection');
    }
  };

  const filtered = grns.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.grnNumber?.toLowerCase().includes(q) ||
      g.purchaseOrder?.poNumber?.toLowerCase().includes(q) ||
      g.supplier?.legalName?.toLowerCase().includes(q) ||
      g.vehicleNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            Goods Receipt Notes (GRN) & Quality Control (QIR)
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Physical gate-inward verification, damage/shortage reconciliation & technical electrical flash testing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGRNs}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-[#495057] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#DEE2E6] rounded p-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#ADB5BD] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by GRN number, PO, supplier or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded text-xs focus:outline-none focus:border-[#714B67]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6C757D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#CED4DA] rounded py-1.5 px-2 text-xs focus:outline-none focus:border-[#714B67]"
            >
              <option value="ALL">All GRN Statuses</option>
              <option value="INSPECTION_PENDING">Inspection Pending</option>
              <option value="FULLY_ACCEPTED">Fully Accepted</option>
              <option value="PARTIALLY_ACCEPTED">Partially Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-[#6C757D]">
          Total GRNs: <span className="font-semibold text-[#212529]">{filtered.length}</span>
        </div>
      </div>

      {/* GRN Cards Table */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border rounded p-8 text-center text-[#6C757D]">
            Loading goods receipt notes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border rounded p-12 text-center text-[#6C757D]">
            No goods receipt notes recorded matching current search.
          </div>
        ) : (
          filtered.map((grn) => (
            <div key={grn.id} className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
              {/* Header Info */}
              <div className="p-3 bg-[#F8F9FA] border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#714B67]">{grn.grnNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      grn.status === 'FULLY_ACCEPTED'
                        ? 'bg-[#D1E7DD] text-[#0F5132]'
                        : grn.status === 'PARTIALLY_ACCEPTED'
                        ? 'bg-[#FFF3CD] text-[#664D03]'
                        : grn.status === 'INSPECTION_PENDING'
                        ? 'bg-[#CFF4FC] text-[#055160]'
                        : 'bg-[#F8D7DA] text-[#842029]'
                    }`}
                  >
                    {grn.status}
                  </span>
                  <span className="text-[#6C757D]">
                    PO: <span className="font-semibold text-[#212529]">{grn.purchaseOrder?.poNumber}</span>
                  </span>
                  <span className="text-[#6C757D]">
                    Supplier: <span className="font-semibold text-[#212529]">{grn.supplier?.legalName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[#6C757D]">
                  {grn.vehicleNumber && <span>Vehicle: {grn.vehicleNumber}</span>}
                  <span>Received: {new Date(grn.receivedDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Inward Lines Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-[#6C757D] bg-white">
                    <th className="py-2 px-3">Product Description</th>
                    <th className="py-2 px-3">Challan Qty</th>
                    <th className="py-2 px-3">Received Qty</th>
                    <th className="py-2 px-3">Accepted Qty</th>
                    <th className="py-2 px-3">Rejected / Damaged</th>
                    <th className="py-2 px-3">Inspection Status</th>
                    <th className="py-2 px-3 text-right">QA Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEE2E6]">
                  {grn.lines?.map((line: any) => (
                    <tr key={line.id} className="hover:bg-[#F8F9FA]">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#212529]">{line.productVariant?.name}</div>
                        <div className="text-[11px] font-mono text-[#6C757D]">{line.productVariant?.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[#495057]">{Number(line.challanQuantity)} Nos</td>
                      <td className="py-2.5 px-3 font-semibold">{Number(line.receivedQuantity)} Nos</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0F5132]">
                        {Number(line.acceptedQuantity)} Nos
                      </td>
                      <td className="py-2.5 px-3 text-[#842029] font-medium">
                        {Number(line.rejectedQuantity)} Nos
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            line.inspectionStatus === 'PASSED'
                              ? 'bg-[#D1E7DD] text-[#0F5132]'
                              : line.inspectionStatus === 'FAILED'
                              ? 'bg-[#F8D7DA] text-[#842029]'
                              : 'bg-[#FFF3CD] text-[#664D03]'
                          }`}
                        >
                          {line.inspectionStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {line.inspectionStatus === 'PENDING' && (
                          <button
                            onClick={() => handleOpenInspection(grn, line)}
                            className="px-2.5 py-1 bg-[#10B981] hover:bg-[#059669] text-white rounded font-medium shadow-sm transition-colors"
                          >
                            Perform QIR
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Perform QIR Modal */}
      {inspectModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#212529]">
                Perform Quality Inspection (QIR) — {selectedLine?.productVariant?.name}
              </h3>
              <button onClick={() => setInspectModalOpen(false)} className="text-[#6C757D]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Inspected Qty</label>
                  <input
                    type="number"
                    value={inspectForm.inspectedQuantity}
                    onChange={(e) => setInspectForm({ ...inspectForm, inspectedQuantity: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Passed Qty</label>
                  <input
                    type="number"
                    value={inspectForm.passedQuantity}
                    onChange={(e) => setInspectForm({ ...inspectForm, passedQuantity: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rejected Qty</label>
                  <input
                    type="number"
                    value={inspectForm.rejectedQuantity}
                    onChange={(e) => setInspectForm({ ...inspectForm, rejectedQuantity: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Overall Inspection Outcome *</label>
                <select
                  value={inspectForm.overallOutcome}
                  onChange={(e) => setInspectForm({ ...inspectForm, overallOutcome: e.target.value })}
                  className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#10B981]"
                >
                  <option value="PASS">PASS — All Technical Specs Compliant</option>
                  <option value="CONDITIONAL_PASS">CONDITIONAL PASS — Minor Cosmetic Defect</option>
                  <option value="FAIL">FAIL — Major Electrical / Mechanical Non-conformance</option>
                </select>
              </div>

              <div className="p-3 bg-gray-50 border rounded space-y-2">
                <div className="font-semibold text-[#495057]">Electrical Flash Test Benchmark Sampling</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] mb-0.5">Voc (Volts)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inspectForm.sampleVocVolts}
                      onChange={(e) => setInspectForm({ ...inspectForm, sampleVocVolts: Number(e.target.value) })}
                      className="w-full border rounded p-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-0.5">Isc (Amps)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inspectForm.sampleIscAmps}
                      onChange={(e) => setInspectForm({ ...inspectForm, sampleIscAmps: Number(e.target.value) })}
                      className="w-full border rounded p-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-0.5">Pmax (Watts)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inspectForm.measuredPmaxWatts}
                      onChange={(e) => setInspectForm({ ...inspectForm, measuredPmaxWatts: Number(e.target.value) })}
                      className="w-full border rounded p-1.5 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Inspector Checklist Notes</label>
                <textarea
                  rows={2}
                  value={inspectForm.inspectorNotes}
                  onChange={(e) => setInspectForm({ ...inspectForm, inspectorNotes: e.target.value })}
                  className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded font-semibold"
                >
                  Confirm QIR Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
