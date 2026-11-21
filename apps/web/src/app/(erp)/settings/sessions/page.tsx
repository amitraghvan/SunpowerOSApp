'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Laptop,
  Smartphone,
  Globe,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function SessionsManagementPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getSessions();
      setSessions(data || []);
    } catch (err: any) {
      console.warn('Error loading sessions:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevokeSession = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this session? The device will be logged out immediately.')) return;
    try {
      await ApiClient.revokeSession(id);
      loadSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!confirm('This will log out all other active computers and mobile devices. Continue?')) return;
    try {
      await ApiClient.revokeOtherSessions();
      loadSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke sessions');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
            <Link href="/settings" className="hover:text-[#714B67]">Settings</Link>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Active Sessions</span>
          </div>
          <h1 className="text-lg font-bold text-[#212529] mt-0.5">Device Security & Login Sessions</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSessions}
            className="odoo-btn-secondary px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleRevokeAllOther}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sign Out All Other Devices</span>
          </button>
        </div>
      </div>

      {/* Security Architecture Info Banner */}
      <div className="bg-white rounded border border-[#DEE2E6] p-4 text-xs text-[#495057] shadow-sm flex items-start gap-3">
        <div className="p-2 rounded bg-[#714B67]/10 text-[#714B67] shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-[#212529]">Cryptographic Session Tokens & Invalidation</h2>
          <p className="mt-1 leading-relaxed text-[#6C757D]">
            SolarOS generates 32-byte cryptographically secure random session tokens. The database stores only the SHA-256 hash
            of each token, eliminating plaintext token exposure in storage backups. Revoking a session immediately terminates
            API authentication.
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded border border-[#DEE2E6] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#6C757D] font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Device / User-Agent</th>
              <th className="px-4 py-2.5">IP Address</th>
              <th className="px-4 py-2.5">Established</th>
              <th className="px-4 py-2.5">Expires</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {sessions.length > 0 ? (
              sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-slate-100 text-slate-700">
                        {s.userAgent?.includes('Mobile') ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div className="max-w-xs truncate font-medium text-[#212529]">
                        {s.userAgent || 'Web Browser (Unknown Agent)'}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-[#495057]">
                    {s.ipAddress || '127.0.0.1'}
                  </td>

                  <td className="px-4 py-3 text-[#6C757D]">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-[#6C757D]">
                    {new Date(s.expiresAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    {s.isCurrent ? (
                      <span className="odoo-badge bg-emerald-100 text-emerald-800">
                        This Device
                      </span>
                    ) : (
                      <span className="odoo-badge bg-slate-100 text-slate-700">
                        Active Remote
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6C757D]">
                  {isLoading ? 'Loading active login sessions...' : 'No active sessions recorded.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
