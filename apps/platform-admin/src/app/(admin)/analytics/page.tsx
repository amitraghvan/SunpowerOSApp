'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Building2,
  HardDrive,
  RefreshCw,
  SunMedium,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function PlatformAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            SaaS Platform Analytics
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Cross-tenant adoption, subscription tier distribution and customer engagement metrics
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#714B67] mx-auto mb-3" />
          <div className="text-xs text-[#737B8B]">Loading SaaS analytics...</div>
        </div>
      ) : (
        <>
          {/* Subscription Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A92A6] uppercase tracking-wider">
                  Plan Distribution
                </span>
                <PieChart className="w-4 h-4 text-[#714B67]" />
              </div>

              <div className="space-y-3">
                {!data?.planDistribution || data.planDistribution.length === 0 ? (
                  <div className="text-xs text-[#8A92A6] py-4 text-center">No active subscriptions.</div>
                ) : (
                  data?.planDistribution?.map((p: any) => (
                    <div key={p.planId} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFB] border border-[#E4E5E9]">
                      <div>
                        <div className="font-bold text-xs text-[#151A2B]">{p.planName}</div>
                        <div className="text-[10px] text-[#737B8B]">Active Subscriptions</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F1EAF0] text-[#714B67] font-bold text-xs">
                        {p.count} orgs
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Inquiries by Category */}
            <div className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A92A6] uppercase tracking-wider">
                  Enquiries by Category
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-3">
                {!data?.enquiriesByCategory || data.enquiriesByCategory.length === 0 ? (
                  <div className="text-xs text-[#8A92A6] py-4 text-center">No enquiry records yet.</div>
                ) : (
                  data?.enquiriesByCategory?.map((e: any) => (
                    <div key={e.category} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFB] border border-[#E4E5E9]">
                      <div className="font-semibold text-xs text-[#151A2B]">
                        {e.category.replace(/_/g, ' ')}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                        {e.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Support Tickets by Category */}
            <div className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A92A6] uppercase tracking-wider">
                  Support by Category
                </span>
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>

              <div className="space-y-3">
                {!data?.ticketsByCategory || data.ticketsByCategory.length === 0 ? (
                  <div className="text-xs text-[#8A92A6] py-4 text-center">No support ticket records yet.</div>
                ) : (
                  data?.ticketsByCategory?.map((t: any) => (
                    <div key={t.category} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFB] border border-[#E4E5E9]">
                      <div className="font-semibold text-xs text-[#151A2B]">
                        {t.category.replace(/_/g, ' ')}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                        {t.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top Organizations Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#151A2B] flex items-center gap-2">
                  <SunMedium className="w-4 h-4 text-amber-600" />
                  <span>Top Tenants by Project Volume</span>
                </h3>
              </div>

              <div className="space-y-3">
                {!data?.topOrganizationsByProjects || data.topOrganizationsByProjects.length === 0 ? (
                  <div className="text-xs text-[#8A92A6] py-4 text-center">No tenant projects recorded yet.</div>
                ) : (
                  data?.topOrganizationsByProjects?.map((org: any) => (
                    <div key={org.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4E5E9] bg-[#FAFAFB]">
                      <div>
                        <div className="font-bold text-xs text-[#151A2B]">{org.name}</div>
                        <div className="text-[10px] text-[#737B8B] font-mono">slug: {org.slug}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-[#714B67]">
                          {org._count?.salesOrders ?? 0} Sales Orders
                        </div>
                        <div className="text-[10px] text-[#737B8B]">
                          {org._count?.customers ?? 0} Customers
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#151A2B] flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Top Tenants by User Team Size</span>
                </h3>
              </div>

              <div className="space-y-3">
                {!data?.topOrganizationsByUsers || data.topOrganizationsByUsers.length === 0 ? (
                  <div className="text-xs text-[#8A92A6] py-4 text-center">No tenant users recorded yet.</div>
                ) : (
                  data?.topOrganizationsByUsers?.map((org: any) => (
                    <div key={org.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4E5E9] bg-[#FAFAFB]">
                      <div>
                        <div className="font-bold text-xs text-[#151A2B]">{org.name}</div>
                        <div className="text-[10px] text-[#737B8B] font-mono">slug: {org.slug}</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                        {org._count?.memberships ?? 0} Users
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
