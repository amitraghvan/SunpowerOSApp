import React from 'react';
import Link from 'next/link';
import { AccentCircle } from './accents';
import {
  FileCheck,
  CheckCircle2,
  CreditCard,
  ShoppingCart,
  Send,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

const stages = [
  {
    step: '01',
    title: 'Approved Quotation',
    desc: 'Frozen bill of materials and margin approval.',
    icon: FileCheck,
    color: '#714B67',
  },
  {
    step: '02',
    title: 'Customer Acceptance',
    desc: 'Digital signature, physical sign-off, or OTP.',
    icon: CheckCircle2,
    color: '#06C6AE',
  },
  {
    step: '03',
    title: 'EPC Contract Agreement',
    desc: 'Configurable milestone schedule and equipment warranties.',
    icon: Shield,
    color: '#FF747C',
  },
  {
    step: '04',
    title: '4-Gate Prerequisite Check',
    desc: 'Design, BOM, signed contract, advance cleared.',
    icon: Layers,
    color: '#FFB32C',
  },
  {
    step: '05',
    title: 'Confirmed Sales Order',
    desc: 'SO-2026-XXXXXX order creation.',
    icon: ShoppingCart,
    color: '#017E84',
  },
  {
    step: '06',
    title: 'Project Initiation Handoff',
    desc: 'Downstream procurement and installation handover.',
    icon: Send,
    color: '#714B67',
  },
];

export function ContractsShowcaseSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F4F4F6] border-y border-[#E4E5E9]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase mb-3">
            LEGAL EPC & SALES ORDERS
          </div>
          <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
            Move from customer acceptance to a{' '}
            <span className="relative inline-block">
              confirmed order.
              <AccentCircle color="#FFB32C" />
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475065] leading-relaxed">
            Keep approved quotations, configurable milestone schedules, warranties, and sales order prerequisite gates connected through one controlled commercial workflow.
          </p>
        </div>

        {/* Commercial Order Journey Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F4F4F6] text-[#737B8B]">
                    Stage {st.step}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${st.color}15`, color: st.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-bold text-base text-[#151A2B] mb-1.5 group-hover:text-[#714B67] transition-colors">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#737B8B] leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Prerequisite 4-Gate Audit Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-bold text-base text-[#151A2B] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#017E84]" /> Strict 4-Gate Sales Order Enforcement
            </h4>
            <p className="text-xs sm:text-sm text-[#737B8B]">
              Sales orders cannot be confirmed until Approved Design, Approved BOM, Signed Contract, and Cleared 20% Advance are verified.
            </p>
          </div>
          <Link href="/signup" className="btn-primary shrink-0 !py-2.5 !px-5 text-sm">
            <span>Explore Order Workflow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
