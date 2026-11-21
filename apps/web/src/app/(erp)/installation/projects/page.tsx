'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Sun,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  HardHat,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default function InstallationProjectsListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getInstallationProjects();
      setProjects(res || []);
    } catch (err) {
      console.error('Failed to load installation projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'ALL' && p.installationStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const code = p.projectCode?.toLowerCase() || '';
      const name = p.projectName?.toLowerCase() || '';
      const cust = p.customer?.name?.toLowerCase() || '';
      return code.includes(q) || name.includes(q) || cust.includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/installation" className="hover:text-gray-900">
              Installation
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium">Projects</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sun className="w-6 h-6 text-[#714B67]" />
            Installation Projects Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage field execution workspaces across rooftop and commercial solar installations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by project code, customer, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {['ALL', 'READY_FOR_INSTALLATION', 'CREW_ASSIGNED', 'INSTALLATION_IN_PROGRESS', 'COMMISSIONING_PENDING', 'COMMISSIONED', 'COMPLETED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#714B67] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
            No projects found matching the selected filter.
          </div>
        ) : (
          filtered.map((p) => {
            const wo = p.workOrders?.[0];
            return (
              <div
                key={p.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#714B67] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-semibold text-[#714B67] bg-[#714B67]/10 px-2 py-0.5 rounded">
                        {p.projectCode}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-2 line-clamp-1">
                        {p.projectName}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {p.systemType}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Customer:</span>
                      <span className="font-medium text-gray-900">{p.customer?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span>{p.site?.city}, {p.site?.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacity:</span>
                      <span className="font-bold text-gray-900">{Number(p.systemCapacityKw)} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crew:</span>
                      <span className="font-medium text-purple-700">
                        {p.assignedCrew?.crewName || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {wo && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-bold text-[#714B67]">{Math.round(Number(wo.completionPercentage))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#714B67] h-full"
                          style={{ width: `${Number(wo.completionPercentage)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700">
                    {p.installationStatus?.replace(/_/g, ' ')}
                  </span>
                  <Link
                    href={`/installation/projects/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#714B67] hover:text-[#5b3c53]"
                  >
                    Open Cockpit &rarr;
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
