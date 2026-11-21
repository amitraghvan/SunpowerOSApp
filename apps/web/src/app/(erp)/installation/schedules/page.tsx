'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Calendar,
  Search,
  Plus,
  RefreshCw,
  ChevronRight,
  Clock,
  MapPin,
  HardHat,
} from 'lucide-react';

export default function InstallationSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getInstallationSchedules();
      setSchedules(res || []);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
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
            <span className="text-gray-700 font-medium">Schedules</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#714B67]" />
            Site Visit & Installation Schedules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Chronological calendar of pre-installation site visits, mounting mobilizations, commissioning tests, and DISCOM inspections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSchedules}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Schedules List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Schedule Code</th>
              <th className="py-3 px-4">Visit Type</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Assigned Crew</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No site visits scheduled.
                </td>
              </tr>
            ) : (
              schedules.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                    {s.scheduleCode}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {s.visitType?.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/installation/projects/${s.projectInitiation?.id}`}
                      className="font-medium text-gray-800 hover:text-[#714B67]"
                    >
                      {s.projectInitiation?.projectCode}
                    </Link>
                    <div className="text-[11px] text-gray-400">
                      {s.projectInitiation?.site?.city}, {s.projectInitiation?.site?.state}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900">
                      {new Date(s.scheduledDate).toLocaleDateString()}
                    </div>
                    {s.startTime && <div className="text-[11px] text-gray-400">{s.startTime}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.crew ? (
                      <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {s.crew.crewName}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {s.status}
                    </span>
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
