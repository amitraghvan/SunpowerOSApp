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
  Smartphone,
  Globe
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navSections: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Commercial',
    items: [
      { label: 'CRM & Leads', href: '/crm', icon: Users },
      { label: 'Site Surveys', href: '/surveys', icon: ClipboardList },
      { label: 'Engineering & BOM', href: '/engineering', icon: Sun },
    ],
  },
  {
    section: 'Execution',
    items: [
      { label: 'Projects', href: '/projects', icon: FolderKanban },
      { label: 'Inventory & Serials', href: '/inventory', icon: Boxes },
      { label: 'Dispatch & Logistics', href: '/dispatch', icon: Truck },
      { label: 'Installation & Field', href: '/installation', icon: Wrench },
    ],
  },
  {
    section: 'Finance & Post-Sales',
    items: [
      { label: 'Warranty & Claims', href: '/warranty', icon: ShieldCheck },
      { label: 'Finance & Invoicing', href: '/finance', icon: Receipt },
      { label: 'Analytics & BI', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Portals',
    items: [
      { label: 'Technician View', href: '/technician', icon: Smartphone },
      { label: 'Customer Portal', href: '/portal', icon: Globe },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          ☀️
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-base">SOLAROS</span>
          <span className="text-[10px] font-semibold block text-[#2563EB] tracking-wider uppercase -mt-1">
            EPC Enterprise
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {sec.section}
            </p>
            <nav className="space-y-1">
              {sec.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#2563EB] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* System Settings Footer */}
      <div className="p-3 border-t border-slate-200">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>System Settings</span>
        </Link>
      </div>
    </aside>
  );
}
