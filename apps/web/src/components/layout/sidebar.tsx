'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Sun,
  ClipboardList,
  FolderKanban,
  Boxes,
  Truck,
  Wrench,
  ShieldCheck,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  Key,
  Building2,
  Lock,
  History,
  Cpu,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navSections: { section: string; items: NavItem[] }[] = [
  {
    section: 'Commercial & Sales',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'CRM & Leads', href: '/crm', icon: Users },
      { label: 'Customers 360', href: '/customers', icon: Users },
      { label: 'Site Surveys', href: '/surveys', icon: ClipboardList },
      { label: 'Product Catalog', href: '/catalog', icon: Boxes },
    ],
  },
  {
    section: 'Engineering & Contracts (Phase 2)',
    items: [
      { label: 'Engineering & BOM', href: '/engineering', icon: Sun },
      { label: 'Quotations & Pricing', href: '/quotations', icon: Receipt },
      { label: 'Legal Contracts', href: '/contracts', icon: ShieldCheck },
      { label: 'Sales Orders', href: '/sales-orders', icon: Truck },
    ],
  },
  {
    section: 'Operations & Execution',
    items: [
      { label: 'Projects', href: '/projects', icon: FolderKanban },
      { label: 'Inventory & Serials', href: '/inventory', icon: Boxes },
      { label: 'Finance & Invoicing', href: '/finance', icon: Receipt },
    ],
  },
  {
    section: 'Settings & IAM',
    items: [
      { label: 'Settings Hub', href: '/settings', icon: Settings },
      { label: 'Users & Team', href: '/settings/users', icon: Users },
      { label: 'Access Rights (RBAC)', href: '/settings/roles', icon: Shield },
      { label: 'Permissions Registry', href: '/settings/permissions', icon: Key },
      { label: 'Organizations & Branches', href: '/settings/organizations', icon: Building2 },
      { label: 'Active Sessions', href: '/settings/sessions', icon: Lock },
      { label: 'Security Dashboard', href: '/settings/security', icon: Cpu },
      { label: 'Audit Trail', href: '/settings/audit-logs', icon: History },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-[#DEE2E6] flex flex-col shrink-0 min-h-[calc(100vh-48px)]">
      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <p className="px-2.5 text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-1.5">
              {sec.section}
            </p>
            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive =
                  item.href === '/settings'
                    ? pathname === '/settings'
                    : pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#714B67]/10 text-[#714B67] font-semibold'
                        : 'text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#714B67]' : 'text-[#6C757D]'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#DEE2E6] text-[11px] text-[#6C757D]">
        <div className="font-semibold text-[#212529]">SolarOS v0.5</div>
        <div className="text-[10px]">Odoo 19 Experience</div>
      </div>
    </aside>
  );
}
