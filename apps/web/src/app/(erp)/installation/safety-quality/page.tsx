'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  ShieldAlert,
  Award,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function SafetyQualityManagementPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getInstallationProjects();
      setProjects(res || []);
    } catch (err) {
      console.error('Failed to load safety and quality data:', err);
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
            <span className="text-gray-700 font-medium">Safety & Quality</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#714B67]" />
            Site Safety Governance & Quality Inspection Gates
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pre-work daily safety reviews, PPE compliance, formal stop-work controls, and stage-gate mechanical/electrical quality inspections
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

      {/* Safety & Quality Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
            No projects found.
          </div>
        ) : (
          projects.map((p) => {
            const isStopWork = p.installationStatus === 'ON_HOLD';
            return (
              <div
                key={p.id}
                className={`bg-white p-5 rounded-xl border shadow-sm transition-all flex flex-col justify-between ${
                  isStopWork ? 'border-red-300 bg-red-50/10' : 'border-gray-200 hover:border-[#714B67]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#714B67]">
                        {p.projectCode}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{p.projectName}</h3>
                    </div>
                    {isStopWork ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> STOP-WORK
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700">
                        CLEARED
                      </span>
                    )}
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
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Stage Gates: <strong>Verified</strong>
                  </span>
                  <Link
                    href={`/installation/projects/${p.id}`}
                    className="text-xs font-semibold text-[#714B67] hover:underline"
                  >
                    Manage Gates &rarr;
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
