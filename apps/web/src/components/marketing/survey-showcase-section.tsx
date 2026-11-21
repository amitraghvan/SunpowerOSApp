import React from 'react';
import Link from 'next/link';
import { AccentUnderline } from './accents';
import {
  Compass,
  Zap,
  Camera,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';

export function SurveyShowcaseSection() {
  return (
    <section id="survey" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Story */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase">
              TECHNICAL SITE AUDIT
            </div>

            <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
              Know the roof before{' '}
              <span className="relative inline-block text-[#FF747C]">
                designing the system.
                <AccentUnderline className="absolute -bottom-2 left-0 w-full h-3" color="#06C6AE" />
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#475065] leading-relaxed">
              Capture rooftop measurements, orientation azimuth, shading obstructions, and electrical panel details in a structured survey workflow—preventing costly engineering revisions later.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Rooftop Assessment</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Record RCC flat roof, tin-shed or tiled roof usable area, slope tilt angles, true South azimuth, and parapet shading.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#06C6AE] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Electrical Feasibility</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Log grid connection, 1-Phase / 3-Phase AC voltage, sanctioned load, main breaker amp rating, and earth resistance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#FFB32C] flex items-center justify-center shrink-0 mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#151A2B]">Field Photographic Audit</h4>
                  <p className="text-sm text-[#737B8B] mt-0.5">
                    Field technicians upload roof panorama, meter box, main switchboard, and cable routing directly via mobile to MinIO object storage.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/signup" className="btn-tertiary">
                <span>See Survey Features</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Product Window Preview */}
          <div className="lg:col-span-7">
            <div className="product-window border border-[#E4E5E9] rounded-2xl shadow-xl bg-white overflow-hidden">
              <div className="product-window__toolbar bg-[#FBFBFC] px-4 py-2.5 border-b border-[#E4E5E9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="ml-2 font-semibold text-[#151A2B]">Site Survey Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67]">
                    Illustrative Product Preview
                  </span>
                  <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    Status: APPROVED FOR DESIGN
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 bg-white text-xs">
                {/* Roof Metrics Cockpit */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">Roof Type</span>
                    <div className="font-bold text-sm text-[#151A2B] mt-1">RCC Flat Concrete</div>
                  </div>
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">Total Area</span>
                    <div className="font-bold text-sm text-[#151A2B] mt-1">1,250 sq.ft</div>
                  </div>
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">Usable Solar Area</span>
                    <div className="font-bold text-sm text-[#06C6AE] mt-1">850 sq.ft (68%)</div>
                  </div>
                  <div className="bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
                    <span className="text-[10px] text-[#737B8B] uppercase font-bold">Azimuth & Tilt</span>
                    <div className="font-bold text-sm text-[#714B67] mt-1">180° South / 22°</div>
                  </div>
                </div>

                {/* Electrical Panel Specs */}
                <div className="bg-[#F8F8FA] p-3.5 rounded-xl border border-[#E4E5E9]">
                  <div className="font-bold text-xs text-[#151A2B] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Electrical Distribution Panel</span>
                    <span className="text-emerald-700 font-medium">Grid Feasible</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#475065]">
                    <div>Grid Type: <strong>3-Phase, 415V</strong></div>
                    <div>Sanctioned: <strong>10.0 kW</strong></div>
                    <div>Main Breaker: <strong>32A MCB</strong></div>
                  </div>
                </div>

                {/* Photo Evidence Gallery */}
                <div>
                  <div className="font-bold text-xs text-[#151A2B] mb-2 flex items-center justify-between">
                    <span>Field Photographic Evidence (MinIO Storage)</span>
                    <span className="text-[11px] text-[#737B8B]">4 Images Geo-tagged</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-4/3 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-2 text-center text-[10px] text-[#737B8B]">
                      <Camera className="w-4 h-4 mb-1 text-[#714B67]" />
                      <span>Roof Panorama</span>
                    </div>
                    <div className="aspect-4/3 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-2 text-center text-[10px] text-[#737B8B]">
                      <Zap className="w-4 h-4 mb-1 text-amber-500" />
                      <span>Meter Box</span>
                    </div>
                    <div className="aspect-4/3 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-2 text-center text-[10px] text-[#737B8B]">
                      <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600" />
                      <span>Earth Pit Point</span>
                    </div>
                    <div className="aspect-4/3 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-2 text-center text-[10px] text-[#737B8B]">
                      <Compass className="w-4 h-4 mb-1 text-[#06C6AE]" />
                      <span>South Horizon</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="product-window__caption px-4 py-2 bg-[#FBFBFC] text-[11px] text-[#737B8B] flex items-center justify-between">
                <span>Field technician site survey connected to engineering calculation engine.</span>
                <span className="font-mono text-[10px] text-[#714B67] font-semibold">Live Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
