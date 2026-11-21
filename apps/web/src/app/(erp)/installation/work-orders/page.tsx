'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Wrench,
  Search,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  CheckSquare,
} from 'lucide-react';

export default function InstallationWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getInstallationWorkOrders();
      setWorkOrders(res || []);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
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
            <span className="text-gray-700 font-medium">Work Orders</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#714B67]" />
            Installation Work Orders (IWO)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage sequential task execution across mechanical mounting, DC cabling, inverter coupling, and earthing protection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorkOrders}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Work Order</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Assigned Crew</th>
              <th className="py-3 px-4">Supervisor</th>
              <th className="py-3 px-4">Task Completion</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No work orders found.
                </td>
              </tr>
            ) : (
              workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                    {wo.workOrderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    {wo.projectInitiation?.projectCode} ({Number(wo.projectInitiation?.systemCapacityKw)} kW)
                  </td>
                  <td className="py-3.5 px-4">
                    {wo.crew ? (
                      <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {wo.crew.crewName}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-800">
                    {wo.supervisor ? `${wo.supervisor.firstName} ${wo.supervisor.lastName}` : 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#714B67] h-full"
                          style={{ width: `${Number(wo.completionPercentage)}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#714B67]">
                        {Math.round(Number(wo.completionPercentage))}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {wo.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/installation/projects/${wo.projectInitiationId}`}
                      className="text-xs font-semibold text-[#714B67] hover:underline"
                    >
                      Workspace &rarr;
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
