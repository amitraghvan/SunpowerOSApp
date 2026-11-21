'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Calendar,
  IndianRupee,
  History,
  FileCheck,
  Send,
} from 'lucide-react';

export default function PurchaseOrdersListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await ApiClient.getPurchaseOrders(params);
      setOrders(res || []);
    } catch (err: any) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    const notes = prompt('Approval remarks (optional):') || 'Director approved';
    setActionLoading(id);
    try {
      await ApiClient.approvePurchaseOrder(id, {
        decision: 'APPROVE',
        notes,
      });
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to approve PO');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateRevision = async (po: any) => {
    const revisionReason = prompt(
      `Create new version revision for PO ${po.poNumber} (Current v${po.version}). Enter change justification:`,
    );
    if (!revisionReason) return;
    setActionLoading(po.id);
    try {
      await ApiClient.createPurchaseOrderRevision(po.id, {
        revisionReason,
        lines: po.lines?.map((l: any) => ({
          productVariantId: l.productVariantId,
          itemDescription: l.itemDescription,
          orderedQuantity: Number(l.orderedQuantity),
          unitPrice: Number(l.unitPrice),
          taxRatePercent: Number(l.taxRatePercent),
        })),
      });
      alert(`Revision created successfully.`);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to create PO revision');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = orders.filter((po) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      po.poNumber?.toLowerCase().includes(q) ||
      po.supplier?.legalName?.toLowerCase().includes(q) ||
      po.paymentTerms?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#714B67]" />
            Purchase Orders & Version Revision Management
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Legally binding procurement contracts, director approvals, version tracking (v1, v2) & delivery schedules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-[#495057] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white border border-[#DEE2E6] rounded p-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#ADB5BD] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by PO number or supplier name..."
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
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="ISSUED">Issued to Supplier</option>
              <option value="PARTIALLY_DELIVERED">Partially Received</option>
              <option value="FULLY_DELIVERED">Fully Received</option>
            </select>
          </div>
        </div>

        <div className="text-[#6C757D]">
          Purchase Orders: <span className="font-semibold text-[#212529]">{filtered.length}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b text-[#495057] font-semibold">
              <th className="py-2.5 px-3">PO Number & Version</th>
              <th className="py-2.5 px-3">Supplier / Vendor</th>
              <th className="py-2.5 px-3">Order Date</th>
              <th className="py-2.5 px-3">Expected Delivery</th>
              <th className="py-2.5 px-3">Subtotal</th>
              <th className="py-2.5 px-3">GST Tax</th>
              <th className="py-2.5 px-3">Total Value (₹)</th>
              <th className="py-2.5 px-3">Approval Gate</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-[#6C757D]">
                  Loading purchase orders...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-[#6C757D]">
                  No purchase orders found matching current criteria.
                </td>
              </tr>
            ) : (
              filtered.map((po) => (
                <tr key={po.id} className="hover:bg-[#F8F9FA]">
                  <td className="py-2.5 px-3 font-semibold text-[#714B67] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span>{po.poNumber}</span>
                      <span className="px-1.5 py-0.2 bg-gray-100 text-[#495057] text-[10px] font-bold rounded">
                        v{po.version}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#212529]">{po.supplier?.legalName}</div>
                    <div className="text-[11px] text-[#6C757D] font-mono">{po.supplier?.gstin || '—'}</div>
                  </td>
                  <td className="py-2.5 px-3 text-[#6C757D]">
                    {new Date(po.orderDate).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 text-[#495057] font-medium">
                    {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 text-[#495057]">
                    ₹{Number(po.subtotalAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-[#6C757D]">
                    ₹{Number(po.taxAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#212529]">
                    ₹{Number(po.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        po.approvalStatus === 'APPROVED'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : po.approvalStatus === 'PENDING'
                          ? 'bg-[#FFF3CD] text-[#664D03]'
                          : 'bg-[#F8D7DA] text-[#842029]'
                      }`}
                    >
                      {po.approvalStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        po.status === 'APPROVED' || po.status === 'ISSUED'
                          ? 'bg-[#D1E7DD] text-[#0F5132]'
                          : po.status === 'FULLY_DELIVERED'
                          ? 'bg-[#CFF4FC] text-[#055160]'
                          : 'bg-[#E9ECEF] text-[#495057]'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {po.approvalStatus === 'PENDING' && (
                        <button
                          disabled={actionLoading === po.id}
                          onClick={() => handleApprove(po.id)}
                          className="px-2.5 py-1 bg-[#198754] hover:bg-[#146C43] text-white rounded font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                      )}

                      <button
                        disabled={actionLoading === po.id}
                        onClick={() => handleCreateRevision(po)}
                        className="p-1 border hover:bg-gray-100 rounded text-[#495057]"
                        title="Create Version Revision (v+1)"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
