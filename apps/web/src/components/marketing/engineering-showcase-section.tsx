import React from 'react';
import Link from 'next/link';
import { AccentUnderline } from './accents';
import {
  Sun,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Percent,
  Check
} from 'lucide-react';

export function EngineeringShowcaseSection() {
  return (
    <section id="engineering" className="py-20 md:py-28 bg-[#F4F4F6] border-y border-[#E4E5E9]">
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
                  <span className="ml-2 font-semibold text-[#151A2B]">Solar Technical Design & Sizing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67]">
                    Illustrative Product Preview
                  </span>
                  <div className="text-[11px] text-[#714B67] font-semibold bg-[#F1EAF0] px-2 py-0.5 rounded-full hidden sm:inline-block">
                    Design: DES-2026-00019 (v1)
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Physical Calculation KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">DC Capacity</span>
                    <div className="font-bold text-sm text-[#151A2B] mt-1">5.40 kWp</div>
                    <span className="text-[10px] text-slate-500">10 x 540W Mono</span>
                  </div>
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">Inverter Rating</span>
                    <div className="font-bold text-sm text-[#151A2B] mt-1">5.0 kW AC</div>
                    <span className="text-[10px] text-slate-500">1-Phase Grid-Tie</span>
                  </div>
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">DC/AC Sizing Ratio</span>
                    <div className="font-bold text-sm text-emerald-700 mt-1">1.08 (Optimal)</div>
                    <span className="text-[10px] text-emerald-600">Standard 1.05 - 1.25</span>
                  </div>
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">Annual Energy</span>
                    <div className="font-bold text-sm text-[#714B67] mt-1">7,884 kWh</div>
                    <span className="text-[10px] text-slate-500">6.46 t CO₂ saved</span>
                  </div>
                </div>

                {/* Compatibility Validation Matrix */}
                <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-200">
                  <div className="font-bold text-xs text-emerald-900 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      5-Point Inverter Electrical Compatibility Check
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      VERIFIED PASS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-emerald-950">
                    <div>Voc @ -10°C: <strong>495V &lt; 550V Max</strong> ✓</div>
                    <div>Vmp @ 65°C: <strong>362V in MPPT window</strong> ✓</div>
                    <div>Isc String: <strong>13.8A &lt; 16.0A MPPT</strong> ✓</div>
                  </div>
                </div>

                {/* Automated BOM Categories */}
                <div>
                  <div className="font-bold text-xs text-[#151A2B] mb-2 flex items-center justify-between">
                    <span>Automated Bill of Materials (6 Topology Groups)</span>
                    <span className="text-xs text-[#017E84] font-semibold">BOM-2026-00019</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E5E9]">
                      <span className="font-medium text-slate-800">1. Solar Generation: 10x Tata Power 540W Mono Perc</span>
                      <span className="font-mono text-[#714B67] font-semibold">₹1,18,800</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E5E9]">
                      <span className="font-medium text-slate-800">2. Power Conversion: 1x Sungrow 5kW Grid-Tie Inverter</span>
                      <span className="font-mono text-[#714B67] font-semibold">₹48,000</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E5E9]">
                      <span className="font-medium text-slate-800">3. Mounting Structure: HDG Elevated Structure (1.5m clearance)</span>
                      <span className="font-mono text-[#714B67] font-semibold">₹27,000</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E5E9]">
                      <span className="font-medium text-slate-800">4. Electrical BOS: 4mm² Solar DC Cable, AJB/ACDB, Earthing Pits</span>
                      <span className="font-mono text-[#714B67] font-semibold">₹24,500</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="product-window__caption px-4 py-2 bg-[#FBFBFC] text-[11px] text-[#737B8B] flex items-center justify-between">
                <span>Physics-based engineering validation with automated 6-topology BOM generation.</span>
                <span className="font-mono text-[10px] text-[#714B67] font-semibold">Live Preview</span>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Story */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase">
              ENGINEERING & BOM CALCULATION
            </div>

            <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
              From site measurements to a{' '}
              <span className="relative inline-block text-[#714B67]">
                structured solar design.
                <AccentUnderline className="absolute -bottom-2 left-0 w-full h-3" color="#FFB32C" />
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#475065] leading-relaxed">
              Connect approved survey inputs directly with real product specifications, thermal string calculations, inverter MPPT limits, and automated material bill generation.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center shrink-0 mt-0.5">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Configure Supported Systems</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Select On-Grid, Off-Grid with battery storage, or Hybrid architectures based on customer sanctioned load and roof area.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#06C6AE] flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Electrical Physics Validation</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Adheres to IEC 62548 & IS 16221 standards: checks temperature-adjusted string bounds (Voc,cold and Vmp,hot).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#FFB32C] flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Automated Traceable BOM</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Instant compilation into 6 standard topology groups with frozen unit cost snapshots and realistic wastage allowances.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/signup" className="btn-primary !py-2.5 !px-6">
                <span>Try Engineering Tools</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
