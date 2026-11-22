'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  HardDrive,
  Calendar,
  X,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function PlatformOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Suspend modal state
  const [selectedOrgForSuspend, setSelectedOrgForSuspend] = useState<any>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getOrganizations({
        page,
        limit: 15,
        search: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setOrganizations(res?.items || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrganizations();
  };

  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgForSuspend) return;
    setActionLoading(true);
    setActionError('');
    try {
      await ApiClient.suspendOrganization(selectedOrgForSuspend.id, suspensionReason);
      setSelectedOrgForSuspend(null);
      setSuspensionReason('');
      fetchOrganizations();
    } catch (err: any) {
      setActionError(err.message || 'Failed to suspend organization.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (orgId: string) => {
    if (!confirm('Reactivate this organization and restore tenant workspace access?')) return;
    setLoading(true);
    try {
      await ApiClient.reactivateOrganization(orgId);
      fetchOrganizations();
    } catch (err: any) {
      alert(`Error reactivating organization: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            Tenant Organizations
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Registered solar companies, workspace lifecycle, subscriptions and access status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrganizations}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E5E9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'text-[#737B8B] hover:bg-[#F6F6F6] hover:text-[#151A2B]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A92A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or slug..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#E4E5E9] text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#F1EAF0] text-[#714B67] font-semibold text-xs hover:bg-[#EBDDE9] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Plan & Subscription</th>
                <th className="py-3 px-4">Users</th>
                <th className="py-3 px-4">Branches</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E5E9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8A92A6]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                    Loading registered organizations...
                  </td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8A92A6]">
                    No organizations match the selected criteria.
                  </td>
                </tr>
              ) : (
                organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-[#FAFAFB] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#151A2B]">{org.name}</div>
                      <div className="text-[11px] text-[#737B8B] font-mono mt-0.5">
                        slug: {org.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          org.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : org.status === 'SUSPENDED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {org.status}
                      </span>
                      {org.suspensionReason && (
                        <div
                          title={org.suspensionReason}
                          className="text-[10px] text-rose-600 truncate max-w-[140px] mt-0.5"
                        >
                          {org.suspensionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#151A2B]">
                        {org.subscription?.plan?.name || 'Growth Solar EPC'}
                      </span>
                      <div className="text-[10px] text-[#737B8B]">
                        {org.subscription?.status || 'Active Plan'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475065] font-semibold">
                      {org._count?.memberships ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-[#475065] font-semibold">
                      {org._count?.branches ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-[#737B8B] font-mono text-[11px]">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/organizations/${org.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[#F1EAF0] text-[#714B67] hover:bg-[#EBDDE9] text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View 360</span>
                        </Link>

                        {org.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => handleReactivate(org.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedOrgForSuspend(org)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </div>
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
            Showing {organizations.length} of {total} organizations
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
              disabled={organizations.length < 15}
              className="px-2.5 py-1 rounded-lg border border-[#E4E5E9] bg-white text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {selectedOrgForSuspend && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E4E5E9] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700">
                <Ban className="w-5 h-5" />
                <h2 className="text-base font-bold text-[#151A2B]">Suspend Organization</h2>
              </div>
              <button
                onClick={() => setSelectedOrgForSuspend(null)}
                className="p-1 rounded-lg hover:bg-[#F6F6F6] text-[#8A92A6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#737B8B] leading-relaxed">
              Suspending{' '}
              <strong className="text-[#151A2B]">{selectedOrgForSuspend.name}</strong> will
              immediately revoke all active sessions for its users and prevent access to the ERP
              portal until reactivated.
            </p>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                  Suspension Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Subscription payment past due / Terms violation / Pending security review"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrgForSuspend(null)}
                  className="px-4 py-2 rounded-xl border border-[#E4E5E9] text-xs font-semibold text-[#475065] hover:bg-[#F6F6F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || suspensionReason.trim().length < 5}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Suspension</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
