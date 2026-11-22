'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Building2,
  Users,
  SunMedium,
  HardDrive,
  Mail,
  LifeBuoy,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export default function PlatformOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getOverview();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load overview metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const hasGrowthData =
    metrics?.monthlyGrowth &&
    metrics.monthlyGrowth.length > 0 &&
    metrics.monthlyGrowth.some((g: any) => g.count > 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            Platform Overview
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Real-time SaaS operational metrics and system activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/organizations"
            className="px-3.5 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Manage Organizations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Organizations */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B8B]">Total Organizations</span>
            <div className="w-8 h-8 rounded-xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#151A2B]">
              {loading ? '...' : metrics?.totalOrganizations ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="text-emerald-600 font-semibold">
                {metrics?.activeOrganizations ?? 0} active
              </span>
              <span className="text-[#8A92A6]">·</span>
              <span className="text-amber-600 font-medium">
                {metrics?.trialOrganizations ?? 0} trial
              </span>
              <span className="text-[#8A92A6]">·</span>
              <span className="text-rose-600 font-medium">
                {metrics?.suspendedOrganizations ?? 0} suspended
              </span>
            </div>
          </div>
        </div>

        {/* Total Platform Users */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B8B]">Platform Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#151A2B]">
              {loading ? '...' : metrics?.totalUsers ?? 0}
            </div>
            <div className="text-[11px] text-[#737B8B] mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Active user accounts across organizations</span>
            </div>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B8B]">Solar Projects Executed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <SunMedium className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#151A2B]">
              {loading ? '...' : metrics?.totalProjects ?? 0}
            </div>
            <div className="text-[11px] text-[#737B8B] mt-1.5">
              <span>Commercial & residential installations</span>
            </div>
          </div>
        </div>

        {/* Storage Utilized */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E5E9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B8B]">Object Storage Utilized</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#151A2B]">
              {loading ? '...' : `${metrics?.totalStorageMb ?? 0} MB`}
            </div>
            <div className="text-[11px] text-[#737B8B] mt-1.5">
              <span>Documents & media storage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Alerts & Attention Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/enquiries"
          className="bg-white rounded-2xl p-4 border border-[#E4E5E9] hover:border-[#714B67]/30 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#151A2B]">New Website Enquiries</div>
              <div className="text-[11px] text-[#737B8B]">Inbound website leads</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
              {metrics?.newEnquiriesCount ?? 0}
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#8A92A6] group-hover:text-[#714B67] transition-colors" />
          </div>
        </Link>

        <Link
          href="/support"
          className="bg-white rounded-2xl p-4 border border-[#E4E5E9] hover:border-[#714B67]/30 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#151A2B]">Active Support Tickets</div>
              <div className="text-[11px] text-[#737B8B]">Open support requests</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
              {metrics?.openTicketsCount ?? 0}
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#8A92A6] group-hover:text-[#714B67] transition-colors" />
          </div>
        </Link>

        <Link
          href="/health"
          className="bg-white rounded-2xl p-4 border border-[#E4E5E9] hover:border-[#714B67]/30 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#151A2B]">System Health & Alerts</div>
              <div className="text-[11px] text-[#737B8B]">System operational status</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                (metrics?.activeAlertsCount ?? 0) > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {metrics?.activeAlertsCount ?? 0} alerts
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#8A92A6] group-hover:text-[#714B67] transition-colors" />
          </div>
        </Link>
      </div>

      {/* Two Column Layout: Growth Chart & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 6-Month Growth Trajectory */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#151A2B] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#714B67]" />
                <span>Organization Onboarding Trajectory</span>
              </h2>
              <p className="text-[11px] text-[#737B8B]">New organizations registered per month</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67]">
              PAST 6 MONTHS
            </span>
          </div>

          {/* Bar Chart Visualization / Clean Empty State Fallback */}
          <div className="pt-4 pb-2">
            {!hasGrowthData ? (
              <div className="h-48 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E5E9] bg-[#FAFAFB]/80 p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F1EAF0] text-[#714B67] flex items-center justify-center mb-2.5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#151A2B]">
                  No Monthly Growth History Yet
                </div>
                <p className="text-[11px] text-[#737B8B] max-w-sm mt-1">
                  Once new organizations register on the platform, their monthly onboarding trends
                  will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between gap-4 px-3 pt-6 pb-2 border-b border-[#E4E5E9]">
                {metrics?.monthlyGrowth?.map((item: any, idx: number) => {
                  const max = Math.max(...metrics.monthlyGrowth.map((g: any) => g.count), 5);
                  const heightPercent = Math.max(10, Math.round((item.count / max) * 100));
                  return (
                    <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end group">
                      <span className="text-[10px] font-bold text-[#714B67] opacity-80 group-hover:opacity-100 transition-opacity mb-1.5">
                        {item.count}
                      </span>
                      <div className="w-full h-28 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[32px] rounded-t-md transition-all ${
                            item.count > 0
                              ? 'bg-[#714B67] group-hover:bg-[#5A3750] shadow-xs'
                              : 'bg-[#E4E5E9]'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#737B8B] uppercase mt-2">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Organizations */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#151A2B]">Recent Organizations</h2>
            <Link
              href="/organizations"
              className="text-xs font-semibold text-[#714B67] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {!metrics?.recentRegistrations || metrics.recentRegistrations.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-[#E4E5E9] bg-[#FAFAFB]/60 p-4">
                <FolderOpen className="w-7 h-7 text-[#8A92A6] mx-auto mb-1.5" />
                <div className="text-xs font-semibold text-[#151A2B]">No Organizations Yet</div>
                <p className="text-[10px] text-[#737B8B] mt-0.5">
                  Newly registered organizations will appear here.
                </p>
              </div>
            ) : (
              metrics?.recentRegistrations?.map((org: any) => (
                <Link
                  key={org.id}
                  href={`/organizations/${org.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E4E5E9] hover:border-[#714B67]/30 hover:bg-[#FAFAFB] transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-xs font-bold text-[#151A2B] truncate group-hover:text-[#714B67]">
                      {org.name}
                    </div>
                    <div className="text-[10px] text-[#737B8B] font-mono mt-0.5">
                      slug: {org.slug} · {org._count?.memberships ?? 0} users
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        org.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : org.status === 'SUSPENDED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {org.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8A92A6] group-hover:text-[#714B67]" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Platform Security & Audit Activity Stream */}
      <div className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#714B67]" />
            <h2 className="text-sm font-bold text-[#151A2B]">Live Platform Security Audit Log</h2>
          </div>
          <Link
            href="/audit-logs"
            className="text-xs font-semibold text-[#714B67] hover:underline"
          >
            Full audit explorer
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Action</th>
                <th className="pb-2.5">Actor</th>
                <th className="pb-2.5">Target</th>
                <th className="pb-2.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E5E9]/60">
              {!metrics?.recentAuditEvents || metrics.recentAuditEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-[#8A92A6]">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                metrics?.recentAuditEvents?.map((ev: any) => (
                  <tr key={ev.id} className="hover:bg-[#FAFAFB]">
                    <td className="py-2.5 text-[#737B8B] font-mono text-[11px]">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 font-semibold text-[#151A2B]">
                      <span className="px-2 py-0.5 rounded-md bg-[#F1EAF0] text-[#714B67] font-mono text-[10px]">
                        {ev.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#475065]">
                      {ev.actorEmail || ev.actorId}
                    </td>
                    <td className="py-2.5 text-[#737B8B] font-mono text-[11px]">
                      {ev.targetType}:{ev.targetId?.slice(0, 8) || 'N/A'}
                    </td>
                    <td className="py-2.5 text-[#8A92A6] font-mono text-[11px]">
                      {ev.ipAddress || 'Internal'}
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
