import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/marketing-navbar';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import {
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
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Features | SunPowerOS',
  description:
    'Complete breakdown of SunPowerOS capabilities: CRM, technical site survey, solar PV engineering, BOM generation, dynamic GST quotation, and procurement.',
};

const featureCategories = [
  {
    name: 'Commercial & Sales Lifecycle',
    description: 'Capture prospective customers, qualify load capacity, and move enquiries into confirmed contracts.',
    features: [
      {
        icon: Users,
        title: 'Solar CRM & Opportunity Pipeline',
        desc: 'Visual Kanban pipeline tracking leads from initial enquiry to qualification, survey, proposal, and closed order. Built specifically for solar sales workflows.',
      },
      {
        icon: UserCheck,
        title: 'Customer 360 & Multi-Site Directory',
        desc: 'Unified customer records supporting multiple installation sites, electricity consumer numbers (DISCOM account numbers), sanctioned load, and activity history.',
      },
      {
        icon: FileText,
        title: 'Dynamic Quotations & Configured Tax Rules',
        desc: 'Itemized commercial quotations compiled directly from engineering bills of materials. Supports multi-rate GST (including 70/30 composite goods/service ratios) and PM Surya Ghar subsidy slabs.',
      },
      {
        icon: FileSignature,
        title: 'EPC Contracts & Configurable Milestones',
        desc: 'Structured solar installation contracts with configurable milestone payment schedules (e.g., booking advance, structure delivery, installation completion, net meter commissioning).',
      },
      {
        icon: ShoppingCart,
        title: 'Sales Orders & 4-Gate Prerequisite Verification',
        desc: 'Enforces strict organizational governance: a sales order cannot be initiated without an approved engineering design, frozen BOM, signed contract, and cleared booking advance.',
      },
    ],
  },
  {
    name: 'Technical Design & Field Engineering',
    description: 'Accurate technical measurements, automated string sizing, and bill of materials generation.',
    features: [
      {
        icon: ClipboardList,
        title: 'Technical Site Surveys & Feasibility',
        desc: 'Capture roof dimensions, RCC/tin/tiled structure type, slope tilt angles, true South azimuth orientation, parapet shading, and electrical panel breaker amp ratings.',
      },
      {
        icon: Package,
        title: 'Solar Product Catalog & Master Registry',
        desc: 'Standardized equipment catalog covering solar PV modules (Mono PERC, TOPCon, Bifacial), on-grid/off-grid/hybrid inverters, lithium/tubular batteries, and mounting hardware.',
      },
      {
        icon: Sun,
        title: 'Solar PV Sizing & 5-Point Inverter Validation',
        desc: 'Automated DC array calculation with cold-temperature open circuit voltage (Voc,cold), hot-temperature maximum power voltage (Vmp,hot), and inverter MPPT window compatibility checks.',
      },
      {
        icon: FileSpreadsheet,
        title: 'Automated 6-Category Bill of Materials (BOM)',
        desc: 'Instant BOM generation across 6 topology groups (Solar Generation, Power Conversion, Energy Storage, Mounting Structure, Electrical BOS, and Installation Hardware) with configurable wastage margins.',
      },
    ],
  },
  {
    name: 'Procurement & Supply Chain Operations',
    description: 'Vendor management, purchase requisitions, PO lifecycle, and inward inspection with serial tracking.',
    features: [
      {
        icon: Truck,
        title: 'Supplier Registry & RFQ Comparison',
        desc: 'Manage approved equipment vendors, generate requests for quotation (RFQs), record vendor quotes, and perform side-by-side unit rate comparisons.',
      },
      {
        icon: Boxes,
        title: 'Purchase Orders & Version Management',
        desc: 'Generate formal purchase orders from project material requirement plans (MRP), manage multi-round amendments with immutable change audits, and track delivery schedules.',
      },
      {
        icon: ShieldCheck,
        title: 'Goods Receipt Notes (GRN) & Serial Tracking',
        desc: 'Inward quality inspection recording accepted vs. rejected quantities, failure codes, and individual solar panel/inverter serial numbers for warranty verification.',
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="marketing-root min-h-screen bg-white text-[#202536] flex flex-col">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="py-20 bg-[#F4F4F6] border-b border-[#E4E5E9]">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-bold tracking-wide uppercase mb-4">
              <span>Enterprise ERP Capabilities</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#151A2B] leading-tight max-w-4xl mx-auto">
              Built specifically for solar EPC contractors.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#475065] max-w-2xl mx-auto leading-relaxed">
              Every tool your team needs to sell, engineer, procure, and install rooftop solar systems—connected under one unified platform.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/signup" className="btn-primary !py-3 !px-7">
                <span>Start Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="btn-secondary !py-3 !px-7">
                <span>Contact Sales</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Categorized Features */}
        <section className="py-20 md:py-28">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 space-y-24">
            {featureCategories.map((cat, idx) => (
              <div key={cat.name} className="space-y-8">
                <div className="border-b border-[#E4E5E9] pb-4">
                  <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
                    Domain {idx + 1}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#151A2B] mt-1">{cat.name}</h2>
                  <p className="text-sm sm:text-base text-[#737B8B] mt-1">{cat.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.features.map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div
                        key={feat.title}
                        className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs hover:shadow-md transition-all hover:border-[#714B67]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-12 h-12 rounded-xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center mb-4">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-lg text-[#151A2B] mb-2">{feat.title}</h3>
                          <p className="text-sm text-[#737B8B] leading-relaxed">{feat.desc}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#E4E5E9] flex items-center gap-1.5 text-xs font-semibold text-[#017E84]">
                          <CheckCircle2 className="w-4 h-4" /> Built into SunPowerOS
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Strip */}
        <section className="py-16 bg-[#F1EAF0] border-t border-[#E4E5E9]">
          <div className="max-w-[1080px] mx-auto px-5 lg:px-8 text-center">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#151A2B]">
              Ready to streamline your solar operations?
            </h2>
            <p className="mt-3 text-base text-[#475065] max-w-xl mx-auto">
              Get started free with SunPowerOS. Connect your sales, engineering, and procurement teams today.
            </p>
            <div className="mt-6">
              <Link href="/signup" className="btn-primary !py-3 !px-8">
                <span>Create Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
