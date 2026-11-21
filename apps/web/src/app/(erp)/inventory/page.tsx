'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Boxes,
  Warehouse,
  Layers,
  Cpu,
  ArrowLeftRight,
  CheckSquare,
  PackageCheck,
  Truck,
  Scale,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function InventoryCockpitPage() {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [stockRes, resRes, dispRes] = await Promise.all([
        ApiClient.getStockOverview(),
        ApiClient.getStockReservations(),
        ApiClient.getDispatchOrders(),
      ]);
      setStockItems(stockRes || []);
      setReservations(resRes?.items || resRes || []);
      setDispatches(dispRes || []);
    } catch (err) {
      console.error('Failed to load inventory dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute live KPIs from actual data
  const totalTrackedProducts = stockItems.length;
  const totalOnHand = stockItems.reduce((acc, cur) => acc + (Number(cur.onHandStock) || 0), 0);
  const totalAvailable = stockItems.reduce((acc, cur) => acc + (Number(cur.availableStock) || 0), 0);
  const totalReserved = stockItems.reduce((acc, cur) => acc + (Number(cur.activeReservations) || 0), 0);
  const totalQuarantined = stockItems.reduce((acc, cur) => acc + (Number(cur.quarantinedStock) || 0), 0);
  const pendingDispatch = dispatches.filter(
    (d) => d.status === 'READY_FOR_DISPATCH' || d.status === 'APPROVED',
  ).length;

  // Identify low stock items (available <= 5)
  const lowStockItems = stockItems.filter((i) => i.availableStock <= 5);

  const modules = [
    {
      title: 'Warehouse Directory',
      desc: 'Storage zones, racks, receiving bays & bin locations',
      href: '/inventory/warehouses',
      icon: Warehouse,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Stock Visibility',
      desc: 'Multi-view balance: On-hand, available & serial trace',
      href: '/inventory/stock',
      icon: Layers,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Project Reservations',
      desc: 'Sales order & BOM material allocations with lock protection',
      href: '/inventory/reservations',
      icon: Cpu,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Warehouse Transfers',
      desc: 'Controlled inter-warehouse and inter-bin stock transfers',
      href: '/inventory/transfers',
      icon: ArrowLeftRight,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Picking Operations',
      desc: 'Pick lists, barcode serial scanning & shortage tracking',
      href: '/inventory/picking',
      icon: CheckSquare,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      title: 'Packing Workspace',
      desc: 'Package verification checklists, weights & box labeling',
      href: '/inventory/packing',
      icon: PackageCheck,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Outbound Dispatch & POD',
      desc: 'Dispatch orders, Delivery Challans & Proof of Delivery',
      href: '/inventory/dispatch',
      icon: Truck,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Counts & Adjustments',
      desc: 'Cycle counting, variance audits & supervisor authorization',
      href: '/inventory/adjustments',
      icon: Scale,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      title: 'Customer Returns',
      desc: 'Site returned goods inspection, restocking & quarantine',
      href: '/inventory/returns',
      icon: RotateCcw,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Inventory & Warehouse Cockpit</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative stock ledger, multi-location storage, BOM reservations, picking, packing & dispatch operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/inventory/stock"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded shadow-sm transition"
          >
            <Layers className="w-3.5 h-3.5" />
            View Stock Ledger
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tracked SKUs</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900">
            {loading ? '-' : totalTrackedProducts}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Catalog Variants</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">On-Hand Stock</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-800">
            {loading ? '-' : totalOnHand}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Physical Warehouse</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Available Stock</div>
          <div className="mt-1.5 text-2xl font-bold text-emerald-700">
            {loading ? '-' : totalAvailable}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">Free to Allocate</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">Active Reserved</div>
          <div className="mt-1.5 text-2xl font-bold text-blue-700">
            {loading ? '-' : totalReserved}
          </div>
          <div className="text-[10px] text-blue-600 mt-1">Allocated to BOMs</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">Quarantine / Hold</div>
          <div className="mt-1.5 text-2xl font-bold text-amber-700">
            {loading ? '-' : totalQuarantined}
          </div>
          <div className="text-[10px] text-amber-600 mt-1">Under Inspection</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="text-[11px] font-medium text-rose-700 uppercase tracking-wider">Ready to Dispatch</div>
          <div className="mt-1.5 text-2xl font-bold text-rose-700">
            {loading ? '-' : pendingDispatch}
          </div>
          <div className="text-[10px] text-rose-600 mt-1">Orders Pending Exit</div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Low Available Stock Notice ({lowStockItems.length} Products)
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              The following solar components have 5 or fewer units available for new sales order reservation:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <span
                  key={item.productVariantId}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300"
                >
                  {item.sku}: <strong>{item.availableStock} {item.uom} left</strong>
                </span>
              ))}
              {lowStockItems.length > 5 && (
                <span className="text-[11px] text-amber-700 self-center">
                  +{lowStockItems.length - 5} more
                </span>
              )}
            </div>
          </div>
          <Link
            href="/procurement/requisitions"
            className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline shrink-0 mt-0.5"
          >
            Create Requisition &rarr;
          </Link>
        </div>
      )}

      {/* Operational Modules Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Warehouse & Inventory Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group p-4 bg-white rounded-lg border border-slate-200 hover:border-[#714B67] hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-md border ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#714B67] transition" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#714B67] transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
