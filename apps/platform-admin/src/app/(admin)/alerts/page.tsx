'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export default function PlatformAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Alert resolve modal
  const [selectedAlertForResolve, setSelectedAlertForResolve] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const a = await ApiClient.getAlerts();
      setAlerts(a || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await ApiClient.acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (err: any) {
      alert(`Error acknowledging alert: ${err.message}`);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForResolve) return;
    setActionLoading(true);
    try {
      await ApiClient.resolveAlert(selectedAlertForResolve.id, resolutionNotes);
      setSelectedAlertForResolve(null);
      setResolutionNotes('');
      fetchAlerts();
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
            Platform Alerts & Incident Response
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Acknowledge, inspect, and resolve infrastructure anomalies and operational incidents
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Platform Alerts Table */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E5E9] bg-[#FAFAFB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#714B67]" />
            <h2 className="text-xs font-bold text-[#151A2B] uppercase tracking-wider">
              Recorded Alerts ({alerts.length})
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
