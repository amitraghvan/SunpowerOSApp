import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/marketing-navbar';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import {
  Home,
  Building2,
  Network,
  CheckCircle2,
  ArrowRight,
  Sun,
  Shield,
  Zap,
  Clock
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solar Solutions | SunPowerOS',
  description:
    'Tailored workflows for residential solar installers, commercial & industrial EPCs, and multi-branch solar enterprises.',
};

const solutions = [
  {
    icon: Home,
    title: 'Residential Solar Installers',
    subtitle: 'High-Volume Rooftop Projects (1 kW – 10 kW)',
    description:
      'Speed up customer turnaround from lead to commissioning with streamlined site surveys, PM Surya Ghar subsidy guidance, and automated GST quotations.',
    benefits: [
      'Rapid rooftop feasibility assessment and mobile photo capture',
      'Automated PM Surya Ghar national subsidy tier calculation',
      'Dynamic multi-rate GST quoting with configurable 70/30 goods-to-services composite rules',
      'Configurable 4-stage residential customer payment milestones',
      'Clear sales order handoff with advance clearance verification',
    ],
    accent: '#714B67',
  },
  {
    icon: Building2,
    title: 'Commercial & Industrial (C&I) EPCs',
    subtitle: 'Medium to Large Solar Arrays (25 kW – 500 kW+)',
    description:
      'Handle complex multi-string engineering, high-voltage MPPT compatibility, tiered procurement vendor comparisons, and detailed bill of materials tracking.',
    benefits: [
      'Rigorous 5-point electrical compatibility validation across wide temperature swings',
      'Multi-inverter, multi-string electrical BOS mapping with accurate cable sizing',
      'Supplier RFQ comparison across approved tier-1 module and inverter vendors',
      'Granular purchase order versioning with change audit logging',
      'Serial number and batch tracking for multi-MW inward goods inspection',
    ],
    accent: '#06C6AE',
  },
  {
    icon: Network,
    title: 'Multi-Branch Solar Enterprises',
    subtitle: 'Regional & Multi-State EPC Operations',
    description:
      'Govern distributed sales teams, field technicians, and regional warehouses with enterprise multi-tenancy, branch data scoping, and centralized procurement control.',
    benefits: [
      'PostgreSQL Row-Level Security isolating regional branch operations',
      'Role-based permissions (Sales Rep, Solar Engineer, Field Auditor, Supply Chain Manager)',
      'Centralized equipment catalog with localized branch pricing tiers',
      'Cross-branch material requirement planning (MRP) and inventory visibility',
      'Complete audit trail of quotation approvals, discounts, and order confirmations',
    ],
    accent: '#FF747C',
  },
];

export default function SolutionsPage() {
  return (
    <div className="marketing-root min-h-screen bg-white text-[#202536] flex flex-col">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="py-20 bg-[#F4F4F6] border-b border-[#E4E5E9]">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-bold tracking-wide uppercase mb-4">
              <span>Tailored Solutions</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#151A2B] leading-tight max-w-4xl mx-auto">
              Engineered for every scale of solar operations.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#475065] max-w-2xl mx-auto leading-relaxed">
              Whether you install 10 residential systems a month or manage multi-state commercial portfolios, SunPowerOS adapts to your operational workflow.
            </p>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-20 md:py-28">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 space-y-16">
            {solutions.map((sol, index) => {
              const Icon = sol.icon;
              return (
                <div
                  key={sol.title}
                  className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E4E5E9] shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${sol.accent}15`, color: sol.accent }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#737B8B]">
                        {sol.subtitle}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#151A2B] mt-1">{sol.title}</h2>
                    </div>
                    <p className="text-sm sm:text-base text-[#475065] leading-relaxed">
                      {sol.description}
                    </p>
                    <div className="pt-2">
                      <Link href="/signup" className="btn-primary !py-2.5 !px-6 inline-flex">
                        <span>Get Started Free</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-[#F8F8FA] rounded-2xl p-6 sm:p-8 border border-[#E4E5E9]">
                    <h3 className="font-bold text-sm text-[#151A2B] uppercase tracking-wider mb-4">
                      Key Capabilities Included:
                    </h3>
                    <ul className="space-y-3.5">
                      {sol.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-sm text-[#374151]">
                          <CheckCircle2
                            className="w-5 h-5 shrink-0 mt-0.5"
                            style={{ color: sol.accent }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
