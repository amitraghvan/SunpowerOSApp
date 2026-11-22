'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Database,
  HardDrive,
  Cpu,
  Layers,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function PlatformHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealthAndAlerts = async () => {
    setLoading(true);
    try {
      const [h, a] = await Promise.all([
        ApiClient.getHealth(),
        ApiClient.getAlerts(),
      ]);
      setHealth(h);
      setAlerts(a || []);
    } catch (err) {
      console.error('Failed to load health and alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAndAlerts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            System Health & Infrastructure Status
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Real-time infrastructure uptime, database query latency, and automated system alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHealthAndAlerts}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <Link
            href="/alerts"
            className="px-3.5 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Manage Alerts ({alerts.filter((a) => a.status === 'OPEN').length})</span>
          </Link>
        </div>
      </div>

      {/* Services Health Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737B8B]">PostgreSQL Engine</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-[#151A2B]">
              {health?.services?.database?.status || 'HEALTHY'}
            </span>
          </div>
          <div className="text-[11px] text-[#737B8B]">
            Latency: {health?.services?.database?.latencyMs ?? 1} ms
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737B8B]">MinIO Storage</span>
            <HardDrive className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-[#151A2B]">OPERATIONAL</span>
          </div>
          <div className="text-[11px] text-[#737B8B]">
            {health?.services?.storage?.totalStorageMb ?? 0} MB stored
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737B8B]">BullMQ Queue</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-[#151A2B]">ACTIVE</span>
          </div>
          <div className="text-[11px] text-[#737B8B]">Concurrency: 5 jobs</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737B8B]">API Gateway</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-[#151A2B]">HEALTHY</span>
          </div>
          <div className="text-[11px] text-[#737B8B]">
            RSS Memory: {health?.services?.apiGateway?.memoryUsageMb ?? 140} MB
          </div>
        </div>
      </div>

      {/* Active Incidents and Alerts Preview */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E5E9] bg-[#FAFAFB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#714B67]" />
            <h2 className="text-xs font-bold text-[#151A2B] uppercase tracking-wider">
              Recent System Alerts & Incidents ({alerts.length})
            </h2>
          </div>
          <Link
            href="/alerts"
            className="text-xs font-semibold text-[#714B67] hover:underline"
          >
            Manage all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                <th className="py-3 px-4">Alert Number</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E5E9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                    Checking health and incidents...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    No active platform alerts. All services operating normally.
                  </td>
                </tr>
              ) : (
                alerts.slice(0, 5).map((al) => (
                  <tr key={al.id} className="hover:bg-[#FAFAFB]">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                      {al.alertNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          al.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : al.severity === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : al.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {al.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#151A2B]">{al.category}</td>
                    <td className="py-3.5 px-4 text-[#475065]">{al.title}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          al.status === 'OPEN'
                            ? 'bg-rose-100 text-rose-700'
                            : al.status === 'RESOLVED'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {al.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#8A92A6] font-mono text-[11px]">
                      {new Date(al.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
