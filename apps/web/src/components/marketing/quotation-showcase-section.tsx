import React from 'react';
import Link from 'next/link';
import { AccentUnderline } from './accents';
import {
  FileText,
  Percent,
  History,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Download,
  Printer
} from 'lucide-react';

export function QuotationShowcaseSection() {
  return (
    <section id="quotations" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Benefits */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase">
              COMMERCIAL PROPOSALS & GST
            </div>

            <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
              Create clearer solar quotations.{' '}
              <span className="relative inline-block text-[#06C6AE]">
                With less manual effort.
                <AccentUnderline className="absolute -bottom-2 left-0 w-full h-3" color="#FF747C" />
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#475065] leading-relaxed">
              Build itemized commercial proposals directly from approved engineering configurations and material lists—with transparent Indian GST and PM Surya Ghar subsidy calculations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#F8F8FA] p-4 rounded-xl border border-[#E4E5E9]">
                <h4 className="font-bold text-sm text-[#151A2B] flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#06C6AE]" /> BOM-Based Pricing
                </h4>
                <p className="text-xs text-[#737B8B]">
                  Quotation line items compile automatically from the frozen engineering bill of materials.
                </p>
              </div>

              <div className="bg-[#F8F8FA] p-4 rounded-xl border border-[#E4E5E9]">
                <h4 className="font-bold text-sm text-[#151A2B] flex items-center gap-1.5 mb-1">
                  <Percent className="w-4 h-4 text-[#714B67]" /> Dynamic Multi-Rate GST
                </h4>
                <p className="text-xs text-[#737B8B]">
                  Applicable GST based on configured tax rules: 70% goods @ 12% + 30% services @ 18% (13.8% composite) or standard slabs.
                </p>
              </div>

              <div className="bg-[#F8F8FA] p-4 rounded-xl border border-[#E4E5E9]">
                <h4 className="font-bold text-sm text-[#151A2B] flex items-center gap-1.5 mb-1">
                  <History className="w-4 h-4 text-[#FF747C]" /> Version Snapshots
                </h4>
                <p className="text-xs text-[#737B8B]">
                  Maintain earlier quotation revisions (v1, v2) with frozen margin and discount audits.
                </p>
              </div>

              <div className="bg-[#F8F8FA] p-4 rounded-xl border border-[#E4E5E9]">
                <h4 className="font-bold text-sm text-[#151A2B] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Commercial Approval
                </h4>
                <p className="text-xs text-[#737B8B]">
                  Delegated financial limits prevent unauthorized sales discounts below minimum gross margin.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/signup" className="btn-tertiary">
                <span>Generate Solar Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: PDF-Style Browser Frame */}
          <div className="lg:col-span-7">
            <div className="product-window border border-[#E4E5E9] rounded-2xl shadow-xl bg-white overflow-hidden">
              <div className="product-window__toolbar bg-[#FBFBFC] px-4 py-2.5 border-b border-[#E4E5E9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#714B67]" />
                  <span className="font-bold text-[#151A2B]">SunPower Solutions — Commercial Quotation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#737B8B]">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67]">
                    Illustrative Product Preview
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#151A2B] hidden sm:inline">QTN-2026-00042</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">APPROVED</span>
                </div>
              </div>

              {/* Proposal Document Interior */}
              <div className="p-6 bg-white space-y-4 text-xs font-sans">
                {/* Header Section */}
                <div className="flex items-start justify-between pb-4 border-b border-[#E4E5E9]">
                  <div>
                    <div className="text-base font-bold text-[#714B67]">SunPower Solutions Pvt Ltd</div>
                    <div className="text-[11px] text-[#737B8B] mt-0.5">GSTIN: 07AABCS1429B1Z8 | Delhi EPC Hub</div>
                    <div className="text-[11px] text-[#737B8B]">MNRE Approved Channel Partner</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-[#151A2B]">Quote # QTN-2026-00042</div>
                    <div className="text-[11px] text-[#737B8B]">Date: 22 Nov 2026</div>
                    <div className="text-[11px] text-[#737B8B]">Valid Until: 07 Dec 2026 (15 Days)</div>
                  </div>
                </div>

                {/* Customer Site */}
                <div className="bg-[#F8F8FA] p-3 rounded-lg border border-[#E4E5E9] grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#737B8B]">Client Details</span>
                    <div className="font-bold text-slate-900 mt-0.5">Sample Residential Rooftop (Client)</div>
                    <div className="text-[11px] text-slate-600">Sample Site, South Extension, New Delhi</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#737B8B]">System Specifications</span>
                    <div className="font-bold text-[#06C6AE] mt-0.5">5.4 kWp On-Grid Solar PV System</div>
                    <div className="text-[11px] text-slate-600">Tata Mono Perc 540W + Sungrow 5kW Inverter</div>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="border border-[#E4E5E9] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F4F6] text-[#714B67] font-semibold border-b border-[#E4E5E9]">
                      <tr>
                        <th className="p-2">Item Description</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E5E9] text-slate-700">
                      <tr>
                        <td className="p-2">540W Mono Perc Solar Modules (DCR Approved)</td>
                        <td className="p-2 text-center">10 Nos</td>
                        <td className="p-2 text-right">₹11,880</td>
                        <td className="p-2 text-right font-medium">₹1,18,800</td>
                      </tr>
                      <tr>
                        <td className="p-2">5kW 1-Phase Grid-Tied String Inverter (Dual MPPT)</td>
                        <td className="p-2 text-center">1 Set</td>
                        <td className="p-2 text-right">₹48,000</td>
                        <td className="p-2 text-right font-medium">₹48,000</td>
                      </tr>
                      <tr>
                        <td className="p-2">Hot-Dip Galvanized Module Mounting Structure</td>
                        <td className="p-2 text-center">1 Lot</td>
                        <td className="p-2 text-right">₹27,000</td>
                        <td className="p-2 text-right font-medium">₹27,000</td>
                      </tr>
                      <tr>
                        <td className="p-2">Balance of System (DC/AC DB, 4mm² Cables, Earthing)</td>
                        <td className="p-2 text-center">1 Lot</td>
                        <td className="p-2 text-right">₹24,500</td>
                        <td className="p-2 text-right font-medium">₹24,500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Commercial Breakdown & Taxes */}
                <div className="flex justify-end pt-1">
                  <div className="w-64 space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Direct Material Subtotal:</span>
                      <span className="font-medium">₹2,18,300</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistics, Labor & Statutory:</span>
                      <span className="font-medium">₹24,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Composite GST (13.8%):</span>
                      <span className="font-medium text-[#714B67]">₹33,506</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E4E5E9] font-bold text-sm text-[#151A2B]">
                      <span>Gross System Price:</span>
                      <span>₹2,76,306</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 text-[11px] font-semibold">
                      <span>PM Surya Ghar Subsidy:</span>
                      <span>- ₹78,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-[#017E84] pt-1">
                      <span>Net Cost to Customer:</span>
                      <span>₹1,98,306</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="product-window__caption px-4 py-2 bg-[#FBFBFC] text-[11px] text-[#737B8B] flex items-center justify-between">
                <span>Automated commercial quote generation with composite Indian GST & government subsidy tiers.</span>
                <span className="font-mono text-[10px] text-[#714B67] font-semibold">Live Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
