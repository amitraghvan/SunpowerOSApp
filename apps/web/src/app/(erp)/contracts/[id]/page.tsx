'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  IndianRupee,
  Clock,
  Send,
  Calendar,
  Lock,
} from 'lucide-react';

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params?.id as string;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Signing form modal
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signForm, setSignForm] = useState({
    signedByCustomerName: '',
  });

  const fetchContract = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getContractById(contractId);
      setContract(data);
      if (data?.customer?.name) {
        setSignForm({ signedByCustomerName: data.customer.name });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.signContract(contractId, signForm);
      setIsSignModalOpen(false);
      setSuccessMsg('Contract signed and activated successfully!');
      await fetchContract();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign contract.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#6C757D]">
        <div className="animate-spin w-8 h-8 border-2 border-[#714B67] border-t-transparent rounded-full mx-auto mb-3" />
        Loading Solar EPC Contract...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-semibold mb-2">Contract not found</p>
        <Link href="/contracts" className="text-sm text-[#714B67] underline">
          &larr; Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#DEE2E6] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6C757D] mb-1">
            <Link href="/contracts" className="hover:underline text-[#714B67]">
              Contracts
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-[#212529]">{contract.contractNumber}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                contract.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : contract.status === 'FULFILLED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {contract.status}
            </span>
          </div>

          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            Solar EPC Agreement with {contract.customer?.name}
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Site: <span className="font-medium text-[#212529]">{contract.site?.siteName}</span> • Quotation Ref:{' '}
            <Link href={`/quotations/${contract.quotationId}`} className="font-medium text-[#714B67] hover:underline">
              {contract.quotation?.quotationNumber}
            </Link>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {contract.status === 'DRAFT' && (
            <button
              onClick={() => setIsSignModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Sign & Activate Contract
            </button>
          )}

          {contract.status === 'ACTIVE' && (
            <Link
              href={`/sales-orders?contractId=${contract.id}&quotationId=${contract.quotationId}`}
              className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#58394F] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              Initiate Sales Order &rarr;
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

      {/* Contract Details & Signing Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Total Contract Value</span>
          <p className="text-2xl font-bold text-[#212529] mt-1">
            ₹{Number(contract.contractValue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6C757D]">Including All Taxes & BOS</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Signatory Status</span>
          <p className="text-base font-bold text-emerald-700 mt-1">
            {contract.signedByCustomerName ? `Signed by ${contract.signedByCustomerName}` : 'Pending Signature'}
          </p>
          <span className="text-[11px] text-[#6C757D]">
            {contract.signedAt ? new Date(contract.signedAt).toLocaleString() : 'Awaiting Execution'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Warranty Terms</span>
          <p className="text-base font-bold text-[#017E84] mt-1">25-Year Performance</p>
          <span className="text-[11px] text-[#6C757D]">5-Year Comprehensive Inverter</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Legal Jurisdiction</span>
          <p className="text-base font-bold text-[#212529] mt-1">Jaipur / Rajasthan</p>
          <span className="text-[11px] text-[#6C757D]">Indian Arbitration Act</span>
        </div>
      </div>

      {/* Payment Milestones Table */}
      <div className="bg-white rounded-lg border border-[#DEE2E6] p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-[#714B67]" /> Contractual Payment Milestone Schedule
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#495057] uppercase font-semibold">
              <tr>
                <th className="px-3 py-2">Milestone #</th>
                <th className="px-3 py-2">Description / Deliverable Trigger</th>
                <th className="px-3 py-2 text-right">Percentage</th>
                <th className="px-3 py-2 text-right">Amount Payable</th>
                <th className="px-3 py-2">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {contract.milestones?.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-bold text-[#714B67]">#{m.sequenceNumber}</td>
                  <td className="px-3 py-2.5 font-medium text-[#212529]">{m.name}</td>
                  <td className="px-3 py-2.5 text-right font-semibold">{Number(m.percentage).toFixed(0)}%</td>
                  <td className="px-3 py-2.5 text-right font-bold text-[#212529]">
                    ₹{Number(m.amount).toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.isPaid ? 'PAID' : 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal Clauses & Warranties */}
      <div className="bg-white rounded-lg border border-[#DEE2E6] p-5 shadow-sm space-y-3 text-xs text-[#495057]">
        <h3 className="font-bold text-sm text-[#212529]">Statutory Clauses & Scope of Work</h3>
        <p>
          1. <strong>Turnkey Scope:</strong> Contractor provides comprehensive engineering, structural mounting, solar modules, inverter, AC/DC distribution boxes, cabling, lightning protection, chemical earthing and liaisoning for Discom net-metering.
        </p>
        <p>
          2. <strong>Equipment Warranty:</strong> Solar PV modules carry 12-year product workmanship and 25-year 80% linear degradation performance warranty. Inverter carries 5-year manufacturer warranty.
        </p>
        <p>
          3. <strong>Commercial Payment Terms:</strong> In accordance with the 4-stage milestone schedule above. Delays exceeding 15 days in milestone release may adjust project execution timeline accordingly.
        </p>
      </div>

      {/* Modal: Sign Contract */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#212529] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Sign & Execute Contract
              </h3>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="text-[#6C757D] hover:text-[#212529] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSignContract} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">
                  Customer Signatory Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={signForm.signedByCustomerName}
                  onChange={(e) => setSignForm({ ...signForm, signedByCustomerName: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-800">
                By clicking "Execute Agreement", you formally record legal acceptance and activate contract milestones.
              </div>

              <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="px-4 py-2 border border-[#DEE2E6] rounded text-sm text-[#495057] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Execute Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
