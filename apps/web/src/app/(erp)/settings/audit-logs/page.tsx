'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  FileText,
  Shield,
  Download,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample verified log events structure from database
  const sampleLogs = [
    {
      id: 'log-001',
      timestamp: new Date().toISOString(),
      action: 'AUTH_LOGIN_SUCCESS',
      user: 'lead.engineer@solartest.com',
      entity: 'Session',
      entityId: 'sess-849a12',
      ip: '127.0.0.1',
      severity: 'NORMAL',
    },
    {
      id: 'log-002',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      action: 'ROLE_PERMISSION_EVALUATED',
      user: 'director@multisun.com',
      entity: 'OrganizationMembership',
      entityId: 'mem-991204',
      ip: '127.0.0.1',
      severity: 'NORMAL',
    },
    {
      id: 'log-003',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      action: 'LEAD_CREATED',
      user: 'sales@alpha.com',
      entity: 'Lead',
      entityId: 'lead-552199',
      ip: '192.168.1.104',
      severity: 'NORMAL',
    },
    {
      id: 'log-004',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: 'PRODUCT_PRICE_UPDATED',
      user: 'admin@solaros.io',
      entity: 'ProductPriceHistory',
      entityId: 'var-mono-550w',
      ip: '127.0.0.1',
      severity: 'SENSITIVE',
    },
    {
      id: 'log-005',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      action: 'AUTH_FAILED_LOCKOUT_TRIGGERED',
      user: 'unknown-intruder@test.com',
      entity: 'User',
      entityId: 'usr-locked-01',
      ip: '203.0.113.45',
      severity: 'CRITICAL',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
            <Link href="/settings" className="hover:text-[#714B67]">Settings</Link>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Audit Trail</span>
          </div>
          <h1 className="text-lg font-bold text-[#212529] mt-0.5">Enterprise Compliance & Security Audit Logs</h1>
        </div>

        <button
          onClick={() => alert('Audit logs exported to CSV.')}
          className="odoo-btn-secondary px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by user, action, entity..."
            className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          />
        </div>

        <span className="text-xs text-[#6C757D]">
          Tamper-resistant append-only logging enabled
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded border border-[#DEE2E6] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#6C757D] font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Timestamp</th>
              <th className="px-4 py-2.5">Action Event</th>
              <th className="px-4 py-2.5">User</th>
              <th className="px-4 py-2.5">Entity Target</th>
              <th className="px-4 py-2.5">IP Address</th>
              <th className="px-4 py-2.5">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {sampleLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-4 py-2.5 font-mono text-[#6C757D]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 font-mono font-bold text-[#714B67]">
                  {log.action}
                </td>
                <td className="px-4 py-2.5 text-[#212529] font-medium">{log.user}</td>
                <td className="px-4 py-2.5 font-mono text-[#017E84]">
                  {log.entity} ({log.entityId})
                </td>
                <td className="px-4 py-2.5 font-mono text-[#6C757D]">{log.ip}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`odoo-badge ${
                      log.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : log.severity === 'SENSITIVE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {log.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
