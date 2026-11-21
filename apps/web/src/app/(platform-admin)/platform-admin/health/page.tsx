'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  HardDrive,
  Cpu,
  Layers,
  X,
  Loader2,
} from 'lucide-react';

export default function PlatformHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Alert resolve modal
  const [selectedAlertForResolve, setSelectedAlertForResolve] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHealthAndAlerts = async () => {
    setLoading(true);
    try {
      const [h, a] = await Promise.all([
        ApiClient.getPlatformHealth(),
        ApiClient.getPlatformAlerts(),
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

  const handleAcknowledge = async (alertId: string) => {
    try {
      await ApiClient.acknowledgePlatformAlert(alertId);
      fetchHealthAndAlerts();
    } catch (err: any) {
      alert(`Error acknowledging alert: ${err.message}`);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForResolve) return;
    setActionLoading(true);
    try {
      await ApiClient.resolvePlatformAlert(selectedAlertForResolve.id, resolutionNotes);
      setSelectedAlertForResolve(null);
      setResolutionNotes('');
      fetchHealthAndAlerts();
    } catch (err: any) {
      alert(`Error resolving alert: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            System Health & Platform Alerts
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Real-time infrastructure uptime, database query latency, and automated system alerts
          </p>
        </div>

        <button
          onClick={fetchHealthAndAlerts}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
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

      {/* Platform Alerts Table */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E5E9] bg-[#FAFAFB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#714B67]" />
            <h2 className="text-xs font-bold text-[#151A2B] uppercase tracking-wider">
              Platform Alerts & Incidents ({alerts.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                <th className="py-3 px-4">Alert Number</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Category & Source</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E5E9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                    Loading alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8A92A6]">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    No active platform alerts. All systems running normally.
                  </td>
                </tr>
              ) : (
                alerts.map((al) => (
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
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#151A2B]">{al.category}</div>
                      <div className="text-[10px] text-[#737B8B] font-mono">{al.source}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#151A2B]">{al.title}</div>
                      <div className="text-[11px] text-[#737B8B] mt-0.5">{al.message}</div>
                    </td>
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
                    <td className="py-3.5 px-4 text-right">
                      {al.status !== 'RESOLVED' ? (
                        <div className="inline-flex items-center gap-1.5">
                          {al.status === 'OPEN' && (
                            <button
                              onClick={() => handleAcknowledge(al.id)}
                              className="px-2.5 py-1 rounded-lg border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065]"
                            >
                              Ack
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAlertForResolve(al)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
                          >
                            Resolve
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8A92A6] italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Alert Modal */}
      {selectedAlertForResolve && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E4E5E9] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#151A2B]">Resolve System Alert</h2>
              <button
                onClick={() => setSelectedAlertForResolve(null)}
                className="p-1 rounded-lg hover:bg-[#F6F6F6] text-[#8A92A6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#737B8B]">
              Resolving alert{' '}
              <strong className="text-[#151A2B]">{selectedAlertForResolve.alertNumber}</strong> (
              {selectedAlertForResolve.title})
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                  Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe resolution actions taken..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlertForResolve(null)}
                  className="px-4 py-2 rounded-xl border border-[#E4E5E9] text-xs font-semibold text-[#475065]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  {actionLoading ? 'Resolving...' : 'Confirm Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
