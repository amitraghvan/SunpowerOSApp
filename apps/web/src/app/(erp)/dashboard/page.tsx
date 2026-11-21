'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Sun,
  ClipboardList,
  FolderKanban,
  Boxes,
  Truck,
  Wrench,
  ShieldCheck,
  Receipt,
  ArrowRight,
  Activity
} from 'lucide-react';

const domainCards = [
  {
    title: 'CRM & Inquiries',
    desc: 'Solar lead capture, qualification pipelines, and residential site feasibility.',
    href: '/crm',
    icon: Users,
    phase: 'Phase 1',
    color: 'border-l-[#2563EB]',
  },
  {
    title: 'Site Surveys',
    desc: 'Technician roof measurements, shading analysis, azimuth, and photo records.',
    href: '/surveys',
    icon: ClipboardList,
    phase: 'Phase 1',
    color: 'border-l-[#14B8A6]',
  },
  {
    title: 'Solar Engineering & BOM',
    desc: 'PV array sizing, single-line diagrams (SLD), and equipment bill of materials.',
    href: '/engineering',
    icon: Sun,
    phase: 'Phase 2',
    color: 'border-l-[#8B5CF6]',
  },
  {
    title: 'Project Execution',
    desc: '40 projects/month tracking, 1-5 kW installations, and technical milestones.',
    href: '/projects',
    icon: FolderKanban,
    phase: 'Phase 3',
    color: 'border-l-[#F59E0B]',
  },
  {
    title: 'Inventory & Serial Tracking',
    desc: 'Barcode/QR serial traceability for panels, inverters, and battery packs.',
    href: '/inventory',
    icon: Boxes,
    phase: 'Phase 4',
    color: 'border-l-[#2563EB]',
  },
  {
    title: 'Dispatch & Field Logistics',
    desc: 'Technician kit issuance, delivery staging, and job-site handover notes.',
    href: '/dispatch',
    icon: Truck,
    phase: 'Phase 4',
    color: 'border-l-[#14B8A6]',
  },
  {
    title: 'Installation & Commissioning',
    desc: '15 technicians crew scheduling, roof mounting, and DISCOM net-metering.',
    href: '/installation',
    icon: Wrench,
    phase: 'Phase 5',
    color: 'border-l-[#8B5CF6]',
  },
  {
    title: 'Warranty & Maintenance',
    desc: '25-yr panel & 5/10-yr inverter warranty records, RMA, and fault tickets.',
    href: '/warranty',
    icon: ShieldCheck,
    phase: 'Phase 6',
    color: 'border-l-[#F43F5E]',
  },
  {
    title: 'Finance & Project Profitability',
    desc: 'Milestone billing, payment receipts, customer subsidies, and gross margins.',
    href: '/finance',
    icon: Receipt,
    phase: 'Phase 7',
    color: 'border-l-[#2563EB]',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 text-[#14B8A6] text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            Phase 0 Foundation Active
          </div>
          <h1 className="text-xl font-bold text-slate-900">SolarOS ERP Architecture Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Modular Monolith Foundation established. Business domains ready for staged implementation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors"
          >
            Swagger API Docs
          </a>
          <a
            href="http://localhost:4000/api/v1/health"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
          >
            Check API Health
          </a>
        </div>
      </div>

      {/* Domain Navigation Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
          Enterprise Business Domains
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainCards.map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-lg border border-slate-200 border-l-4 ${domain.color} p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-md bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
                      <Icon className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {domain.phase}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{domain.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{domain.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href={domain.href}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-blue-700 transition-colors"
                  >
                    View Domain Scaffolding <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
