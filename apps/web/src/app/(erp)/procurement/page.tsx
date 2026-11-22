'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  Boxes,
  Building2,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  IndianRupee,
  Activity,
  Layers,
  Plus,
  ChevronRight,
} from 'lucide-react';

export default function ProcurementCockpitPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [pos, setPos] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCockpitData = async () => {
    setLoading(true);
    try {
      const [kpiRes, poRes, prRes] = await Promise.all([
        ApiClient.getProcurementKPIs().catch(() => null),
        ApiClient.getPurchaseOrders().catch(() => []),
        ApiClient.getPurchaseRequisitions().catch(() => []),
      ]);
      setKpis(kpiRes);
      setPos(poRes || []);
      setPrs(prRes || []);
    } catch (err: any) {
      console.error('Failed to load procurement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCockpitData();
  }, []);

  const totalSpend = kpis?.totalSpendYTD ?? pos.reduce((acc, p) => acc + Number(p.totalAmount || 0), 0);
  const pendingApprovals = pos.filter((p) => p.approvalStatus === 'PENDING' || p.status === 'PENDING_APPROVAL').length;
  const activeOrdersCount = pos.filter((p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_DELIVERED' || p.status === 'IN_TRANSIT').length;
  const pendingRequisitionsCount = prs.filter((pr) => pr.status === 'SUBMITTED' || pr.status === 'DRAFT' || pr.status === 'PENDING').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto text-xs relative z-10">
      {/* 1. Odoo-Style Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-[#DEE2E6] shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#151A2B] tracking-tight">
            Procurement
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Manage suppliers, purchasing and incoming materials.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCockpitData}
            disabled={loading}
            className="px-3 py-1.5 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded-lg text-[#495057] flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
            title="Sync procurement ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#714B67]' : ''}`} />
            <span>Sync Ledger</span>
          </button>
          <Link
            href="/procurement/purchase-orders"
            className="bg-[#714B67] hover:bg-[#5A3750] text-white px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Purchase Order</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Compact KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Purchase Orders Value */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Purchase Orders Value</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008784] flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#151A2B]">
            {loading ? '...' : `₹${Number(totalSpend || 0).toLocaleString('en-IN')}`}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Total PO Commitments</span>
          </div>
        </div>

        {/* KPI 2: Pending Requisitions */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Requisitions</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#151A2B]">
            {loading ? '...' : pendingRequisitionsCount}
          </div>
          <div className="text-[11px] text-[#6C757D]">
            <Link href="/procurement/requisitions" className="hover:underline text-[#714B67] font-semibold">
              Review Requisitions &rarr;
            </Link>
          </div>
        </div>

        {/* KPI 3: Awaiting Approval */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Awaiting Approval</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600">
            {loading ? '...' : pendingApprovals}
          </div>
          <div className="text-[11px] text-[#6C757D]">
            Requiring Management Sign-off
          </div>
        </div>

        {/* KPI 4: Orders In Transit */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Orders In Transit</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#151A2B]">
            {loading ? '...' : activeOrdersCount}
          </div>
          <div className="text-[11px] text-blue-600 font-medium">
            Active Delivery Schedules
          </div>
        </div>
      </div>

      {/* 3. Compact Operational Shortcuts (6 Key Modules) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Link
          href="/suppliers"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-xl p-3 transition-all flex items-center gap-2.5 shadow-2xs hover:shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#F1EAF0] text-[#714B67] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#151A2B] truncate group-hover:text-[#714B67]">Suppliers</div>
            <div className="text-[10px] text-[#6C757D] truncate">Master Registry</div>
          </div>
        </Link>

        <Link
          href="/procurement/requisitions"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-xl p-3 transition-all flex items-center gap-2.5 shadow-2xs hover:shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#151A2B] truncate group-hover:text-[#714B67]">Requisitions</div>
            <div className="text-[10px] text-[#6C757D] truncate">Internal Demands</div>
          </div>
        </Link>

        <Link
          href="/procurement/rfqs"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-xl p-3 transition-all flex items-center gap-2.5 shadow-2xs hover:shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#151A2B] truncate group-hover:text-[#714B67]">RFQs</div>
            <div className="text-[10px] text-[#6C757D] truncate">Bid Evaluation</div>
          </div>
        </Link>

        <Link
          href="/procurement/purchase-orders"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-xl p-3 transition-all flex items-center gap-2.5 shadow-2xs hover:shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008784] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#151A2B] truncate group-hover:text-[#714B67]">Purchase Orders</div>
            <div className="text-[10px] text-[#6C757D] truncate">PO Lifecycle</div>
          </div>
        </Link>

        <Link
          href="/procurement/grns"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-xl p-3 transition-all flex items-center gap-2.5 shadow-2xs hover:shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#151A2B] truncate group-hover:text-[#714B67]">Goods Receipts</div>
            <div className="text-[10px] text-[#6C757D] truncate">Inward Quality</div>
          </div>
        </Link>

        <Link
          href="/procurement/serials"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-xl p-3 transition-all flex items-center gap-2.5 shadow-2xs hover:shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#151A2B] truncate group-hover:text-[#714B67]">Serial Tracking</div>
            <div className="text-[10px] text-[#6C757D] truncate">Asset Barcodes</div>
          </div>
        </Link>
      </div>

      {/* 4. Operational Tables Grid: Recent Purchase Orders & Pending Requisitions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Purchase Orders */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between font-bold text-[#151A2B]">
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-[#714B67]" />
              <span>Recent Purchase Orders</span>
            </span>
            <Link href="/procurement/purchase-orders" className="text-[#714B67] hover:underline font-semibold flex items-center gap-1 text-[11px]">
              <span>View All ({pos.length})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DEE2E6] text-[#6C757D] bg-white font-semibold">
                  <th className="py-2.5 px-3.5">PO Number</th>
                  <th className="py-2.5 px-3.5">Supplier</th>
                  <th className="py-2.5 px-3.5">Total (₹)</th>
                  <th className="py-2.5 px-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE2E6]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#6C757D]">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-[#714B67]" />
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : pos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#6C757D]">
                      <ShoppingCart className="w-7 h-7 mx-auto mb-1.5 text-[#CED4DA]" />
                      <p className="font-semibold text-[#151A2B]">No purchase orders issued yet</p>
                      <p className="text-[11px] mt-0.5">Generate purchase orders from MRP or RFQ bids.</p>
                      <Link
                        href="/procurement/purchase-orders"
                        className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-[#714B67] text-white font-semibold text-[11px]"
                      >
                        + Create Purchase Order
                      </Link>
                    </td>
                  </tr>
                ) : (
                  pos.slice(0, 5).map((po) => (
                    <tr key={po.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-[#714B67]">
                        <Link href="/procurement/purchase-orders" className="hover:underline font-mono">
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-[#151A2B] truncate max-w-[140px]">
                        {po.supplier?.legalName || po.supplier?.name || 'Solar Vendor'}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-[#151A2B]">
                        ₹{Number(po.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.status === 'APPROVED' || po.status === 'ISSUED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.status === 'PENDING_APPROVAL' || po.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-[#495057]'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Requisitions */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 bg-[#F8F9FA] border-b border-[#DEE2E6] flex items-center justify-between font-bold text-[#151A2B]">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#D97706]" />
              <span>Pending Requisitions (PR)</span>
            </span>
            <Link href="/procurement/requisitions" className="text-[#714B67] hover:underline font-semibold flex items-center gap-1 text-[11px]">
              <span>View All ({prs.length})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DEE2E6] text-[#6C757D] bg-white font-semibold">
                  <th className="py-2.5 px-3.5">PR Number</th>
                  <th className="py-2.5 px-3.5">Requisition Title</th>
                  <th className="py-2.5 px-3.5">Items</th>
                  <th className="py-2.5 px-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE2E6]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#6C757D]">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-[#714B67]" />
                      Loading requisitions...
                    </td>
                  </tr>
                ) : prs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#6C757D]">
                      <FileText className="w-7 h-7 mx-auto mb-1.5 text-[#CED4DA]" />
                      <p className="font-semibold text-[#151A2B]">No pending requisitions</p>
                      <p className="text-[11px] mt-0.5">All engineering material demands have been allocated.</p>
                      <Link
                        href="/procurement/requisitions"
                        className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-[#714B67] text-white font-semibold text-[11px]"
                      >
                        + Create Requisition
                      </Link>
                    </td>
                  </tr>
                ) : (
                  prs.slice(0, 5).map((pr) => (
                    <tr key={pr.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-[#714B67]">
                        <Link href="/procurement/requisitions" className="hover:underline font-mono">
                          {pr.requisitionNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#151A2B] font-medium truncate max-w-[150px]">
                        {pr.title || 'Material Requisition'}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#6C757D]">
                        {pr.lines?.length || 0} line item(s)
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pr.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pr.status === 'SUBMITTED' || pr.status === 'PENDING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-[#495057]'
                          }`}
                        >
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
