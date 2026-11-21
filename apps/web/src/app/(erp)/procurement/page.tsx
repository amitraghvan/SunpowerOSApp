'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  Boxes,
  Users,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  IndianRupee,
  Activity,
  Layers,
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
  const pendingApprovals = pos.filter((p) => p.approvalStatus === 'PENDING').length;
  const activeOrdersCount = pos.filter((p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_DELIVERED').length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#714B67]" />
            Enterprise Procurement Cockpit
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Real-time supply chain monitoring, MRP replenishment, RFQs, purchase lifecycle & 3-way matching controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCockpitData}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-[#495057] flex items-center gap-1.5 font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>
          <Link
            href="/procurement/requirements"
            className="bg-[#714B67] hover:bg-[#58394F] text-white px-3.5 py-2 rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Boxes className="w-4 h-4" />
            MRP Planning Workbench
          </Link>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="bg-white border border-[#DEE2E6] rounded p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Purchase Value</span>
            <IndianRupee className="w-4 h-4 text-[#017E84]" />
          </div>
          <div className="text-xl font-bold text-[#212529]">
            ₹{Number(totalSpend || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#198754] font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live PO Commitments
          </div>
        </div>

        {/* Open Requisitions */}
        <div className="bg-white border border-[#DEE2E6] rounded p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Requisitions</span>
            <FileText className="w-4 h-4 text-[#FFB703]" />
          </div>
          <div className="text-xl font-bold text-[#212529]">
            {prs.filter((pr) => pr.status === 'SUBMITTED' || pr.status === 'DRAFT').length}
          </div>
          <div className="text-[11px] text-[#6C757D]">
            <Link href="/procurement/requisitions" className="hover:underline text-[#714B67] font-semibold">
              Review Requisitions &rarr;
            </Link>
          </div>
        </div>

        {/* PO Approvals */}
        <div className="bg-white border border-[#DEE2E6] rounded p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">PO Approval Gate</span>
            <AlertTriangle className="w-4 h-4 text-[#DC3545]" />
          </div>
          <div className="text-xl font-bold text-[#DC3545]">{pendingApprovals}</div>
          <div className="text-[11px] text-[#6C757D]">Requiring Director Approval</div>
        </div>

        {/* Active Inbound Shipments */}
        <div className="bg-white border border-[#DEE2E6] rounded p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Orders in Transit</span>
            <Truck className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-xl font-bold text-[#212529]">{activeOrdersCount}</div>
          <div className="text-[11px] text-[#0284C7] font-medium">Delivery Schedules Active</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-5 gap-3">
        <Link
          href="/suppliers"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded p-3 transition-colors flex items-center gap-3 shadow-sm"
        >
          <div className="p-2.5 bg-[#F8F9FA] rounded text-[#714B67]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#212529]">Suppliers</div>
            <div className="text-[11px] text-[#6C757D]">Catalogues & Rates</div>
          </div>
        </Link>

        <Link
          href="/procurement/requirements"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded p-3 transition-colors flex items-center gap-3 shadow-sm"
        >
          <div className="p-2.5 bg-[#F8F9FA] rounded text-[#017E84]">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#212529]">MRP Engine</div>
            <div className="text-[11px] text-[#6C757D]">BOM to Procurement</div>
          </div>
        </Link>

        <Link
          href="/procurement/rfqs"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded p-3 transition-colors flex items-center gap-3 shadow-sm"
        >
          <div className="p-2.5 bg-[#F8F9FA] rounded text-[#E26D5C]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#212529]">RFQs & Quotes</div>
            <div className="text-[11px] text-[#6C757D]">Bid Evaluation Matrix</div>
          </div>
        </Link>

        <Link
          href="/procurement/grns"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded p-3 transition-colors flex items-center gap-3 shadow-sm"
        >
          <div className="p-2.5 bg-[#F8F9FA] rounded text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#212529]">GRN & Inspection</div>
            <div className="text-[11px] text-[#6C757D]">Quality Checks (QIR)</div>
          </div>
        </Link>

        <Link
          href="/procurement/serials"
          className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded p-3 transition-colors flex items-center gap-3 shadow-sm"
        >
          <div className="p-2.5 bg-[#F8F9FA] rounded text-[#6366F1]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#212529]">Serials Ledger</div>
            <div className="text-[11px] text-[#6C757D]">Asset Traceability</div>
          </div>
        </Link>
      </div>

      {/* Two Column Grid: Recent Purchase Orders & Pending Requisitions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
          <div className="p-3 bg-[#F8F9FA] border-b flex items-center justify-between font-bold text-[#212529]">
            <span>Recent Purchase Orders</span>
            <Link href="/procurement/purchase-orders" className="text-[#714B67] hover:underline font-semibold">
              View All ({pos.length}) &rarr;
            </Link>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b text-[#6C757D] bg-white">
                <th className="py-2 px-3">PO Number</th>
                <th className="py-2 px-3">Supplier</th>
                <th className="py-2 px-3">Total (₹)</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {pos.slice(0, 5).map((po) => (
                <tr key={po.id} className="hover:bg-[#F8F9FA]">
                  <td className="py-2.5 px-3 font-semibold text-[#714B67]">
                    <Link href="/procurement/purchase-orders" className="hover:underline">
                      {po.poNumber}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#212529]">{po.supplier?.legalName}</td>
                  <td className="py-2.5 px-3 font-semibold">₹{Number(po.totalAmount).toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        po.status === 'APPROVED' || po.status === 'ISSUED'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : po.status === 'PENDING_APPROVAL'
                          ? 'bg-[#FFF3CD] text-[#664D03]'
                          : 'bg-[#E9ECEF] text-[#495057]'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pos.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[#6C757D]">
                    No purchase orders issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Open Purchase Requisitions */}
        <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
          <div className="p-3 bg-[#F8F9FA] border-b flex items-center justify-between font-bold text-[#212529]">
            <span>Pending Requisitions (PR)</span>
            <Link href="/procurement/requisitions" className="text-[#714B67] hover:underline font-semibold">
              View All ({prs.length}) &rarr;
            </Link>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b text-[#6C757D] bg-white">
                <th className="py-2 px-3">PR Number</th>
                <th className="py-2 px-3">Requisition Title</th>
                <th className="py-2 px-3">Items</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {prs.slice(0, 5).map((pr) => (
                <tr key={pr.id} className="hover:bg-[#F8F9FA]">
                  <td className="py-2.5 px-3 font-semibold text-[#714B67]">
                    <Link href="/procurement/requisitions" className="hover:underline">
                      {pr.requisitionNumber}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-[#212529] font-medium">{pr.title}</td>
                  <td className="py-2.5 px-3 text-[#6C757D]">{pr.lines?.length || 0} lines</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pr.status === 'APPROVED'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : pr.status === 'SUBMITTED'
                          ? 'bg-[#CFF4FC] text-[#055160]'
                          : 'bg-[#E9ECEF] text-[#495057]'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </td>
                </tr>
              ))}
              {prs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[#6C757D]">
                    No purchase requisitions created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
