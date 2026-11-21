'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Award,
  FileCheck,
} from 'lucide-react';

export default function CustomerHandoverListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getInstallationProjects();
      setProjects(res || []);
    } catch (err) {
      console.error('Failed to load handover data:', err);
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
            <span className="text-gray-700 font-medium">Customer Handover</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#714B67]" />
            Customer Handover & Project Completion (CHO)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Handover dossiers, as-built SLDs, customer punchlist sign-offs, and warranty commencement
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

      {/* Handover Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Handover Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No projects found.
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
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        p.installationStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {p.installationStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING_SIGN_OFF'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/installation/projects/${p.id}`}
                      className="text-xs font-semibold text-[#714B67] hover:underline"
                    >
                      Handover Pack &rarr;
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
