import React from 'react';
import { OdooTopbar } from '@/components/layout/odoo-topbar';
import { Sidebar } from '@/components/layout/sidebar';

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6] text-[#212529]">
      <OdooTopbar />
      <div className="flex-1 flex min-w-0">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
