'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  HardHat,
  Users,
  Search,
  Plus,
  RefreshCw,
  ShieldCheck,
  Award,
  ChevronRight,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';

export default function TechniciansCrewsPage() {
  const [tab, setTab] = useState<'crews' | 'technicians'>('crews');
  const [crews, setCrews] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Crew Form State
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewLeaderId, setNewCrewLeaderId] = useState('');
  const [serviceAreas, setServiceAreas] = useState('North, Central');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [crewsRes, techsRes] = await Promise.all([
        ApiClient.getCrews(),
        ApiClient.getTechnicians(),
      ]);
      setCrews(crewsRes || []);
      setTechnicians(techsRes || []);
    } catch (err) {
      console.error('Failed to load technician data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName || !newCrewLeaderId) {
      alert('Please enter crew name and select a leader');
      return;
    }
    try {
      await ApiClient.createCrew({
        crewName: newCrewName,
        crewLeaderId: newCrewLeaderId,
        serviceAreas: serviceAreas.split(',').map((s) => s.trim()),
      });
      setShowCrewModal(false);
      setNewCrewName('');
      setNewCrewLeaderId('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create crew');
    }
  };

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
            <span className="text-gray-700 font-medium">Technicians & Crews</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HardHat className="w-6 h-6 text-[#714B67]" />
            Installation Technicians & Field Crews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Certified solar technicians, skills matrices, certifications, safety inductions, and field crew deployment
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
          <button
            onClick={() => setShowCrewModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#714B67] rounded-lg hover:bg-[#5b3c53] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Crew
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setTab('crews')}
          className={`pb-2.5 border-b-2 transition-colors ${
            tab === 'crews'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Installation Crews ({crews.length})
        </button>
        <button
          onClick={() => setTab('technicians')}
          className={`pb-2.5 border-b-2 transition-colors ${
            tab === 'technicians'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Registered Technicians ({technicians.length})
        </button>
      </div>

      {/* Crews View */}
      {tab === 'crews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crews.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
              No installation crews configured yet. Click "+ New Crew" to create one.
            </div>
          ) : (
            crews.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#714B67] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {c.crewCode}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-2">{c.crewName}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                      {c.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crew Leader:</span>
                      <span className="font-bold text-gray-900">
                        {c.crewLeader?.firstName} {c.crewLeader?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Members:</span>
                      <span className="font-semibold text-gray-800">{c.members?.length || 0} Technicians</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Projects:</span>
                      <span className="font-bold text-[#714B67]">
                        {c.assignedProjects?.length || 0} / {c.maxConcurrentProjects} projects
                      </span>
                    </div>
                  </div>

                  {c.members && c.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                      {c.members.map((m: any) => (
                        <span
                          key={m.id}
                          className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {m.technicianProfile?.user?.firstName} ({m.roleInCrew})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Technicians View */}
      {tab === 'technicians' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Role & Specialization</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Certifications</th>
                <th className="py-3 px-4">Safety Induction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {technicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No technicians registered yet.
                  </td>
                </tr>
              ) : (
                technicians.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">
                        {t.user?.firstName} {t.user?.lastName}
                      </div>
                      <div className="text-gray-400 font-mono">{t.technicianCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-gray-800">{t.technicianType?.replace(/_/g, ' ')}</span>
                      {t.specializations && t.specializations.length > 0 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{t.specializations.join(', ')}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{Number(t.yearsOfExperience || 0)}</span> yrs
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                          t.availabilityStatus === 'AVAILABLE'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {t.availabilityStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{t.certifications?.length || 0} verified</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {t.safetyInductionDate
                        ? new Date(t.safetyInductionDate).toLocaleDateString()
                        : 'Pending'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Crew Modal */}
      {showCrewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Create New Installation Crew</h3>
            <form onSubmit={handleCreateCrew} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Crew Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alpha Solar Rooftop Crew"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Crew Leader User ID</label>
                <input
                  type="text"
                  required
                  placeholder="User UUID of supervisor"
                  value={newCrewLeaderId}
                  onChange={(e) => setNewCrewLeaderId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Service Areas (comma-separated)</label>
                <input
                  type="text"
                  value={serviceAreas}
                  onChange={(e) => setServiceAreas(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCrewModal(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#714B67] hover:bg-[#5b3c53] text-white font-medium rounded-lg"
                >
                  Create Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
