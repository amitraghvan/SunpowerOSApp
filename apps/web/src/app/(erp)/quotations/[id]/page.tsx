'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Receipt,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Shield,
  IndianRupee,
  Layers,
  Percent,
  FileCheck,
  Send,
  Download,
  Building,
} from 'lucide-react';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id as string;

  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal: Record Acceptance
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [acceptForm, setAcceptForm] = useState({
    acceptanceMethod: 'DIGITAL_SIGNATURE',
    acceptedByCustomerName: '',
    customerRemarks: 'Proposal reviewed and accepted.',
    acceptanceEvidenceUrl: '',
  });

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getQuotationById(quotationId);
      setQuotation(data);
      if (data?.customer?.name) {
        setAcceptForm((prev) => ({
          ...prev,
          acceptedByCustomerName: data.customer.name,
        }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId]);

  const handleApprove = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.approveQuotation(quotationId);
      setSuccessMsg('Commercial Quotation APPROVED.');
      await fetchQuotation();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.recordQuotationAcceptance(quotationId, acceptForm);
      setIsAcceptModalOpen(false);
      setSuccessMsg('Customer acceptance successfully recorded! Contract generation unlocked.');
      await fetchQuotation();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record customer acceptance.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#6C757D]">
        <div className="animate-spin w-8 h-8 border-2 border-[#714B67] border-t-transparent rounded-full mx-auto mb-3" />
        Loading Commercial Quotation...
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-semibold mb-2">Quotation not found</p>
        <Link href="/quotations" className="text-sm text-[#714B67] underline">
          &larr; Back to Quotations
        </Link>
      </div>
    );
  }

  const cost = quotation.costEstimate || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#DEE2E6] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6C757D] mb-1">
            <Link href="/quotations" className="hover:underline text-[#714B67]">
              Quotations
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-[#212529]">{quotation.quotationNumber}</span>
            <span className="bg-[#714B67]/10 text-[#714B67] font-semibold px-2 py-0.5 rounded text-[11px]">
              v{quotation.versionNumber || 1}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                quotation.status === 'ACCEPTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : quotation.status === 'APPROVED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {quotation.status}
            </span>
          </div>

          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            Quotation for {quotation.customer?.name}
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Site: <span className="font-medium text-[#212529]">{quotation.site?.siteName}</span> • Design:{' '}
            <Link href={`/engineering/${quotation.designId}`} className="font-medium text-[#714B67] hover:underline">
              {quotation.design?.designNumber}
            </Link>{' '}
            • BOM: <span className="font-medium text-[#212529]">{quotation.bom?.bomNumber}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {quotation.status === 'DRAFT' && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve Commercial Quote
            </button>
          )}

          {quotation.status === 'APPROVED' && (
            <button
              onClick={() => setIsAcceptModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <FileCheck className="w-3.5 h-3.5" /> Record Customer Acceptance
            </button>
          )}

          {quotation.status === 'ACCEPTED' && (
            <Link
              href={`/contracts?quotationId=${quotation.id}`}
              className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#58394F] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              Generate Legal Contract &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Financial KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Net Selling Price</span>
          <p className="text-2xl font-bold text-[#212529] mt-1">
            ₹{Number(quotation.finalPrice || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6C757D]">Discount: {Number(quotation.discountPercent || 0)}%</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">GST (13.8% Blended)</span>
          <p className="text-2xl font-bold text-[#714B67] mt-1">
            ₹{Number(quotation.totalTaxAmount || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6C757D]">70% @ 12% + 30% @ 18%</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">PM Surya Ghar Subsidy</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            -₹{Number(quotation.subsidyAmount || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Direct Direct Benefit Transfer</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Net Customer Payable</span>
          <p className="text-2xl font-bold text-[#017E84] mt-1">
            ₹{Number(quotation.totalPayableAmount || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#017E84] font-bold">Total Customer Investment</span>
        </div>
      </div>

      {/* Two Column Breakdown: Costing Engine vs GST & Subsidy Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Estimation Breakdown */}
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#714B67]" /> Cost Estimation & Margin Architecture
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F3F5]">
              <span className="text-[#6C757D]">Direct Materials (BOM Snapshot):</span>
              <span className="font-semibold text-[#212529]">
                ₹{Number(cost.materialCost || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F1F3F5]">
              <span className="text-[#6C757D]">Labor & Installation (Civil/Electrical):</span>
              <span className="font-semibold text-[#212529]">
                ₹{Number(cost.laborCost || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F1F3F5]">
              <span className="text-[#6C757D]">Freight & Site Logistics:</span>
              <span className="font-semibold text-[#212529]">
                ₹{Number(cost.transportCost || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F1F3F5]">
              <span className="text-[#6C757D]">Engineering, SLD & Feasibility:</span>
              <span className="font-semibold text-[#212529]">
                ₹{Number(cost.engineeringCost || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F1F3F5]">
              <span className="text-[#6C757D]">Discom Net Metering & Inspection Fees:</span>
              <span className="font-semibold text-[#212529]">
                ₹{Number(cost.statutoryFees || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F1F3F5]">
              <span className="text-[#6C757D]">Operating Overheads (5%):</span>
              <span className="font-semibold text-[#212529]">
                ₹{Number(cost.overheadCost || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F1F3F5]">
              <span className="text-[#6C757D]">Enterprise Margin (15%):</span>
              <span className="font-semibold text-[#212529]">
                ₹{Number(cost.marginAmount || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 text-sm font-bold bg-[#F8F9FA] px-2 rounded">
              <span>Final Base Selling Price:</span>
              <span className="text-[#714B67]">
                ₹{Number(quotation.finalPrice || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Indian Statutory Taxation & Subsidy */}
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#017E84]" /> Composite GST & Central Subsidy Schedule
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] space-y-1">
              <span className="font-bold text-[#212529]">Composite Solar GST Splitting:</span>
              <div className="text-[#6C757D]">
                Under Indian GST regulations for Solar EPC works contracts:
              </div>
              <ul className="list-disc list-inside text-[#495057] space-y-0.5 mt-1">
                <li>70% of EPC contract is deemed Solar PV Goods @ 12% GST = 8.4%</li>
                <li>30% of EPC contract is deemed Installation Services @ 18% GST = 5.4%</li>
                <li className="font-semibold text-[#017E84]">Total Composite Effective GST Rate = 13.80%</li>
              </ul>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-950">PM Surya Ghar: Muft Bijli Yojana Central Subsidy:</span>
              <p className="text-emerald-800 text-[11px]">
                Direct bank transfer subsidy applied to residential & rooftop systems up to 5 kW capacity.
              </p>
              <div className="text-emerald-950 font-bold mt-1">
                Applied Subsidy: ₹{Number(quotation.subsidyAmount || 0).toLocaleString()}
              </div>
            </div>

            <div className="border-t border-[#DEE2E6] pt-2 space-y-1">
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>Base EPC Value:</span>
                <span>₹{Number(quotation.finalPrice || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>Composite GST (13.8%):</span>
                <span>+₹{Number(quotation.totalTaxAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Central Govt Subsidy:</span>
                <span>-₹{Number(quotation.subsidyAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#017E84] pt-1 border-t border-[#DEE2E6]">
                <span>Customer Net Outflow:</span>
                <span>₹{Number(quotation.totalPayableAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Acceptance Record Section */}
      {quotation.status === 'ACCEPTED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Customer Acceptance Formally Executed
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-emerald-900">
            <div>
              <span className="text-emerald-700">Accepted By:</span>
              <p className="font-bold mt-0.5">{quotation.acceptedByCustomerName || 'Customer Signatory'}</p>
            </div>
            <div>
              <span className="text-emerald-700">Acceptance Method:</span>
              <p className="font-bold mt-0.5">{quotation.acceptanceMethod || 'DIGITAL_SIGNATURE'}</p>
            </div>
            <div>
              <span className="text-emerald-700">Acceptance Timestamp:</span>
              <p className="font-bold mt-0.5">{quotation.acceptedAt ? new Date(quotation.acceptedAt).toLocaleString() : 'Confirmed'}</p>
            </div>
            <div>
              <span className="text-emerald-700">Contract Status:</span>
              <p className="font-bold text-emerald-800 mt-0.5">Ready for Execution</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Customer Acceptance */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#212529] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Record Customer Acceptance
              </h3>
              <button
                onClick={() => setIsAcceptModalOpen(false)}
                className="text-[#6C757D] hover:text-[#212529] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordAcceptance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">Signatory / Customer Name</label>
                <input
                  type="text"
                  required
                  value={acceptForm.acceptedByCustomerName}
                  onChange={(e) => setAcceptForm({ ...acceptForm, acceptedByCustomerName: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">Acceptance Channel</label>
                <select
                  value={acceptForm.acceptanceMethod}
                  onChange={(e) => setAcceptForm({ ...acceptForm, acceptanceMethod: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                >
                  <option value="DIGITAL_SIGNATURE">Digital Signature</option>
                  <option value="SIGNED_PHYSICAL_COPY">Signed Physical Copy</option>
                  <option value="OTP">OTP Verification</option>
                  <option value="EMAIL_CONFIRMATION">Email Confirmation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">Document Evidence URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://storage.solaros.app/quotes/signed.pdf"
                  value={acceptForm.acceptanceEvidenceUrl}
                  onChange={(e) => setAcceptForm({ ...acceptForm, acceptanceEvidenceUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="px-4 py-2 border border-[#DEE2E6] rounded text-sm text-[#495057] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Confirm Acceptance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
