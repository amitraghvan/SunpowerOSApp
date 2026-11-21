'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Zap,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export default function CommissioningListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getInstallationProjects();
      setProjects(res || []);
    } catch (err) {
      console.error('Failed to load commissioning projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            <span className="text-gray-700 font-medium">Commissioning</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600" />
            Testing, Grid Synchronization & Commissioning (COM)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cold megger insulation testing, string open-circuit voltage, short-circuit current, earthing resistance, anti-islanding, and engineer certification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Commissioning Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Execution Status</th>
              <th className="py-3 px-4">Commissioning Gate</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No projects available for commissioning.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    {p.projectCode}
                  </td>
                  <td className="py-3.5 px-4 text-gray-800">{p.customer?.name}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{Number(p.systemCapacityKw)} kW</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-700">{p.installationStatus}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        p.installationStatus === 'COMMISSIONED' || p.installationStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {p.installationStatus === 'COMMISSIONED' || p.installationStatus === 'COMPLETED'
                        ? 'APPROVED'
                        : 'PENDING_TESTS'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/installation/projects/${p.id}`}
                      className="text-xs font-semibold text-[#714B67] hover:underline"
                    >
                      Run Tests &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
