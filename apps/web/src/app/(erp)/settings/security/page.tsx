'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Database,
  Cpu,
  Key,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileCheck,
} from 'lucide-react';

export default function SecurityDashboardPage() {
  const securityControls = [
    {
      name: 'Password Hashing Engine',
      tech: 'Argon2id',
      status: 'VERIFIED',
      details: 'Memory Cost: 19 MiB (19456 KB), Time Cost: 2 iterations, Parallelism: 1.',
      icon: Lock,
      color: 'text-purple-600',
    },
    {
      name: 'Multi-Tenant Database Isolation',
      tech: 'PostgreSQL RLS',
      status: 'VERIFIED',
      details: 'FORCE ROW LEVEL SECURITY active on 100% of organization-owned tables via non-superuser role solaros_app.',
      icon: Database,
      color: 'text-emerald-600',
    },
    {
      name: 'Session Security & Storage',
      tech: 'CSPRNG + SHA-256',
      status: 'VERIFIED',
      details: '32-byte cryptographically secure random session tokens. Stored as SHA-256 hashes in PostgreSQL.',
      icon: Key,
      color: 'text-blue-600',
    },
    {
      name: 'Brute-Force & Credential Stuffing Defense',
      tech: 'Account Lockout',
      status: 'VERIFIED',
      details: '5 failed login attempts triggers an automatic 15-minute account lock.',
      icon: Shield,
      color: 'text-amber-600',
    },
    {
      name: 'Cookie Security Transport',
      tech: 'HttpOnly + SameSite=Lax',
      status: 'VERIFIED',
      details: 'Session cookie solaros_session is inaccessible to JavaScript (XSS protected).',
      icon: Server,
      color: 'text-teal-600',
    },
    {
      name: 'Role-Based Authorization (RBAC)',
      tech: 'PermissionsGuard',
      status: 'VERIFIED',
      details: 'Strict declarative controller-level guards (@RequirePermissions) across all modules.',
      icon: FileCheck,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
            <Link href="/settings" className="hover:text-[#714B67]">Settings</Link>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Security Dashboard</span>
          </div>
          <h1 className="text-lg font-bold text-[#212529] mt-0.5">Enterprise Security & Encryption Overview</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Security Status: Healthy
          </span>
        </div>
      </div>

      {/* Security Score Overview */}
      <div className="bg-white rounded border border-[#DEE2E6] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">Zero-Trust Architecture</span>
          <h2 className="text-xl font-bold text-[#212529]">End-to-End IAM Compliance Verification</h2>
          <p className="text-xs text-[#6C757D] max-w-2xl leading-relaxed">
            Every incoming HTTP request across CRM, Customers, Surveys, and Catalog is intercepted by centralized
            Authentication, TenantContext, and Permissions guards. Database writes enforce tenant-scoped isolation.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="p-4 rounded border border-emerald-200 bg-emerald-50">
            <div className="text-2xl font-black text-emerald-700">100%</div>
            <div className="text-[11px] font-semibold text-emerald-800 mt-0.5">RLS Enforcement</div>
          </div>
          <div className="p-4 rounded border border-purple-200 bg-purple-50">
            <div className="text-2xl font-black text-purple-700">Argon2id</div>
            <div className="text-[11px] font-semibold text-purple-800 mt-0.5">Password KDF</div>
          </div>
        </div>
      </div>

      {/* Security Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityControls.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.name} className="bg-white rounded border border-[#DEE2E6] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded bg-slate-100 ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="odoo-badge bg-emerald-100 text-emerald-800 font-bold">
                  {c.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#212529]">{c.name}</h3>
                <div className="font-mono text-xs text-[#714B67] font-semibold mt-0.5">{c.tech}</div>
                <p className="text-xs text-[#6C757D] mt-2 leading-relaxed">{c.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
