'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Sliders,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Users,
  SunMedium,
  Shield,
  Loader2,
} from 'lucide-react';

export default function PlatformSettingsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getPlatformPlans();
      setPlans(res || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            SaaS Plans & Platform Settings
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Configure enterprise solar EPC subscription tiers, user seat limits and platform features
          </p>
        </div>

        <button
          onClick={fetchPlans}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Plans</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#714B67] mx-auto mb-3" />
          <div className="text-xs text-[#737B8B]">Loading SaaS plans...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-6 border border-[#E4E5E9] shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#714B67] px-2.5 py-0.5 rounded-full bg-[#F1EAF0]">
                    {p.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {p.isActive ? 'ACTIVE TIER' : 'INACTIVE'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#151A2B]">{p.name}</h3>
                  <p className="text-xs text-[#737B8B] mt-1 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-2">
                  <div className="text-2xl font-bold text-[#151A2B]">
                    ₹{Number(p.monthlyPrice).toLocaleString()}
                    <span className="text-xs font-normal text-[#737B8B]"> / month</span>
                  </div>
                  <div className="text-[11px] text-[#8A92A6]">
                    ₹{Number(p.annualPrice).toLocaleString()} billed annually
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4E5E9] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#475065]">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#8A92A6]" />
                      <span>User Seat Quota:</span>
                    </span>
                    <span className="font-bold text-[#151A2B]">{p.maxUsers} Users</span>
                  </div>

                  <div className="flex items-center justify-between text-[#475065]">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-[#8A92A6]" />
                      <span>MinIO Storage:</span>
                    </span>
                    <span className="font-bold text-[#151A2B]">
                      {Math.round(p.maxStorageMb / 1024)} GB ({p.maxStorageMb} MB)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#475065]">
                    <span className="flex items-center gap-1.5">
                      <SunMedium className="w-3.5 h-3.5 text-[#8A92A6]" />
                      <span>Project Limit:</span>
                    </span>
                    <span className="font-bold text-[#151A2B]">{p.maxProjects} Projects</span>
                  </div>
                </div>

                {p.features && p.features.length > 0 && (
                  <div className="pt-2 border-t border-[#E4E5E9] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider block">
                      Included Modules & Features:
                    </span>
                    {p.features.map((f: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#475065]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E4E5E9] flex items-center justify-between text-xs text-[#737B8B]">
                <span>Active Subscriptions:</span>
                <span className="font-bold text-[#151A2B]">
                  {p._count?.subscriptions ?? 0} tenants
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
