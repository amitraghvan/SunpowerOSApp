'use client';

import React from 'react';
import Link from 'next/link';
import { AccentUnderline, CoralSpark, SketchArrow } from './accents';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  ArrowRight,
  Sun,
  MapPin,
  Clock
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white">
      {/* Subtle background ambient rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-12 left-1/4 w-72 h-72 bg-[#F1EAF0] rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-teal-50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EAF0] text-[#714B67] text-[13px] font-bold tracking-widest uppercase mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CoralSpark className="w-4 h-4 text-[#FF747C]" />
          <span>THE SOLAR EPC OPERATING PLATFORM</span>
        </div>

        {/* Master Editorial Handwritten Heading */}
        <h1 className="font-display font-bold text-slate-900 tracking-tight leading-[0.98] text-[44px] sm:text-[62px] md:text-[76px] lg:text-[88px] max-w-4xl mx-auto">
          Run your solar business.{' '}
          <span className="relative inline-block text-[#FF747C]">
            Power every project.
            <AccentUnderline className="absolute -bottom-2.5 left-0 w-full h-4" color="#06C6AE" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-lg sm:text-xl text-[#475065] max-w-2xl mx-auto leading-relaxed font-normal">
          Bring customer enquiries, site surveys, solar engineering, quotations and business operations together in one connected workspace.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          <Link href="/signup" className="btn-primary w-full sm:w-auto text-base">
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="#workflow" className="btn-secondary w-full sm:w-auto text-base">
            <span>Explore Platform</span>
          </Link>
        </div>

        {/* Microcopy */}
        <div className="mt-3.5 text-xs text-[#737B8B] font-medium flex items-center justify-center gap-2">
          <span>Start by creating your SunPowerOS workspace.</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Standard INR currency & Indian GST compliance.</span>
        </div>

        {/* Hero Product Window Preview (Actual SunPowerOS CRM UI Frame) */}
        <div className="mt-14 lg:mt-20 max-w-[1140px] mx-auto text-left relative">
          {/* Hand-drawn annotation pointer */}
          <div className="hidden lg:flex items-center gap-2 absolute -top-12 -right-6 z-10">
            <span className="font-display font-bold text-xl text-[#714B67] -rotate-6">Live CRM Pipeline</span>
            <SketchArrow className="w-8 h-8 text-[#FFB32C] rotate-45" />
          </div>

          <div className="product-window border border-[#E4E5E9] rounded-2xl shadow-2xl bg-white overflow-hidden">
            {/* Window Browser Header Bar */}
            <div className="product-window__toolbar bg-[#FBFBFC] px-4 py-3 border-b border-[#E4E5E9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF747C]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#FFB32C]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#06C6AE]/80" />
                </div>
                <div className="ml-4 px-3 py-1 bg-white border border-[#E4E5E9] rounded-md text-[11px] font-mono text-[#737B8B] flex items-center gap-2 shadow-xs">
                  <span className="text-[#06C6AE]">https://</span>
                  <span>app.sunpoweros.in/crm</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#737B8B]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67] text-[10px] font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Illustrative Product Preview
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-[#714B67]">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  SunPower Solutions (HQ)
                </span>
              </div>
            </div>

            {/* SunPowerOS CRM Topbar & Subbar */}
            <div className="bg-[#714B67] text-white px-5 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold tracking-tight text-sm">SunPowerOS</span>
                <span className="opacity-40">|</span>
                <span className="bg-white/10 px-2 py-0.5 rounded font-medium">CRM & Sales</span>
                <span className="opacity-70 hover:opacity-100 cursor-pointer hidden md:inline">Customers</span>
                <span className="opacity-70 hover:opacity-100 cursor-pointer hidden md:inline">Surveys</span>
                <span className="opacity-70 hover:opacity-100 cursor-pointer hidden md:inline">Engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                  Tenant: org_sunpower_01
                </span>
              </div>
            </div>

            {/* Sub-bar controls */}
            <div className="bg-white px-5 py-3 border-b border-[#E4E5E9] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded bg-[#017E84] text-white font-semibold flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Lead</span>
                </button>
                <button className="px-3 py-1.5 rounded bg-[#F4F4F6] text-[#202536] font-medium flex items-center gap-1 border border-[#E4E5E9]">
                  <Filter className="w-3.5 h-3.5 text-[#737B8B]" />
                  <span>Filters</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737B8B]" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search residential or commercial leads..."
                    className="pl-8 pr-3 py-1.5 bg-[#F8F8FA] border border-[#E4E5E9] rounded text-xs w-56 text-[#475065]"
                  />
                </div>
                <div className="text-xs font-semibold text-[#714B67]">
                  Pipeline Value: <span className="font-bold text-[#151A2B]">₹18,40,000</span>
                </div>
              </div>
            </div>

            {/* Kanban Preview Body */}
            <div className="p-4 sm:p-5 bg-[#F8F8FA] overflow-x-auto">
              <div className="grid grid-cols-4 gap-4 min-w-[840px]">
                {/* Column 1: New (Enquiry) */}
                <div className="bg-[#F0F1F4] rounded-xl p-3 border border-[#E4E5E9]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D7D9E0]">
                    <span className="font-semibold text-xs text-[#202536]">New Enquiry</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#714B67]">3</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="crm-preview-card">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-[#151A2B]">Rajesh Sharma</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">3 kW</span>
                      </div>
                      <p className="text-[11px] text-[#737B8B] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Gurugram, Sector 57</span>
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-[#017E84] font-medium flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> First Call Due
                        </span>
                        <span className="text-[#737B8B]">Today</span>
                      </div>
                    </div>

                    <div className="crm-preview-card">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-[#151A2B]">GreenLeaf Apartments</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">10 kW</span>
                      </div>
                      <p className="text-[11px] text-[#737B8B] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Noida, Phase 2</span>
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-[#737B8B]">Electricity bill reviewed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Survey Scheduled */}
                <div className="bg-[#F0F1F4] rounded-xl p-3 border border-[#E4E5E9]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D7D9E0]">
                    <span className="font-semibold text-xs text-[#202536]">Survey Scheduled</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#714B67]">2</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="crm-preview-card border-l-3 border-l-[#FF747C]">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-[#151A2B]">Col. V.K. Singhania</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[#714B67] text-[10px] font-medium">5 kW</span>
                      </div>
                      <p className="text-[11px] text-[#737B8B] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>South Ext, New Delhi</span>
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-[#FF747C] font-semibold flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" /> Tomorrow 10:30 AM
                        </span>
                        <span className="font-medium text-slate-700">Tech: Vikram</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Proposal Sent */}
                <div className="bg-[#F0F1F4] rounded-xl p-3 border border-[#E4E5E9]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D7D9E0]">
                    <span className="font-semibold text-xs text-[#202536]">Proposal / Quote</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#714B67]">2</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="crm-preview-card border-l-3 border-l-[#06C6AE]">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-[#151A2B]">Apex Cold Storage</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium">15 kW</span>
                      </div>
                      <p className="text-[11px] text-[#737B8B] mt-1 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-500" />
                        <span>QTN-2026-00042 (v2)</span>
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#151A2B]">₹7,85,000</span>
                        <span className="text-[#06C6AE] font-semibold">13.8% GST Incl.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 4: Won / Order Confirmed */}
                <div className="bg-[#F0F1F4] rounded-xl p-3 border border-[#E4E5E9]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D7D9E0]">
                    <span className="font-semibold text-xs text-[#202536]">Order Confirmed</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">4</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="crm-preview-card border-l-3 border-l-emerald-500 bg-emerald-50/30">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-[#151A2B]">Dr. Ananya Roy</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">5 kW Hybrid</span>
                      </div>
                      <p className="text-[11px] text-[#737B8B] mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Sales Order SO-2026-00018</span>
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-700 font-bold">20% Advance Cleared</span>
                        <span className="text-[#737B8B]">PRJ Handover</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Window Caption */}
            <div className="product-window__caption px-4 py-2.5 bg-[#FBFBFC] text-[11px] text-[#737B8B] flex items-center justify-between border-t border-[#E4E5E9]">
              <span>Real-time SunPowerOS CRM Kanban view with solar capacity tags, roof survey schedules, and GST quotations.</span>
              <span className="font-mono text-[10px] text-[#714B67] font-semibold">Illustrative product preview</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
