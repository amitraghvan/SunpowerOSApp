import React from 'react';
import Link from 'next/link';
import { AccentUnderline } from './accents';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Zap,
  Building,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export function CustomerShowcaseSection() {
  return (
    <section id="customer-360" className="py-20 md:py-28 bg-[#F4F4F6] border-y border-[#E4E5E9]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Product Window Preview */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="product-window border border-[#E4E5E9] rounded-2xl shadow-xl bg-white overflow-hidden">
              <div className="product-window__toolbar bg-[#FBFBFC] px-4 py-2.5 border-b border-[#E4E5E9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="ml-2 font-semibold text-[#151A2B]">Customer 360 Workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67]">
                    Illustrative Product Preview
                  </span>
                  <span className="text-[11px] text-[#737B8B] font-mono hidden sm:inline">
                    Record: CUST-2026-00034
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Customer Profile Banner */}
                <div className="bg-[#F8F8FA] rounded-xl p-4 border border-[#E4E5E9] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold text-lg">
                      SC
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#151A2B]">Sample Rooftop Customer</h4>
                      <p className="text-xs text-[#737B8B] flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +91 98110 XXXXX</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> sample.client@example.com</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[#714B67] text-xs font-bold">
                      Residential Owner
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      Active Customer
                    </span>
                  </div>
                </div>

                {/* Installation Sites Grid */}
                <div>
                  <div className="text-xs font-bold text-[#714B67] uppercase tracking-wider mb-2">
                    Installation Sites (2 Rooftops)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="font-bold text-[#151A2B] flex items-center justify-between">
                        <span>Main Residence</span>
                        <span className="text-[#06C6AE] font-semibold">5 kW Grid-Tie</span>
                      </div>
                      <p className="text-[#737B8B] flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Sector 48, Solar Park, Gurugram</span>
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Discom: <strong>DHBVN</strong></span>
                        <span>CA: <strong>982341209</strong></span>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="font-bold text-[#151A2B] flex items-center justify-between">
                        <span>Farmhouse Tubewell</span>
                        <span className="text-amber-700 font-semibold">3 kW Off-Grid</span>
                      </div>
                      <p className="text-[#737B8B] flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Sohna Road, Badshahpur</span>
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Sanction: <strong>5 HP Motor</strong></span>
                        <span>Battery: <strong>48V 200Ah</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit & Activity Timeline */}
                <div>
                  <div className="text-xs font-bold text-[#714B67] uppercase tracking-wider mb-2">
                    Recent Customer Activity
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F8FA] border border-[#E4E5E9]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quotation QTN-2026-00045 approved via digital signature</span>
                      </div>
                      <span className="text-[10px] text-[#737B8B]">Yesterday</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F8FA] border border-[#E4E5E9]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#714B67]" />
                        <span>Site Survey SRV-2026-00012 completed by Tech Rajesh</span>
                      </div>
                      <span className="text-[10px] text-[#737B8B]">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="product-window__caption px-4 py-2 bg-[#FBFBFC] text-[11px] text-[#737B8B] flex items-center justify-between">
                <span>Unified residential customer record linking utility meters, roof surveys, and contract records.</span>
                <span className="font-mono text-[10px] text-[#714B67] font-semibold">Live Preview</span>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Story */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase">
              CUSTOMER 360 WORKSPACE
            </div>

            <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
              One customer. Every rooftop.{' '}
              <span className="relative inline-block text-[#06C6AE]">
                One complete view.
                <AccentUnderline className="absolute -bottom-2 left-0 w-full h-3" color="#714B67" />
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#475065] leading-relaxed">
              Bring customer contacts, billing details, installation sites, survey information, and activity history together in one place—preventing fragmented records across your sales and engineering teams.
            </p>

            <ul className="space-y-3 text-sm text-[#475065]">
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Multi-site solar management under a single primary customer account.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Discom consumer account numbers, electricity bill history, and sanctioned load.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Traceable activity log tracking sales calls, surveys, proposals, and contracts.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/signup" className="btn-primary !py-2.5 !px-6">
                <span>Start Free Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
