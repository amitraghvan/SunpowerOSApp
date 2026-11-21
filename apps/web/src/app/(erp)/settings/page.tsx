'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Key,
  Building2,
  Lock,
  History,
  CheckCircle,
  FileText,
  ChevronRight,
  Sun,
  Database,
  Cpu,
} from 'lucide-react';

export default function SettingsHubPage() {
  const sections = [
    {
      title: 'Users & Team Access',
      description: 'Manage employee accounts, assign roles, and invite new technicians and project engineers.',
      href: '/settings/users',
      icon: Users,
      badge: 'IAM Core',
      color: '#714B67',
    },
    {
      title: 'Access Rights & Roles (RBAC)',
      description: 'Configure role templates, access rights matrix, and scopes (OWN, ASSIGNED, BRANCH, ORGANIZATION).',
      href: '/settings/roles',
      icon: Shield,
      badge: 'RBAC Engine',
      color: '#017E84',
    },
    {
      title: 'Permissions Registry',
      description: 'Inspect fine-grained system permissions across CRM, Surveys, Catalog, and Phase 2 Engineering.',
      href: '/settings/permissions',
      icon: Key,
      badge: '42 Operations',
      color: '#E26D5C',
    },
    {
      title: 'Organizations & Operating Branches',
      description: 'Multi-tenant organization settings, branch locations, and pending employee invitations.',
      href: '/settings/organizations',
      icon: Building2,
      badge: 'Multi-Tenant',
      color: '#38B000',
    },
    {
      title: 'Active Sessions & Device Security',
      description: 'Monitor active user login sessions, IP addresses, device user-agents, and force session revocation.',
      href: '/settings/sessions',
      icon: Lock,
      badge: 'Session Security',
      color: '#219EBC',
    },
    {
      title: 'Security & Encryption Dashboard',
      description: 'Argon2id configuration, PostgreSQL RLS enforcement status, account lockouts, and 2FA health.',
      href: '/settings/security',
      icon: Cpu,
      badge: 'Zero-Trust',
      color: '#FFB703',
    },
    {
      title: 'Audit Trail & Compliance Logs',
      description: 'Enterprise tamper-resistant audit log capturing user authentication, entity mutations, and exports.',
      href: '/settings/audit-logs',
      icon: History,
      badge: 'Compliance',
      color: '#6C757D',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded border border-[#DEE2E6] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">Enterprise Administration</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Phase 0.5 IAM Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#212529] mt-1">Settings & Identity Management</h1>
          <p className="text-xs text-[#6C757D] mt-1">
            Centralized authentication, role-based authorization, multi-tenant isolation, and compliance security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-[#212529]">PostgreSQL RLS</div>
            <div className="text-[11px] text-emerald-600 font-medium">100% Tables Protected</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-200">
            ✓
          </div>
        </div>
      </div>

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className="bg-white rounded border border-[#DEE2E6] p-5 hover:shadow-md hover:border-[#714B67] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: s.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#6C757D] px-2 py-0.5 rounded bg-[#F6F6F6] border border-[#DEE2E6]">
                    {s.badge}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-[#212529] group-hover:text-[#714B67] transition-colors">
                  {s.title}
                </h2>
                <p className="text-xs text-[#6C757D] mt-1.5 leading-relaxed">{s.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F6F6F6] flex items-center justify-between text-xs text-[#017E84] font-medium">
                <span>Configure settings</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
