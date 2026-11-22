'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  Search,
  Filter,
  Building2,
  MapPin,
  Shield,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Ban,
  UserCheck,
  Mail,
} from 'lucide-react';

export default function GlobalUserDirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getUsers({
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setUsers(res?.items || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error('Failed to load global users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            Global User Directory
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Platform user directory, organization affiliations, and security access states
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E5E9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'ACTIVE', 'SUSPENDED', 'INVITED'].map((st) => (
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
              placeholder="Search user name or email..."
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

      {/* Global Users Table */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Primary Organization</th>
                <th className="py-3 px-4">Assigned Branch</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E5E9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8A92A6]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                    Querying global user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8A92A6]">
                    No users found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const primaryMembership = u.memberships?.[0];
                  const org = primaryMembership?.organization;
                  const branch = primaryMembership?.branch;
                  const roles = primaryMembership?.roles?.map((r: any) => r.role?.code).join(', ');

                  return (
                    <tr key={u.id} className="hover:bg-[#FAFAFB] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#F1EAF0] text-[#714B67] font-bold text-[11px] flex items-center justify-center shrink-0">
                            {u.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[#151A2B]">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-[11px] text-[#737B8B] font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {org ? (
                          <Link
                            href={`/organizations/${org.id}`}
                            className="font-semibold text-[#151A2B] hover:text-[#714B67] hover:underline flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-[#8A92A6]" />
                            <span>{org.name}</span>
                          </Link>
                        ) : (
                          <span className="text-[#8A92A6] italic">Platform Level</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#475065]">
                        {branch ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-[#8A92A6]" />
                            <span>{branch.name}</span>
                          </span>
                        ) : (
                          <span className="text-[#8A92A6] text-[11px]">Main / Global</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#F1EAF0] text-[#714B67] font-mono text-[10px] font-semibold">
                          {roles || (u.isSuperAdmin ? 'SUPERADMIN' : 'USER')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : u.status === 'SUSPENDED'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#737B8B] font-mono text-[11px]">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#8A92A6] font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="py-3 px-4 border-t border-[#E4E5E9] bg-[#FAFAFB] flex items-center justify-between text-xs text-[#737B8B]">
          <span>
            Showing {users.length} of {total} registered users
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
              disabled={users.length < 20}
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
