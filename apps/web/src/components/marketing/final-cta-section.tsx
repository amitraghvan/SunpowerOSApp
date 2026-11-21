import React from 'react';
import Link from 'next/link';
import { AccentUnderline, SketchArrow, CoralSpark } from './accents';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="py-24 md:py-36 bg-white relative overflow-hidden text-center">
      {/* Decorative ambient rays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#F1EAF0]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1080px] mx-auto px-5 lg:px-8">
        {/* Top Mini Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-bold tracking-wide uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#FFB32C]" />
          <span>START FREE TODAY</span>
        </div>

        {/* Master Handwritten Headline */}
        <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.02] max-w-3xl mx-auto">
          Build a smarter solar business.{' '}
          <span className="relative inline-block text-[#06C6AE]">
            Start with SunPowerOS.
            <AccentUnderline className="absolute -bottom-2.5 left-0 w-full h-4" color="#FF747C" />
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-7 text-lg sm:text-xl text-[#475065] max-w-xl mx-auto leading-relaxed">
          Bring your solar leads, roof surveys, engineering designs, and commercial quotations together in one connected workspace.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary w-full sm:w-auto text-base !py-3 !px-8">
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="#features" className="btn-secondary w-full sm:w-auto text-base !py-3 !px-8">
            <span>Explore Features</span>
          </Link>
        </div>

        {/* Supporting Microcopy */}
        <div className="mt-4 text-xs text-[#737B8B] font-medium">
          Create your organization in minutes • Indian Rupee (INR) & Asia/Kolkata timezone standard
        </div>
      </div>
    </section>
  );
}
