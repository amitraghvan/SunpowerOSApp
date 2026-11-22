'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Building2,
  Users,
  HardDrive,
  Calendar,
  Shield,
  LifeBuoy,
  Ban,
  CheckCircle2,
  ChevronLeft,
  Sliders,
  FileText,
  Clock,
  MapPin,
  Mail,
  Loader2,
  X,
} from 'lucide-react';

export default function PlatformOrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'branches' | 'subscription' | 'support' | 'audit'>('overview');

  // Plan modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getOrganizationDetail(orgId);
      setData(res);
      if (res?.organization?.subscription?.planId) {
        setSelectedPlanId(res.organization.subscription.planId);
      }
    } catch (err) {
      console.error('Failed to load organization detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const p = await ApiClient.getPlans();
      setPlans(p || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchDetail();
      fetchPlans();
    }
  }, [orgId]);

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await ApiClient.updateOrganizationSubscription(orgId, {
        planId: selectedPlanId,
      });
      setPlanModalOpen(false);
      fetchDetail();
    } catch (err: any) {
      alert(`Failed to update subscription: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('Reactivate this organization?')) return;
    try {
      await ApiClient.reactivateOrganization(orgId);
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#714B67] mx-auto mb-3" />
        <div className="text-xs text-[#737B8B]">Loading organization 360 workspace...</div>
      </div>
    );
  }

  const org = data?.organization;
  if (!org) {
    return (
      <div className="py-12 text-center text-sm text-[#737B8B]">
        Organization not found.{' '}
        <Link href="/organizations" className="text-[#714B67] font-semibold">
          Return to directory
        </Link>
      </div>
    );
  }

  const storageMb = data?.storage?.totalMb ?? 0;
  const storageLimitMb = org.subscription?.storageLimitMb || 5120;
  const storagePercent = Math.min(100, Math.round((storageMb / storageLimitMb) * 100));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/organizations"
            className="text-xs font-semibold text-[#714B67] hover:underline inline-flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Organizations Directory</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-[#151A2B]">{org.name}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                org.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-700'
                  : org.status === 'SUSPENDED'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {org.status}
            </span>
          </div>
          <div className="text-xs text-[#737B8B] font-mono">
            ID: {org.id} · slug: {org.slug} · Created {new Date(org.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {org.status === 'SUSPENDED' ? (
            <button
              onClick={handleReactivate}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reactivate Organization</span>
            </button>
          ) : (
            <button
              onClick={() => setPlanModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Change Plan & Limits</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-[#E4E5E9] shadow-xs">
          <div className="text-[11px] text-[#737B8B] font-medium">Team Users</div>
          <div className="text-lg font-bold text-[#151A2B] mt-0.5">{org._count?.memberships ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#E4E5E9] shadow-xs">
          <div className="text-[11px] text-[#737B8B] font-medium">Branches</div>
          <div className="text-lg font-bold text-[#151A2B] mt-0.5">{org._count?.branches ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#E4E5E9] shadow-xs">
          <div className="text-[11px] text-[#737B8B] font-medium">Storage Used</div>
          <div className="text-lg font-bold text-[#151A2B] mt-0.5">{storageMb} MB</div>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#E4E5E9] shadow-xs">
          <div className="text-[11px] text-[#737B8B] font-medium">Customers</div>
          <div className="text-lg font-bold text-[#151A2B] mt-0.5">{org._count?.customers ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#E4E5E9] shadow-xs">
          <div className="text-[11px] text-[#737B8B] font-medium">Sales Orders</div>
          <div className="text-lg font-bold text-[#151A2B] mt-0.5">{org._count?.salesOrders ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#E4E5E9] shadow-xs">
          <div className="text-[11px] text-[#737B8B] font-medium">Support Tickets</div>
          <div className="text-lg font-bold text-[#151A2B] mt-0.5">{org._count?.supportTickets ?? 0}</div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#E4E5E9] px-4 pt-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Subscription & Limits', icon: Sliders },
            { id: 'users', label: `Users (${org.memberships?.length || 0})`, icon: Users },
            { id: 'branches', label: `Branches (${org.branches?.length || 0})`, icon: MapPin },
            { id: 'support', label: `Support Tickets (${org.supportTickets?.length || 0})`, icon: LifeBuoy },
            { id: 'audit', label: 'Audit History', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-[#714B67] text-[#714B67]'
                    : 'border-transparent text-[#737B8B] hover:text-[#151A2B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: Subscription & Limits */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#FAFAFB] border border-[#E4E5E9] space-y-3">
                  <h3 className="text-xs font-bold text-[#8A92A6] uppercase tracking-wider">
                    SaaS Plan Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737B8B]">Current Plan:</span>
                      <span className="font-bold text-[#151A2B]">
                        {org.subscription?.plan?.name || 'Growth Solar EPC'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737B8B]">Plan Code:</span>
                      <span className="font-mono font-semibold text-[#151A2B]">
                        {org.subscription?.plan?.code || 'GROWTH'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737B8B]">Subscription Status:</span>
                      <span className="font-bold text-emerald-700">
                        {org.subscription?.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737B8B]">Seat Limit:</span>
                      <span className="font-semibold text-[#151A2B]">
                        {org.subscription?.seatLimit || 25} Users
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAFAFB] border border-[#E4E5E9] space-y-3">
                  <h3 className="text-xs font-bold text-[#8A92A6] uppercase tracking-wider">
                    Storage Quota & Utilization
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737B8B]">Consumed:</span>
                      <span className="font-bold text-[#151A2B]">{storageMb} MB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737B8B]">Allocated Limit:</span>
                      <span className="font-semibold text-[#151A2B]">{storageLimitMb} MB</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E4E5E9] overflow-hidden mt-2">
                      <div
                        style={{ width: `${storagePercent}%` }}
                        className="h-full bg-[#714B67] rounded-full transition-all"
                      />
                    </div>
                    <div className="text-[10px] text-[#737B8B] text-right font-mono">
                      {storagePercent}% utilized
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Users */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Assigned Branch</th>
                    <th className="pb-2">Roles</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E5E9]">
                  {org.memberships?.map((m: any) => (
                    <tr key={m.id} className="hover:bg-[#FAFAFB]">
                      <td className="py-2.5 font-bold text-[#151A2B]">
                        {m.user?.firstName} {m.user?.lastName}
                      </td>
                      <td className="py-2.5 text-[#475065]">{m.user?.email}</td>
                      <td className="py-2.5 text-[#737B8B]">{m.branch?.name || 'Main Branch'}</td>
                      <td className="py-2.5 font-mono text-[10px] text-[#714B67]">
                        {m.roles?.map((r: any) => r.role?.code).join(', ') || 'MEMBER'}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          {m.user?.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-2.5 text-[#8A92A6] font-mono text-[11px]">
                        {m.user?.lastLoginAt ? new Date(m.user.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Branches */}
          {activeTab === 'branches' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {org.branches?.map((b: any) => (
                <div key={b.id} className="p-4 rounded-xl border border-[#E4E5E9] bg-[#FAFAFB] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-[#151A2B]">{b.name}</div>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#E4E5E9]">
                      {b.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#737B8B]">
                    {b.city}, {b.state}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Support */}
          {activeTab === 'support' && (
            <div className="space-y-3">
              {org.supportTickets?.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8A92A6]">
                  No support tickets raised by this organization.
                </div>
              ) : (
                org.supportTickets?.map((t: any) => (
                  <div key={t.id} className="p-3.5 rounded-xl border border-[#E4E5E9] bg-[#FAFAFB] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#151A2B]">{t.subject}</div>
                      <div className="text-[10px] text-[#737B8B] font-mono mt-0.5">
                        Ticket: {t.ticketNumber || t.id} · Submitted by {t.submittedBy?.firstName} {t.submittedBy?.lastName}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: Audit History */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              {data?.auditHistory?.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8A92A6]">
                  No administrative actions recorded on this organization.
                </div>
              ) : (
                data?.auditHistory?.map((ev: any) => (
                  <div key={ev.id} className="p-3 rounded-xl border border-[#E4E5E9] bg-[#FAFAFB] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#151A2B] flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#F1EAF0] text-[#714B67] font-mono text-[10px]">
                          {ev.action}
                        </span>
                        <span>by {ev.actorEmail || ev.actorId}</span>
                      </div>
                      {ev.reason && (
                        <div className="text-[11px] text-[#737B8B] mt-1">
                          Reason: {ev.reason}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8A92A6] font-mono">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Plan Upgrade Modal */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E4E5E9] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#151A2B]">Update SaaS Subscription</h2>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F6F6F6] text-[#8A92A6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                  Select SaaS Tier
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67] bg-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) — ₹{Number(p.monthlyPrice).toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E5E9] text-xs font-semibold text-[#475065]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-[#714B67] text-white text-xs font-semibold"
                >
                  {modalLoading ? 'Saving...' : 'Apply Plan Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
