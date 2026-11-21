import React from 'react';
import {
  Users,
  UserCheck,
  ClipboardList,
  Sun,
  FileSpreadsheet,
  FileText,
  FileSignature,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { AccentUnderline } from './accents';

const stageOneSteps = [
  {
    step: '01',
    phase: 'Commercial',
    title: 'Enquiry Capture',
    desc: 'Capture solar leads with sanctioned load, monthly bill units & rooftop feasibility.',
    icon: Users,
    color: '#714B67',
    tag: 'CRM Pipeline',
  },
  {
    step: '02',
    phase: 'Customer 360',
    title: 'Customer Profile',
    desc: 'Multi-site installation addresses, DISCOM consumer numbers & historical logs.',
    icon: UserCheck,
    color: '#008784',
    tag: 'Site Directory',
  },
  {
    step: '03',
    phase: 'Technical Audit',
    title: 'Site Survey',
    desc: 'Measure usable roof area, slope tilt, azimuth orientation & photographic audit.',
    icon: ClipboardList,
    color: '#E95B5B',
    tag: 'Field Inspection',
  },
  {
    step: '04',
    phase: 'Solar Engineering',
    title: 'Array Design',
    desc: 'String temperature calculations (Voc/Vmp), DC/AC ratio & 5-point inverter validation.',
    icon: Sun,
    color: '#F59E0B',
    tag: 'Physics Engine',
  },
];

const stageTwoSteps = [
  {
    step: '05',
    phase: 'BOM Management',
    title: 'BOM Generation',
    desc: 'Automated 6-category topology grouping with frozen unit costs & wastage buffers.',
    icon: FileSpreadsheet,
    color: '#714B67',
    tag: 'Material Spec',
  },
  {
    step: '06',
    phase: 'Pricing & Tax',
    title: 'Quotation & GST',
    desc: 'Itemized commercial costing, configured multi-rate GST & PM Surya Ghar subsidy.',
    icon: FileText,
    color: '#008784',
    tag: 'Dynamic Proposals',
  },
  {
    step: '07',
    phase: 'Legal Agreement',
    title: 'EPC Contract',
    desc: 'Configurable milestone payment schedules, digital signatures & equipment warranties.',
    icon: FileSignature,
    color: '#E95B5B',
    tag: 'Terms & Milestones',
  },
  {
    step: '08',
    phase: 'Order Execution',
    title: 'Sales Order',
    desc: '4-gate prerequisite check, advance payment clearance & project initiation handoff.',
    icon: ShoppingCart,
    color: '#017E84',
    tag: 'Project Handoff',
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-24 py-20 md:py-28 bg-[#F4F4F6] border-y border-[#E4E5E9]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-bold tracking-widest uppercase mb-4 shadow-2xs">
            <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>CONNECTED SOLAR LIFECYCLE</span>
          </div>

          <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
            One solar journey.{' '}
            <span className="relative inline-block text-[#714B67]">
              Every step connected.
              <AccentUnderline className="absolute -bottom-2.5 left-0 w-full h-3" color="#FF747C" />
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-[#475065] leading-relaxed">
            Your solar business has many moving parts. SunPowerOS connects commercial and technical workflows so your team moves from enquiry to installation with complete data integrity.
          </p>
        </div>

        {/* 2 Balanced Rows of 4 Cards with Connected Flow */}
        <div className="space-y-8">
          {/* Group 1: Qualification & Feasibility (Steps 01 - 04) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#714B67] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#714B67]" />
                Phase I: Opportunity Qualification & Technical Design
              </span>
              <span className="text-xs font-mono text-[#6C757D]">Steps 01 – 04</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
              {stageOneSteps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs hover:shadow-md hover:border-[#714B67]/40 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Top Row: Icon + Step Badge & Phase */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C757D] bg-[#F8F9FA] px-2.5 py-0.5 rounded border border-[#E9ECEF]">
                            {item.phase}
                          </span>
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white shadow-2xs"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.step}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-[#151A2B] group-hover:text-[#714B67] transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3.5 border-t border-[#F1F3F5] flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[#008784] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {item.tag}
                      </span>
                      <span className="text-[#ADB5BD] font-mono text-[11px]">
                        Stage {idx + 1}
                      </span>
                    </div>

                    {/* Connector Arrow for Desktop */}
                    {idx < 3 && (
                      <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-[#DEE2E6] items-center justify-center text-[#714B67] shadow-xs">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 2: Commercial Pricing, Contracting & Fulfillment (Steps 05 - 08) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008784] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#008784]" />
                Phase II: Commercial Proposals, Contracting & Order Handoff
              </span>
              <span className="text-xs font-mono text-[#6C757D]">Steps 05 – 08</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
              {stageTwoSteps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs hover:shadow-md hover:border-[#008784]/40 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Top Row: Icon + Step Badge & Phase */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C757D] bg-[#F8F9FA] px-2.5 py-0.5 rounded border border-[#E9ECEF]">
                            {item.phase}
                          </span>
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white shadow-2xs"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.step}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-[#151A2B] group-hover:text-[#008784] transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3.5 border-t border-[#F1F3F5] flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[#008784] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {item.tag}
                      </span>
                      <span className="text-[#ADB5BD] font-mono text-[11px]">
                        Stage {idx + 5}
                      </span>
                    </div>

                    {/* Connector Arrow for Desktop */}
                    {idx < 3 && (
                      <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-[#DEE2E6] items-center justify-center text-[#008784] shadow-xs">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Micro-Banner */}
        <div className="mt-12 bg-white rounded-2xl p-5 sm:p-6 border border-[#DEE2E6] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008784] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#151A2B]">Strict Upstream Data Validation</div>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Every downstream quotation and sales order mathematically references approved engineering parameters and surveyed roof limits.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-1.5 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-mono font-bold border border-[#714B67]/20">
              Zero Disconnected Spreadsheets
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
