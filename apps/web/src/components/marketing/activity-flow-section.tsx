import React from 'react';
import { AccentCircle } from './accents';
import {
  PhoneCall,
  Calendar,
  FileCheck2,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const activities = [
  {
    step: 'Stage 1',
    tag: 'Enquiry Contact',
    title: 'Initial Consultation',
    desc: 'Record customer interaction, rooftop area, monthly energy consumption, and sanctioned load.',
    accent: '#714B67',
    icon: PhoneCall,
  },
  {
    step: 'Stage 2',
    tag: 'Field Audit',
    title: 'Site Survey Visit',
    desc: 'Technician schedules visit, maps azimuth tilt, documents shading, and uploads photo evidence.',
    accent: '#06C6AE',
    icon: Calendar,
  },
  {
    step: 'Stage 3',
    tag: 'Engineering Proposal',
    title: 'Quotation Review',
    desc: 'Prepare itemized proposal using verified BOM sizing, configured tax rules, and subsidy slabs.',
    accent: '#FF747C',
    icon: FileCheck2,
  },
  {
    step: 'Stage 4',
    tag: 'Execution Handoff',
    title: 'Contract Sign-off',
    desc: 'Capture customer digital acceptance, milestone terms, advance clearance, and handoff to operations.',
    accent: '#FFB32C',
    icon: Clock,
  },
];

export function ActivityFlowSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F4F4F6] border-y border-[#E4E5E9]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase mb-3">
            OPPORTUNITY FOLLOW-UP
          </div>
          <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
            Never miss the{' '}
            <span className="relative inline-block">
              next conversation.
              <AccentCircle className="text-[#FF747C]" color="#FF747C" />
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475065] leading-relaxed">
            Calls, site visits, and proposal follow-ups stay linked directly to their solar opportunity—so your sales team never loses momentum.
          </p>
        </div>

        {/* Hand-Drawn Activity Flowchart (Composition D) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {activities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex flex-col">
                <div className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
                        style={{ backgroundColor: `${item.accent}15`, color: item.accent }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F4F4F6] text-[#737B8B]">
                        {item.step}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-[#017E84] block mb-1">
                      {item.tag}
                    </span>
                    <h3 className="font-bold text-base text-[#151A2B] mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#737B8B] leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#E4E5E9] flex items-center justify-between text-xs font-semibold text-[#714B67]">
                    <span className="flex items-center gap-1.5 text-[#017E84]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tracked in CRM
                    </span>
                    <span className="text-[#737B8B] font-mono">Step {index + 1} of 4</span>
                  </div>
                </div>

                {/* Arrow connector between stages on desktop */}
                {index < activities.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-[#E4E5E9] items-center justify-center text-[#714B67] shadow-xs">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
