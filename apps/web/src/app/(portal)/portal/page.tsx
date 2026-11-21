import React from 'react';
import Link from 'next/link';
import { Globe, ArrowLeft, Sun } from 'lucide-react';

export default function CustomerPortalPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-[#2563EB]" />
          <span className="font-bold text-slate-900 text-sm">SolarOS Customer Portal</span>
        </div>
        <Link href="/dashboard" className="text-xs text-[#2563EB] flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3 h-3" /> Back to ERP
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Welcome to Your Solar Journey</h2>
          <p className="text-sm text-slate-500 mt-1">
            Route group <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">(portal)</code> is active.
            Customer-facing quotation reviews, document signing, installation timeline tracking, and generation dashboards will be connected here.
          </p>
        </div>
      </main>
    </div>
  );
}
