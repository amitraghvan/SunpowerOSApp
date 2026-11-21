import React from 'react';
import Link from 'next/link';
import { Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';

export default function TechnicianPortalPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4 max-w-md mx-auto flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between py-3 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#2563EB]" />
            <h1 className="font-bold text-base text-slate-900">Technician Field Shell</h1>
          </div>
          <Link href="/dashboard" className="text-xs text-[#2563EB] flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3 h-3" /> ERP
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#14B8A6]">
            <CheckCircle className="w-4 h-4" /> Route Group (technician) Initialized
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mobile-optimized view for 15 field technicians. Supports geofenced site check-ins, roof survey data collection, serial barcode scanning, and installation checklists.
          </p>
        </div>
      </div>

      <div className="py-4 text-center text-[11px] text-slate-400">
        SolarOS Mobile Field Experience • Phase 5 Field Ops
      </div>
    </div>
  );
}
