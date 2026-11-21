'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Key, Search, Filter, Shield, AlertTriangle } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function PermissionsRegistryPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    async function fetchPermissions() {
      setIsLoading(true);
      try {
        const p = await ApiClient.getPermissions();
        setPermissions(p || []);
      } catch (err: any) {
        console.warn('Error fetching permissions:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPermissions();
  }, []);

  const categories = Array.from(new Set(permissions.map((p) => p.category))).sort();

  const filtered = permissions.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
            <Link href="/settings" className="hover:text-[#714B67]">Settings</Link>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Permissions Registry</span>
          </div>
          <h1 className="text-lg font-bold text-[#212529] mt-0.5">System Operations & Security Matrix</h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-[#714B67]/10 text-[#714B67] font-semibold">
            {permissions.length} Total Registered Operations
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permissions by code, name, resource..."
            className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6C757D]" />
          <span className="text-[#6C757D] font-medium">Domain Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-[#CED4DA] rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          >
            <option value="ALL">All Categories ({permissions.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded border border-[#DEE2E6] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#6C757D] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Permission Code</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Action</th>
              <th className="px-4 py-2.5">Resource</th>
              <th className="px-4 py-2.5">Sensitivity</th>
              <th className="px-4 py-2.5">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.code} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-4 py-2.5 font-mono font-semibold text-[#714B67]">
                    {p.code}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-[#212529]">{p.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#017E84] font-bold">
                    {p.action}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#6C757D]">
                    {p.resource}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`odoo-badge ${
                        p.sensitivity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : p.sensitivity === 'SENSITIVE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.sensitivity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6C757D] max-w-xs">{p.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6C757D]">
                  {isLoading ? 'Loading system permissions...' : 'No permissions match your filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
