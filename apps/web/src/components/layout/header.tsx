'use client';

import React from 'react';
import { TenantSwitcher } from './tenant-switcher';
import { UserNav } from './user-nav';
import { Bell, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Organization Switcher & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <TenantSwitcher />
        <div className="h-4 w-px bg-slate-200 hidden md:block" />
        <span className="text-xs text-slate-400 font-medium hidden md:inline">
          Solar EPC Operations
        </span>
      </div>

      {/* Center / Right: Global Search & User Profile */}
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, serials, leads..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
          />
        </div>

        <button
          aria-label="Notifications"
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#14B8A6] absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        <div className="h-4 w-px bg-slate-200" />
        <UserNav />
      </div>
    </header>
  );
}
