'use client';

import React, { useState } from 'react';
import { ErpTopbar } from './erp-topbar';
import { ErpSidebar } from './erp-sidebar';

interface ErpShellProps {
  children: React.ReactNode;
}

export function ErpShell({ children }: ErpShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6] text-[#212529] font-sans selection:bg-[#714B67] selection:text-white">
      {/* 58px Compact Topbar */}
      <ErpTopbar
        onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex min-w-0">
        {/* Grouped Sidebar */}
        <ErpSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
