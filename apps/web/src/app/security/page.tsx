import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/marketing-navbar';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import {
  ShieldCheck,
  Lock,
  Layers,
  FileCheck2,
  Key,
  Server,
  Database,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trust & Security Architecture | SunPowerOS',
  description:
    'Technical verification of SunPowerOS security: PostgreSQL Row-Level Security, Argon2id encryption, RBAC permissions, and immutable audit logs.',
};

const securityPillars = [
  {
    icon: Database,
    title: 'PostgreSQL Row-Level Security (RLS)',
    description:
      'Multi-tenant data isolation is enforced at the database engine level via PostgreSQL Row-Level Security policies. Every query automatically inherits tenant and branch filtering, preventing cross-tenant data exposure.',
    points: [
      'Engine-level RLS policies on all operational tables',
      'Contextual tenant_id session parameters on pooled database connections',
      'Zero cross-organization leakage even under developer query execution',
    ],
  },
  {
    icon: Lock,
    title: 'Modern Cryptographic Authentication',
    description:
      'User credentials are encrypted using Argon2id password hashing with custom work factors. Sessions utilize cryptographically signed, HttpOnly, SameSite cookies with strict expiration controls.',
    points: [
      'Argon2id password hashing algorithms',
      'Automated rate-limiting and brute-force lockout after 5 consecutive failed attempts',
      'HttpOnly session tokens inaccessible to browser scripts',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Granular Role-Based Access Control (RBAC)',
    description:
      'Permissions are managed through a centralized permissions registry. Every API endpoint and client view verifies explicit user capability flags before permitting view, create, edit, or approval actions.',
    points: [
      'Domain-based permissions (Leads, Surveys, BOM, Quotations, POs, Approvals)',
      'Pre-configured enterprise roles: Solar Engineer, Sales Executive, Field Auditor, Procurement Lead',
      'Custom organizational role composition',
    ],
  },
  {
    icon: FileCheck2,
    title: 'Comprehensive Compliance Audit Logging',
    description:
      'Sensitive business operations are tracked in an immutable audit ledger, recording the executing user, timestamp, target entity, IP address, and state transitions.',
    points: [
      'Audit records for quotation price changes, discount approvals, and contract signatures',
      'Sequential, tamper-evident document numbering sequences (DES-, QTN-, CNT-, SO-, PO-)',
      'Traceable inventory serial registration for inward inspections',
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="marketing-root min-h-screen bg-white text-[#202536] flex flex-col">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="py-20 bg-[#F4F4F6] border-b border-[#E4E5E9]">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-bold tracking-wide uppercase mb-4">
              <span>Security & Data Integrity</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#151A2B] leading-tight max-w-4xl mx-auto">
              Enterprise security built into the database layer.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#475065] max-w-2xl mx-auto leading-relaxed">
              We design SunPowerOS with defense-in-depth principles so your pricing formulas, customer records, and commercial contracts remain strictly isolated.
            </p>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="py-20 md:py-28">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="bg-white rounded-3xl p-8 border border-[#E4E5E9] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center mb-6">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold text-[#151A2B] mb-3">{pillar.title}</h2>
                      <p className="text-sm text-[#475065] leading-relaxed mb-6">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E4E5E9]">
                      <h3 className="text-xs font-bold text-[#714B67] uppercase tracking-wider mb-3">
                        Technical Safeguards:
                      </h3>
                      <ul className="space-y-2">
                        {pillar.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-2.5 text-xs text-[#374151]">
                            <CheckCircle2 className="w-4 h-4 text-[#017E84] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Verified Notice */}
        <section className="py-12 bg-[#F8F8FA] border-y border-[#E4E5E9]">
          <div className="max-w-[1080px] mx-auto px-5 lg:px-8 text-center text-xs text-[#737B8B]">
            <p>
              Security specifications reflect actual codebase architecture: PostgreSQL 14 Row-Level Security, NestJS guard authentication, Argon2id crypto implementation, and Prisma ORM transactional boundaries.
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
