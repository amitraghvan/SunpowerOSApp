'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Gauge,
  Sun,
  HardHat,
  Calendar,
  Wrench,
  Boxes,
  ShieldAlert,
  Zap,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowUpRight,
  AlertTriangle,
  PlayCircle,
  FileText,
  Clock,
  CheckSquare,
} from 'lucide-react';

export default function InstallationCockpitPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, projRes] = await Promise.all([
        ApiClient.getInstallationCockpit(),
        ApiClient.getInstallationProjects(),
      ]);
      setKpis(kpiRes || {});
      setProjects(projRes || []);
    } catch (err) {
      console.error('Failed to load installation cockpit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== 'ALL' && p.installationStatus !== filterStatus) return false;
    if (search) {
      const query = search.toLowerCase();
      const code = p.projectCode?.toLowerCase() || '';
      const name = p.projectName?.toLowerCase() || '';
      const cust = p.customer?.name?.toLowerCase() || '';
      return code.includes(query) || name.includes(query) || cust.includes(query);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_INSTALLATION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SITE_READINESS_PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'READY_FOR_EXECUTION':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CREW_ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'INSTALLATION_IN_PROGRESS':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'INSTALLATION_COMPLETED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'QUALITY_INSPECTION_PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'COMMISSIONING_PENDING':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'COMMISSIONED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'CUSTOMER_HANDOVER_PENDING':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'ON_HOLD':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-[#714B67]" />
            Site Execution & Installation Cockpit
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            End-to-end solar EPC project execution, crew scheduling, safety reviews, quality gates, and grid commissioning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/technician"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#714B67] rounded-lg hover:bg-[#5b3c53] shadow-sm transition-colors"
          >
            <HardHat className="w-4 h-4" />
            Field Technician Portal
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Projects</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{kpis?.totalActiveProjects ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">Under execution</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Ready to Execute</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{kpis?.readyForInstallation ?? 0}</div>
          <div className="text-xs text-blue-500 mt-1">Readiness cleared</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm bg-yellow-50/20">
          <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-bold text-yellow-800 mt-1">{kpis?.inProgressInstallation ?? 0}</div>
          <div className="text-xs text-yellow-600 mt-1">Site work ongoing</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cyan-200 shadow-sm bg-cyan-50/20">
          <div className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">Commissioning</div>
          <div className="text-2xl font-bold text-cyan-800 mt-1">{kpis?.commissioningPending ?? 0}</div>
          <div className="text-xs text-cyan-600 mt-1">Grid tests pending</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Commissioned</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{kpis?.commissioned ?? 0}</div>
          <div className="text-xs text-emerald-600 mt-1">Power generating</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20">
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Active Crews</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">{kpis?.totalActiveCrews ?? 0}</div>
          <div className="text-xs text-purple-500 mt-1">{kpis?.availableTechnicians ?? 0} techs available</div>
        </div>
      </div>

      {/* Safety Alert Banner if Stop-Work is active */}
      {kpis?.stopWorkIncidentsActive > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {kpis.stopWorkIncidentsActive} Project(s) currently under STOP-WORK safety order!
              </p>
              <p className="text-xs text-red-600">Immediate supervisor investigation & corrective sign-off required.</p>
            </div>
          </div>
          <Link
            href="/installation/safety-quality"
            className="text-xs font-medium text-red-700 hover:text-red-900 underline"
          >
            Review Safety Alerts &rarr;
          </Link>
        </div>
      )}

      {/* Operational Fast Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Link
          href="/installation/projects"
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#714B67] hover:shadow transition-all group flex flex-col justify-between"
        >
          <Sun className="w-5 h-5 text-[#714B67] mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-gray-900">Projects Directory</div>
            <div className="text-[10px] text-gray-500">12 Subsystems 360°</div>
          </div>
        </Link>

        <Link
          href="/installation/technicians"
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#714B67] hover:shadow transition-all group flex flex-col justify-between"
        >
          <HardHat className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-gray-900">Technicians & Crews</div>
            <div className="text-[10px] text-gray-500">Skills & Certifications</div>
          </div>
        </Link>

        <Link
          href="/installation/schedules"
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#714B67] hover:shadow transition-all group flex flex-col justify-between"
        >
          <Calendar className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-gray-900">Site Schedules</div>
            <div className="text-[10px] text-gray-500">Visits & Calendars</div>
          </div>
        </Link>

        <Link
          href="/installation/work-orders"
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#714B67] hover:shadow transition-all group flex flex-col justify-between"
        >
          <Wrench className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-gray-900">Work Orders (IWO)</div>
            <div className="text-[10px] text-gray-500">9 Core Solar Tasks</div>
          </div>
        </Link>

        <Link
          href="/installation/material-handover"
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#714B67] hover:shadow transition-all group flex flex-col justify-between"
        >
          <Boxes className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-gray-900">Site Custody (MHO)</div>
            <div className="text-[10px] text-gray-500">Zero Stock Double Deduction</div>
          </div>
        </Link>

        <Link
          href="/installation/commissioning"
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#714B67] hover:shadow transition-all group flex flex-col justify-between"
        >
          <Zap className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-gray-900">Commissioning (COM)</div>
            <div className="text-[10px] text-gray-500">Grid Sync & Tests</div>
          </div>
        </Link>
      </div>

      {/* Main Execution Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project code, customer, capacity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            {['ALL', 'READY_FOR_INSTALLATION', 'INSTALLATION_IN_PROGRESS', 'COMMISSIONING_PENDING', 'COMMISSIONED', 'COMPLETED'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterStatus === st
                      ? 'bg-[#714B67] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Customer & Site</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Assigned Crew</th>
                <th className="py-3 px-4">Execution Status</th>
                <th className="py-3 px-4">Work Orders</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No installation projects matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const wo = p.workOrders?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/installation/projects/${p.id}`}
                          className="font-semibold text-gray-900 hover:text-[#714B67] flex items-center gap-1.5"
                        >
                          {p.projectCode}
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                        <div className="text-xs text-gray-500">{p.projectName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-800">{p.customer?.name}</div>
                        <div className="text-xs text-gray-400">
                          {p.site?.city}, {p.site?.state}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900">{Number(p.systemCapacityKw)}</span>{' '}
                        <span className="text-xs text-gray-500">kW</span>
                        <div className="text-[10px] text-gray-400">{p.systemType}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.assignedCrew ? (
                          <div className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 w-fit">
                            {p.assignedCrew.crewName}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(
                            p.installationStatus,
                          )}`}
                        >
                          {p.installationStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {wo ? (
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-medium text-gray-700">{wo.workOrderNumber}</span>
                              <span className="font-bold text-[#714B67]">
                                {Math.round(Number(wo.completionPercentage))}%
                              </span>
                            </div>
                            <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#714B67] h-full"
                                style={{ width: `${Number(wo.completionPercentage)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/installation/projects/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#714B67] hover:text-[#5b3c53] bg-[#714B67]/5 hover:bg-[#714B67]/10 px-2.5 py-1.5 rounded transition-colors"
                        >
                          Workspace &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
