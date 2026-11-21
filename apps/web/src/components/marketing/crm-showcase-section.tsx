import React from 'react';
import Link from 'next/link';
import { AccentUnderline } from './accents';
import {
  CheckCircle2,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  Phone,
  Sun,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export function CrmShowcaseSection() {
  return (
    <section id="crm" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Feature Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase">
              SOLAR SALES PIPELINE
            </div>

            <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
              Every solar enquiry has a{' '}
              <span className="relative inline-block text-[#714B67]">
                next step.
                <AccentUnderline className="absolute -bottom-2 left-0 w-full h-3" color="#FF747C" />
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#475065] leading-relaxed">
              Keep track of prospective customers, understand their rooftop requirements and move each opportunity through a clear, transparent sales pipeline.
            </p>

            {/* Feature 1, 2, 3 */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#F1EAF0] text-[#714B67] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">One clear pipeline</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    See new enquiries, qualified customers, scheduled surveys, and proposals in one organized visual Kanban board.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-teal-50 text-[#06C6AE] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Solar-aware qualification</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Understand customer requirements through sanctioned load, average electricity bill units, and estimated kW capacity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-[#FFB32C] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Clear ownership & next action</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Know who is handling each enquiry and what action needs attention next: phone call, survey visit, or quotation follow-up.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/signup" className="btn-tertiary">
                <span>Explore CRM Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Odoo-Style Kanban Product Showcase */}
          <div className="lg:col-span-7">
            <div className="product-window border border-[#E4E5E9] rounded-2xl shadow-xl bg-white overflow-hidden">
              {/* Product Window Header */}
              <div className="product-window__toolbar bg-[#FBFBFC] px-4 py-2.5 border-b border-[#E4E5E9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="ml-2 font-semibold text-[#151A2B]">Opportunity Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67]">
                    Illustrative Product Preview
                  </span>
                  <span className="text-[11px] text-[#737B8B] font-mono hidden sm:inline">
                    Stage: Qualified → Survey Pending
                  </span>
                </div>
              </div>

              {/* Kanban Content Area */}
              <div className="p-4 sm:p-5 bg-[#F8F8FA] grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Column 1: Qualified Stage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E5E9] text-xs">
                    <span className="font-bold text-[#151A2B]">Qualified Enquiries</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">2 Deals</span>
                  </div>

                  <div className="crm-preview-card">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#151A2B]">Sample Residential Rooftop</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[#714B67] text-[10px] font-bold">5 kW On-Grid</span>
                    </div>
                    <div className="text-[11px] text-[#737B8B] mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Civil Lines, Sector 4, Jaipur</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 bg-[#F4F4F6] p-1.5 rounded flex items-center justify-between">
                      <span>Sanction Load: <strong>7 kW</strong></span>
                      <span>Avg Bill: <strong>₹5,400</strong></span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-[#017E84] font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Call: Confirm roof access
                      </span>
                      <span className="text-[#737B8B]">Today</span>
                    </div>
                  </div>

                  <div className="crm-preview-card">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#151A2B]">Example Commercial Rooftop</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">25 kW C&I</span>
                    </div>
                    <div className="text-[11px] text-[#737B8B] mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Industrial Area Phase 2, Bhiwadi</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 bg-[#F4F4F6] p-1.5 rounded flex items-center justify-between">
                      <span>Tariff: <strong>Commercial HT</strong></span>
                      <span>Target: <strong>Net Metering</strong></span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-[#FF747C] font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Survey scheduled: 24 Nov
                      </span>
                      <span className="text-[#737B8B]">Eng. Amit</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Proposal / Negotiation Stage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E5E9] text-xs">
                    <span className="font-bold text-[#151A2B]">Proposal in Review</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">₹12,40,000</span>
                  </div>

                  <div className="crm-preview-card border-l-3 border-l-[#06C6AE]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#151A2B]">Mehta Residency</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">8 kW DCR Mono</span>
                    </div>
                    <div className="text-[11px] text-[#737B8B] mt-1.5 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" />
                      <span>Quote: QTN-2026-00088 (₹4,20,000)</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 bg-emerald-50/50 p-1.5 rounded flex items-center justify-between border border-emerald-100">
                      <span>Subsidy: <strong>₹78,000</strong></span>
                      <span className="text-emerald-700 font-bold">PM Surya Ghar</span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-[#714B67] font-bold">Customer Accepted OTP</span>
                      <span className="text-[#017E84] font-medium">Ready for Contract</span>
                    </div>
                  </div>

                  <div className="crm-preview-card border-l-3 border-l-[#714B67]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#151A2B]">Kiran Renewable Assets</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[#714B67] text-[10px] font-bold">50 kW Off-Grid</span>
                    </div>
                    <div className="text-[11px] text-[#737B8B] mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>BOM Approved & Frozen</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 bg-[#F4F4F6] p-1.5 rounded flex items-center justify-between">
                      <span>Battery Bank: <strong>48V 400Ah</strong></span>
                      <span>Total BOM: <strong>₹18,20,000</strong></span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-[#FF747C] font-semibold">Payment milestone v1</span>
                      <span className="text-[#737B8B]">Sales Dir. Sign</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Window Footer */}
              <div className="product-window__caption px-4 py-2 bg-[#FBFBFC] text-[11px] text-[#737B8B] flex items-center justify-between">
                <span>Direct CRM integration with site surveys and automated quotation generation.</span>
                <span className="font-mono text-[10px] text-[#714B67] font-semibold">Sample CRM Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
