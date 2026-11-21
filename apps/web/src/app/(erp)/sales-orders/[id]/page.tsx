'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Truck,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  IndianRupee,
  ShieldCheck,
  CreditCard,
  FolderKanban,
  CheckCircle2,
  Lock,
  ArrowRight,
  Send,
  Boxes,
} from 'lucide-react';

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Record Advance Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMode: 'RTGS',
    referenceNumber: '',
  });

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getSalesOrderById(orderId);
      setOrder(data);
      if (data?.advanceRequired) {
        setPaymentForm((prev) => ({
          ...prev,
          amount: Number(data.advanceRequired),
        }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load sales order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleRecordAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.recordAdvancePayment(orderId, {
        amount: Number(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        referenceNumber: paymentForm.referenceNumber,
      });
      setIsPaymentModalOpen(false);
      setSuccessMsg('Advance payment verified and recorded! Prerequisites gate unlocked.');
      await fetchOrder();
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment recording failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.confirmSalesOrder(orderId, {
        notes: 'Commercial prerequisites verified. Initializing project execution handoff.',
      });
      setSuccessMsg('Sales order CONFIRMED! Project initiation record created.');
      await fetchOrder();
    } catch (err: any) {
      setErrorMsg(err.message || 'Order confirmation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#6C757D]">
        <div className="animate-spin w-8 h-8 border-2 border-[#714B67] border-t-transparent rounded-full mx-auto mb-3" />
        Loading Sales Order Cockpit...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-semibold mb-2">Sales Order not found</p>
        <Link href="/sales-orders" className="text-sm text-[#714B67] underline">
          &larr; Back to Sales Orders
        </Link>
      </div>
    );
  }

  const proj = order.projectInitiation;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#DEE2E6] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6C757D] mb-1">
            <Link href="/sales-orders" className="hover:underline text-[#714B67]">
              Sales Orders
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-[#212529]">{order.orderNumber}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                order.status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.status}
            </span>
          </div>

          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            Sales Order for {order.customer?.name}
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Site: <span className="font-medium text-[#212529]">{order.site?.siteName}</span> • Contract Ref:{' '}
            <Link href={`/contracts/${order.contractId}`} className="font-medium text-[#714B67] hover:underline">
              {order.contract?.contractNumber}
            </Link>{' '}
            • Quote Ref:{' '}
            <Link href={`/quotations/${order.quotationId}`} className="font-medium text-[#714B67] hover:underline">
              {order.quotation?.quotationNumber}
            </Link>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!order.prerequisitesMet && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <CreditCard className="w-3.5 h-3.5" /> Record Advance Payment
            </button>
          )}

          {order.status === 'DRAFT' && order.prerequisitesMet && (
            <button
              onClick={handleConfirmOrder}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Confirm Order & Initiate Project
            </button>
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

      {/* Order KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Total Order Amount</span>
          <p className="text-2xl font-bold text-[#212529] mt-1">
            ₹{Number(order.totalAmount || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6C757D]">Turnkey EPC Contract</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Advance Required</span>
          <p className="text-2xl font-bold text-[#714B67] mt-1">
            ₹{Number(order.advanceRequired || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6C757D]">20% Prerequisite Gate</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Advance Received</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{Number(order.advanceReceived || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {order.advanceReceivedAt ? new Date(order.advanceReceivedAt).toLocaleDateString() : 'Pending'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
          <span className="text-xs text-[#6C757D] uppercase font-semibold">Fulfillment Stage</span>
          <p className="text-xl font-bold text-[#017E84] mt-1">{order.fulfillmentStatus}</p>
          <span className="text-[11px] text-[#6C757D]">Post-Confirmation Execution</span>
        </div>
      </div>

      {/* Prerequisite Gate Checklist */}
      <div className="bg-white rounded-lg border border-[#DEE2E6] p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-[#212529] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#714B67]" />
            Strict Commercial & Engineering Prerequisite Gates
          </span>
          {order.prerequisitesMet ? (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> All Gates Passed
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Advance Payment Pending
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Approved Engineering Design</span>
              <p className="text-emerald-800 text-[11px]">Sizing, string voltage and safety standards compliant.</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Approved & Frozen BOM</span>
              <p className="text-emerald-800 text-[11px]">Categorized into 6 topology groups with frozen unit costs.</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Signed Legal EPC Contract</span>
              <p className="text-emerald-800 text-[11px]">Contract signed by customer and activated in system.</p>
            </div>
          </div>

          <div
            className={`p-3 rounded border flex items-center gap-2.5 ${
              order.prerequisitesMet
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {order.prerequisitesMet ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {order.prerequisitesMet ? 'Advance Payment Cleared' : 'Advance Payment Required'}
              </span>
              <p className="text-[11px] opacity-80">
                {order.prerequisitesMet
                  ? `₹${Number(order.advanceReceived).toLocaleString()} cleared via RTGS / Bank Transfer.`
                  : `₹${Number(order.advanceRequired).toLocaleString()} must be cleared before order confirmation.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Initiation Card (Appears once order confirmed) */}
      {proj && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-teal-950 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#017E84]" />
              Downstream Project Handover Executed
            </h3>
            <span className="px-3 py-1 bg-[#017E84] text-white font-bold rounded text-xs shadow-sm">
              {proj.projectCode}
            </span>
          </div>

          <p className="text-xs text-teal-900">
            This project has officially been handed over to Operations & Execution. Procurement and field installation pipelines are now unlocked.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-teal-200 text-teal-950">
            <div>
              <span className="text-teal-700">Project Code:</span>
              <p className="font-bold mt-0.5">{proj.projectCode}</p>
            </div>
            <div>
              <span className="text-teal-700">Handover Status:</span>
              <p className="font-bold mt-0.5 text-emerald-800">{proj.handoverStatus}</p>
            </div>
            <div>
              <span className="text-teal-700">Target Completion:</span>
              <p className="font-bold mt-0.5">{proj.targetCompletionDate ? new Date(proj.targetCompletionDate).toLocaleDateString() : '30 Days'}</p>
            </div>
            <div>
              <span className="text-teal-700">Next Phase:</span>
              <p className="font-bold mt-0.5 text-[#017E84]">Phase 3: Procurement & PO</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Advance Payment */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#212529] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Record Advance Payment
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#6C757D] hover:text-[#212529] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordAdvance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                >
                  <option value="RTGS">RTGS</option>
                  <option value="NEFT">NEFT</option>
                  <option value="IMPS">IMPS</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI / Digital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1">
                  Bank UTR / Transaction Reference Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-20261121-778899"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-[#CED4DA] rounded outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-[#DEE2E6] rounded text-sm text-[#495057] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Confirm & Clear Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
