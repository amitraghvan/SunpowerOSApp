import React from 'react';
import Link from 'next/link';
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
  ArrowRight
} from 'lucide-react';

const editorialFeatures = [
  {
    icon: Users,
    title: 'CRM & Lead Management',
    desc: 'Capture solar enquiries, qualify opportunities by sanctioned load and roof area, and track stages in a visual pipeline.',
    href: '#crm',
    accent: '#714B67',
  },
  {
    icon: UserCheck,
    title: 'Customer 360 Workspace',
    desc: 'Connect customer contacts, multi-site installation addresses, electricity consumer numbers, and activity timelines.',
    href: '#customer-360',
    accent: '#06C6AE',
  },
  {
    icon: ClipboardList,
    title: 'Technical Site Surveys',
    desc: 'Capture roof measurements, slope tilt, azimuth, electrical panel feasibility, and geo-tagged field photo audits.',
    href: '#survey',
    accent: '#FF747C',
  },
  {
    icon: Package,
    title: 'Solar Product Catalog',
    desc: 'Manage modules, inverters, batteries, equipment variants, statutory specifications, and historical vendor price catalogs.',
    href: '#features',
    accent: '#FFB32C',
  },
  {
    icon: Sun,
    title: 'Solar Engineering Design',
    desc: 'Automated DC sizing, string temperature bounds (Voc/Vmp), and 5-point inverter electrical compatibility validation.',
    href: '#engineering',
    accent: '#714B67',
  },
  {
    icon: FileSpreadsheet,
    title: 'Automated BOM Generation',
    desc: 'Generate structured bill of materials across 6 standard topology groups with frozen unit costs and wastage allowances.',
    href: '#engineering',
    accent: '#06C6AE',
  },
  {
    icon: FileText,
    title: 'Quotations & Pricing',
    desc: 'Transparent commercial proposals with 13.8% composite Indian GST, margin controls, and PM Surya Ghar subsidy tiers.',
    href: '#quotations',
    accent: '#FF747C',
  },
  {
    icon: FileSignature,
    title: 'Legal EPC Contracts',
    desc: 'Statutory 4-stage milestone schedules (20-40-30-10), equipment performance warranties, and digital signature records.',
    href: '#quotations',
    accent: '#FFB32C',
  },
  {
    icon: ShoppingCart,
    title: 'Sales Orders & Handoff',
    desc: 'Strict 4-gate prerequisite check enforcing approved design, BOM, contract, and advance clearance before project initiation.',
    href: '#workflow',
    accent: '#017E84',
  },
];

export function FeatureGridSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-[#F4F4F6] border-y border-[#E4E5E9]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase mb-3">
            CONNECTED ERP CAPABILITIES
          </div>
          <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
            Everything your solar team works on. Connected.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475065] leading-relaxed">
            Explore the connected commercial, technical, and operational capabilities built to power solar EPC companies in India.
          </p>
        </div>

        {/* 9 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editorialFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="marketing-feature-card group"
              >
                <div
                  className="marketing-feature-card__icon"
                  style={{ backgroundColor: `${f.accent}15`, color: f.accent }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="marketing-feature-card__title group-hover:text-[#714B67] transition-colors">
                  {f.title}
                </h3>

                <p className="marketing-feature-card__description">
                  {f.desc}
                </p>

                <div className="mt-auto pt-2">
                  <Link href={f.href} className="btn-tertiary text-xs">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
