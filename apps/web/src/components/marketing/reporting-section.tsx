import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Target
} from 'lucide-react';

export function ReportingSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase mb-3">
            BUSINESS VISIBILITY & ANALYTICS
          </div>
          <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
            See where your solar business is moving.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475065] leading-relaxed">
            Understand your sales pipeline, upcoming survey visits, engineering throughput, and order velocity through a single connected cockpit.
          </p>
        </div>

        {/* High-Impact Single Reporting Visualization Cockpit (Composition H) */}
        <div className="bg-[#F8F8FA] rounded-3xl p-6 sm:p-10 border border-[#E4E5E9] shadow-sm">
          {/* Cockpit Top Bar */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-[#E4E5E9] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#714B67] text-white flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#151A2B]">Operational Velocity & Analytics Cockpit</h3>
                <p className="text-xs text-[#737B8B]">Live metrics aggregated across CRM, Surveys, and Contracts</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E4E5E9] text-xs font-mono text-[#737B8B]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Illustrative Product Preview</span>
            </div>
          </div>

          {/* 4 Metric Strips */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            <div className="bg-white p-4 rounded-xl border border-[#E4E5E9]">
              <span className="text-xs text-[#737B8B] font-medium block">Active Pipeline Value</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#151A2B] mt-1">₹42.8 Lakh</div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> 18 Active Opportunities
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E4E5E9]">
              <span className="text-xs text-[#737B8B] font-medium block">Enquiry-to-Order Conversion</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#151A2B] mt-1">34.2%</div>
              <span className="text-xs text-[#06C6AE] font-semibold flex items-center gap-1 mt-1">
                <Target className="w-3.5 h-3.5" /> Avg 11.4 Day Cycle
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E4E5E9]">
              <span className="text-xs text-[#737B8B] font-medium block">Site Surveys Completed</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#151A2B] mt-1">24 Audits</div>
              <span className="text-xs text-[#FF747C] font-semibold flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5" /> 1.8 Days to Proposal
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E4E5E9]">
              <span className="text-xs text-[#737B8B] font-medium block">Total Contracted Capacity</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#151A2B] mt-1">118 kWp</div>
              <span className="text-xs text-[#714B67] font-semibold flex items-center gap-1 mt-1">
                <Zap className="w-3.5 h-3.5" /> Residential & C&I Rooftops
              </span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Left: Pipeline Stage Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-[#E4E5E9]">
              <h4 className="text-xs font-bold text-[#714B67] uppercase tracking-wider mb-3">
                Pipeline Stage Distribution
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">New Enquiries (Sanction Check)</span>
                    <span className="font-mono text-slate-600">8 Leads (₹14.2L)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#714B67] rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">Surveys & Feasibility Pending</span>
                    <span className="font-mono text-slate-600">5 Leads (₹12.6L)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#06C6AE] rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">Commercial Proposals Under Review</span>
                    <span className="font-mono text-slate-600">5 Leads (₹16.0L)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#FFB32C] rounded-full" style={{ width: '38%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Operational Cycle Velocity */}
            <div className="bg-white p-5 rounded-2xl border border-[#E4E5E9]">
              <h4 className="text-xs font-bold text-[#06C6AE] uppercase tracking-wider mb-3">
                Operational Efficiency Benchmarks
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F8FA]">
                  <span className="text-[#475065]">Survey Schedule to Visit:</span>
                  <span className="font-bold text-slate-800 font-mono">Within 24 Hours</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F8FA]">
                  <span className="text-[#475065]">Engineering BOM Generation:</span>
                  <span className="font-bold text-slate-800 font-mono">Instant (Algorithmic)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F8FA]">
                  <span className="text-[#475065]">Sales Order Advance Clearance:</span>
                  <span className="font-bold text-slate-800 font-mono">100% Verified Before Handoff</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
