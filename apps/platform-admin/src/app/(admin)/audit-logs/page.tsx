'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  User,
  Filter,
  Loader2,
  FileText,
} from 'lucide-react';

export default function PlatformAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getAuditLogs({
        page,
        limit: 25,
        action: actionFilter || undefined,
      });
      setLogs(res?.items || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            Platform Security Audit Log
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Immutable tracking of super administrator actions, tenant lifecycle changes and access controls
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E5E9] bg-[#FAFAFB] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#714B67]" />
            <span className="text-xs font-bold text-[#151A2B] uppercase tracking-wider">
              Recorded Events ({total})
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              placeholder="Filter by action code..."
              className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67] w-full sm:w-60"
            />
            <button
              onClick={() => {
                setPage(1);
                fetchLogs();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F1EAF0] text-[#714B67] font-semibold text-xs whitespace-nowrap"
            >
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E5E9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                    Loading audit events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                    No audit events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#FAFAFB]">
                    <td className="py-3 px-4 text-[#737B8B] font-mono text-[11px] whitespace-nowrap">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#F1EAF0] text-[#714B67] font-mono font-bold text-[10px]">
                        {ev.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#151A2B] font-medium">
                      {ev.actorEmail || ev.actorId}
                    </td>
                    <td className="py-3 px-4 text-[#737B8B] font-mono text-[11px]">
                      {ev.targetType}:{ev.targetId ? ev.targetId.slice(0, 8) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[#475065]">
                      {ev.reason || (ev.metadata ? JSON.stringify(ev.metadata) : '—')}
                    </td>
                    <td className="py-3 px-4 text-[#8A92A6] font-mono text-[11px]">
                      {ev.ipAddress || 'Internal'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="py-3 px-4 border-t border-[#E4E5E9] bg-[#FAFAFB] flex items-center justify-between text-xs text-[#737B8B]">
          <span>
            Showing {logs.length} of {total} audit records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-lg border border-[#E4E5E9] bg-white text-xs font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-xs">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={logs.length < 25}
              className="px-2.5 py-1 rounded-lg border border-[#E4E5E9] bg-white text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
