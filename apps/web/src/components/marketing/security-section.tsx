import React from 'react';
import {
  ShieldCheck,
  Lock,
  Layers,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

const trustCards = [
  {
    icon: Lock,
    title: 'Secure Authentication',
    desc: 'Argon2id password hashing, automated 5-attempt brute force lockouts, and cryptographically secure HttpOnly session tokens.',
    accent: '#714B67',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access Control',
    desc: 'Granular permissions registry with discrete roles (Solar Engineer, Field Technician, Sales Rep, Procurement Manager).',
    accent: '#06C6AE',
  },
  {
    icon: Layers,
    title: 'PostgreSQL Row-Level Security',
    desc: 'Database engine-level multi-tenant isolation enforcing tenant scoping on all tables with verified query boundary enforcement.',
    accent: '#FF747C',
  },
  {
    icon: FileCheck2,
    title: 'Traceable Audit Trail',
    desc: 'Centralized compliance audit logs recording all quotation approvals, customer signatures, order confirmations, and sequence generation.',
    accent: '#FFB32C',
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20 md:py-28 bg-[#F4F4F6] border-y border-[#E4E5E9]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase mb-3">
            ENTERPRISE SECURITY & COMPLIANCE
          </div>
          <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
            Your business data deserves a secure workspace.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475065] leading-relaxed">
            SunPowerOS uses centralized authentication and organization-aware database permissions to help keep commercial margins and customer data within authorized access boundaries.
          </p>
        </div>

        {/* 4 Trust Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustCards.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.title}
                className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${t.accent}15`, color: t.accent }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#151A2B] mb-2">{t.title}</h3>
                <p className="text-xs sm:text-sm text-[#737B8B] leading-relaxed">{t.desc}</p>

                <div className="mt-5 pt-3 border-t border-[#E4E5E9] flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Architecture</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
