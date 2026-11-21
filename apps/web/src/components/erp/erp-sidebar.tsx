'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  Package,
  Sun,
  FileSpreadsheet,
  FileText,
  FileSignature,
  ShoppingCart,
  Truck,
  Boxes,
  Building2,
  Shield,
  Key,
  Settings,
  History,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  Cpu,
  Warehouse,
  PackageCheck,
  ArrowLeftRight,
  CheckSquare,
  Scale,
  RotateCcw,
  Wrench,
  HardHat,
  Calendar,
  ClipboardCheck,
  ShieldAlert,
  Gauge,
  Zap,
  CheckCircle2,
  Smartphone
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarGroup {
  id: string;
  title: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    id: 'overview',
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial',
    items: [
      { label: 'CRM & Leads', href: '/crm', icon: Users },
      { label: 'Customers 360', href: '/customers', icon: UserCheck },
      { label: 'Quotations & Pricing', href: '/quotations', icon: FileText },
      { label: 'EPC Contracts', href: '/contracts', icon: FileSignature },
      { label: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
    ],
  },
  {
    id: 'technical',
    title: 'Technical & Design',
    items: [
      { label: 'Site Surveys', href: '/surveys', icon: ClipboardList },
      { label: 'Equipment Catalog', href: '/catalog', icon: Package },
      { label: 'Engineering & BOM', href: '/engineering', icon: Sun },
    ],
  },
  {
    id: 'operations',
    title: 'Supply Chain',
    items: [
      { label: 'Suppliers Registry', href: '/suppliers', icon: Building2 },
      { label: 'Procurement Requisitions', href: '/procurement/requisitions', icon: ClipboardList },
      { label: 'RFQs & Bid Matrix', href: '/procurement/rfqs', icon: FileSpreadsheet },
      { label: 'Purchase Orders', href: '/procurement/purchase-orders', icon: Truck },
      { label: 'Goods Receipts (GRN)', href: '/procurement/grns', icon: Boxes },
      { label: 'Serial Traceability', href: '/procurement/serials', icon: Key },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory & Warehousing',
    items: [
      { label: 'Stock Cockpit', href: '/inventory', icon: Boxes },
      { label: 'Warehouse Directory', href: '/inventory/warehouses', icon: Warehouse },
      { label: 'Stock Visibility', href: '/inventory/stock', icon: Layers },
      { label: 'Project Reservations', href: '/inventory/reservations', icon: Cpu },
      { label: 'Warehouse Transfers', href: '/inventory/transfers', icon: ArrowLeftRight },
      { label: 'Picking Operations', href: '/inventory/picking', icon: CheckSquare },
      { label: 'Packing Workspace', href: '/inventory/packing', icon: PackageCheck },
      { label: 'Outbound Dispatch & POD', href: '/inventory/dispatch', icon: Truck },
      { label: 'Counts & Adjustments', href: '/inventory/adjustments', icon: Scale },
      { label: 'Customer Returns', href: '/inventory/returns', icon: RotateCcw },
    ],
  },
  {
    id: 'installation',
    title: 'Site Execution & Installation',
    items: [
      { label: 'Execution Cockpit', href: '/installation', icon: Gauge },
      { label: 'Active Projects', href: '/installation/projects', icon: Sun },
      { label: 'Technicians & Crews', href: '/installation/technicians', icon: HardHat },
      { label: 'Site Schedules', href: '/installation/schedules', icon: Calendar },
      { label: 'Work Orders & Tasks', href: '/installation/work-orders', icon: Wrench },
      { label: 'Material Custody (MHO)', href: '/installation/material-handover', icon: Boxes },
      { label: 'Safety & Quality Gates', href: '/installation/safety-quality', icon: ShieldAlert },
      { label: 'Testing & Commissioning', href: '/installation/commissioning', icon: Zap },
      { label: 'DISCOM & Net Metering', href: '/installation/discom', icon: FileSpreadsheet },
      { label: 'Customer Handover', href: '/installation/handover', icon: CheckCircle2 },
      { label: 'Field Technician App', href: '/technician', icon: Smartphone },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & IAM',
    items: [
      { label: 'Settings Hub', href: '/settings', icon: Settings },
      { label: 'Users & Team', href: '/settings/users', icon: Users },
      { label: 'Access Roles (RBAC)', href: '/settings/roles', icon: Shield },
      { label: 'Audit Trail', href: '/settings/audit-logs', icon: History },
    ],
  },
];

interface ErpSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ErpSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: ErpSidebarProps) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside
      className={`bg-white border-r border-[#DEE2E6] flex flex-col shrink-0 select-none transition-all duration-200 ${
        collapsed ? 'w-[64px]' : 'w-[252px]'
      } h-[calc(100vh-58px)] sticky top-[58px] z-30`}
    >
      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sidebarGroups.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id}>
              {!collapsed && (
                <div
                  onClick={() => toggleGroup(group.id)}
                  className="px-2.5 py-1 text-[10px] font-bold text-[#6C757D] uppercase tracking-wider flex items-center justify-between cursor-pointer hover:text-[#212529]"
                >
                  <span>{group.title}</span>
                  {isGroupCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-[#ADB5BD]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[#ADB5BD]" />
                  )}
                </div>
              )}

              {(!isGroupCollapsed || collapsed) && (
                <div className="space-y-0.5 mt-1">
                  {group.items.map((item) => {
                    const active = isActiveRoute(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? 'bg-[#F1EAF0] text-[#714B67] font-semibold'
                            : 'text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]'
                        } ${collapsed ? 'justify-center px-0' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-[#714B67]' : 'text-[#6C757D]'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && item.badge && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle Footer (Desktop) */}
      <div className="p-2 border-t border-[#DEE2E6] flex items-center justify-between">
        {!collapsed && (
          <span className="text-[10px] text-[#ADB5BD] font-mono px-2">
            SunPowerOS v1.0
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529] mx-auto transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in-50"
            onClick={onMobileClose}
          />
          <div className="relative z-50 w-64 bg-white h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
