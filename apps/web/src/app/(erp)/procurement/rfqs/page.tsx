'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Award,
  RefreshCw,
  ExternalLink,
  IndianRupee,
  Calendar,
  Send,
  Users,
} from 'lucide-react';

export default function RFQManagementPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [comparingLoading, setComparingLoading] = useState(false);
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [awardForm, setAwardForm] = useState({
    winningSupplierId: '',
    winningQuotationId: '',
    awardJustification: '',
  });

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getRFQs();
      setRfqs(res || []);
    } catch (err: any) {
      console.error('Failed to load RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const handleOpenComparison = async (rfq: any) => {
    setSelectedRfq(rfq);
    setComparingLoading(true);
    try {
      const res = await ApiClient.compareRFQQuotes(rfq.id);
      setComparison(res);
    } catch (err: any) {
      console.error('Failed to compare quotes:', err);
    } finally {
      setComparingLoading(false);
    }
  };

  const handleAwardRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq || !awardForm.winningSupplierId) return;
    try {
      await ApiClient.awardRFQ(selectedRfq.id, {
        winningSupplierId: awardForm.winningSupplierId,
        winningQuotationId: awardForm.winningQuotationId || undefined,
        awardJustification: awardForm.awardJustification,
      });
      setAwardModalOpen(false);
      handleOpenComparison(selectedRfq);
      fetchRFQs();
    } catch (err: any) {
      alert(err.message || 'Failed to award RFQ');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#E26D5C]" />
            Request for Quotation (RFQ) & Bids Evaluation
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Competitive multi-supplier sourcing, live quote collection, ranking matrix & formal award decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRFQs}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-[#495057] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid: RFQ List & Comparative Evaluation View */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Col: RFQs Table (5 cols) */}
        <div className="col-span-5 bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-[#F8F9FA] border-b font-bold text-[#212529] flex items-center justify-between">
            <span>Published RFQs ({rfqs.length})</span>
          </div>

          <div className="divide-y divide-[#DEE2E6] overflow-y-auto max-h-[700px]">
            {loading ? (
              <div className="p-8 text-center text-[#6C757D]">Loading RFQs...</div>
            ) : rfqs.length === 0 ? (
              <div className="p-8 text-center text-[#6C757D]">No RFQs recorded yet.</div>
            ) : (
              rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  onClick={() => handleOpenComparison(rfq)}
                  className={`p-3.5 cursor-pointer transition-colors space-y-2 ${
                    selectedRfq?.id === rfq.id ? 'bg-[#FDF6F0] border-l-4 border-l-[#E26D5C]' : 'hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#714B67]">{rfq.rfqNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rfq.status === 'AWARDED'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : rfq.status === 'PUBLISHED' || rfq.status === 'ISSUED'
                          ? 'bg-[#CFF4FC] text-[#055160]'
                          : 'bg-[#E9ECEF] text-[#495057]'
                      }`}
                    >
                      {rfq.status}
                    </span>
                  </div>

                  <div className="font-semibold text-[#212529]">{rfq.title}</div>

                  <div className="flex items-center justify-between text-[#6C757D] text-[11px]">
                    <span>Invited: {rfq.suppliers?.length || 0} Vendors</span>
                    <span>Due: {rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Comparison Matrix & Bid Analysis (7 cols) */}
        <div className="col-span-7 bg-white border border-[#DEE2E6] rounded shadow-sm p-4 space-y-4">
          {!selectedRfq ? (
            <div className="py-24 text-center text-[#6C757D]">
              <Layers className="w-10 h-10 text-[#CED4DA] mx-auto mb-2" />
              Select an RFQ from the left to view competing supplier quotations and award evaluation matrix.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <div className="font-mono text-xs text-[#714B67] font-bold">{selectedRfq.rfqNumber}</div>
                  <h2 className="text-base font-bold text-[#212529]">{selectedRfq.title}</h2>
                </div>

                {selectedRfq.status !== 'AWARDED' && (
                  <button
                    onClick={() => {
                      setAwardForm({
                        winningSupplierId: comparison?.comparison?.[0]?.supplierId || '',
                        winningQuotationId: comparison?.comparison?.[0]?.quotationId || '',
                        awardJustification: 'Lowest evaluated commercial quote',
                      });
                      setAwardModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#017E84] hover:bg-[#015C60] text-white rounded font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Award className="w-3.5 h-3.5" /> Award RFQ Contract
                  </button>
                )}
              </div>

              {/* Quotes Matrix */}
              <div className="space-y-2">
                <div className="font-bold text-[#495057]">Commercial Bid Comparison & Ranking Matrix</div>

                {comparingLoading ? (
                  <div className="p-6 text-center text-[#6C757D]">Calculating ranking matrix...</div>
                ) : !comparison || comparison.comparison?.length === 0 ? (
                  <div className="p-6 text-center border rounded text-[#6C757D] bg-gray-50">
                    No supplier quotations submitted for this RFQ yet.
                  </div>
                ) : (
                  <div className="border border-[#DEE2E6] rounded overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F8F9FA] border-b text-[#495057] font-semibold">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Vendor / Supplier</th>
                          <th className="py-2.5 px-3">Quoted Base</th>
                          <th className="py-2.5 px-3">Tax Amount</th>
                          <th className="py-2.5 px-3">Total Quoted (₹)</th>
                          <th className="py-2.5 px-3">Lead Time</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DEE2E6]">
                        {comparison.comparison.map((c: any) => (
                          <tr
                            key={c.supplierId}
                            className={`${
                              c.isLowestBid ? 'bg-[#F0FDF4] font-medium' : 'hover:bg-[#F8F9FA]'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                                  c.rank === 1
                                    ? 'bg-[#198754] text-white'
                                    : 'bg-gray-200 text-[#495057]'
                                }`}
                              >
                                {c.rank}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-[#212529]">{c.supplierName}</div>
                              {c.isLowestBid && (
                                <span className="text-[10px] text-[#0F5132] font-semibold">
                                  ★ Lowest Bidder (L1)
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">₹{Number(c.subtotalAmount || 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-[#6C757D]">₹{Number(c.taxAmount || 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3 font-bold text-[#212529]">
                              ₹{Number(c.totalAmount || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-[#495057]">{c.deliveryLeadTimeDays || '—'} Days</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'ACCEPTED'
                                    ? 'bg-[#D1E7DD] text-[#0F5132]'
                                    : c.status === 'REJECTED'
                                    ? 'bg-[#F8D7DA] text-[#842029]'
                                    : 'bg-[#E9ECEF] text-[#495057]'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Award Modal */}
      {awardModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#212529]">Award RFQ Contract</h3>
              <button onClick={() => setAwardModalOpen(false)} className="text-[#6C757D]">
                ✕
              </button>
            </div>

            <form onSubmit={handleAwardRFQ} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Select Winning Supplier *</label>
                <select
                  required
                  value={awardForm.winningSupplierId}
                  onChange={(e) => setAwardForm({ ...awardForm, winningSupplierId: e.target.value })}
                  className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#017E84]"
                >
                  <option value="">-- Choose Winning Bidder --</option>
                  {comparison?.comparison?.map((c: any) => (
                    <option key={c.supplierId} value={c.supplierId}>
                      Rank {c.rank}: {c.supplierName} (₹{Number(c.totalAmount).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Commercial / Technical Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={awardForm.awardJustification}
                  onChange={(e) => setAwardForm({ ...awardForm, awardJustification: e.target.value })}
                  className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#017E84]"
                  placeholder="e.g. Evaluated lowest bidder with comprehensive tier-1 manufacturing warranty backing"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAwardModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#017E84] hover:bg-[#015C60] text-white rounded font-semibold"
                >
                  Confirm Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
