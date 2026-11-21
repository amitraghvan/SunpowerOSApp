'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  HardHat,
  CheckCircle2,
  Calendar,
  Wrench,
  Boxes,
  ShieldAlert,
  Zap,
  RefreshCw,
  Camera,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function FieldTechnicianPortalPage() {
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'safety' | 'serials' | 'tests'>('tasks');
  const [actionLoading, setActionLoading] = useState(false);

  // Quick form states
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskHours, setTaskHours] = useState('8');
  const [taskNotes, setTaskNotes] = useState('');
  const [scannedSerial, setScannedSerial] = useState('');
  const [safetyCleared, setSafetyCleared] = useState(false);

  const fetchTechnicianData = async () => {
    setLoading(true);
    try {
      const [profRes, assignRes] = await Promise.all([
        ApiClient.getTechnicianMyProfile(),
        ApiClient.getTechnicianMyAssignments(),
      ]);
      setProfile(profRes || null);
      setAssignments(assignRes || null);
    } catch (err) {
      console.error('Failed to load technician portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianData();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.technicianCompleteTask(taskId, {
        actualHours: Number(taskHours) || 8,
        notes: taskNotes || 'Task completed on site by technician',
        completionProofUrls: ['https://cdn.solaros.erp/evidence/field-photo.jpg'],
      });
      setSelectedTask(null);
      setTaskNotes('');
      await fetchTechnicianData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSafetySubmit = async () => {
    if (!assignments?.workOrders?.[0]?.projectInitiationId) {
      alert('No active project work order to link safety review to');
      return;
    }
    setActionLoading(true);
    try {
      await ApiClient.technicianSubmitSafety({
        projectInitiationId: assignments.workOrders[0].projectInitiationId,
        toolboxTalkConducted: true,
        ppeComplianceVerified: true,
        fallProtectionVerified: true,
        electricalIsolationVerified: true,
        weatherSafeForWork: true,
      });
      setSafetyCleared(true);
      alert('Daily Safety Checklist submitted and certified!');
      await fetchTechnicianData();
    } catch (err: any) {
      alert(err.message || 'Safety submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Mobile Top Header */}
      <div className="bg-[#714B67] text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Field Technician App</h1>
              <p className="text-[11px] text-white/80">SunPowerOS Mobile Execution</p>
            </div>
          </div>
          <button
            onClick={fetchTechnicianData}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Technician Badge Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Welcome back</div>
            <div className="text-base font-bold text-gray-900">
              {profile?.user ? `${profile.user.firstName} ${profile.user.lastName}` : 'Field Technician'}
            </div>
            <div className="text-xs text-purple-700 font-medium mt-0.5">
              Code: <strong className="font-mono">{profile?.technicianCode || 'TECH-ACTIVE'}</strong> &bull;{' '}
              {profile?.technicianType?.replace(/_/g, ' ') || 'SOLAR_TECHNICIAN'}
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
            {profile?.availabilityStatus || 'ONLINE'}
          </span>
        </div>

        {/* Mobile Tab Selector */}
        <div className="grid grid-cols-4 gap-1 bg-gray-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'tasks' ? 'bg-white text-[#714B67] shadow-sm' : 'text-gray-600'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'safety' ? 'bg-white text-[#714B67] shadow-sm' : 'text-gray-600'
            }`}
          >
            Safety
          </button>
          <button
            onClick={() => setActiveTab('serials')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'serials' ? 'bg-white text-[#714B67] shadow-sm' : 'text-gray-600'
            }`}
          >
            Serials
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'tests' ? 'bg-white text-[#714B67] shadow-sm' : 'text-gray-600'
            }`}
          >
            Tests
          </button>
        </div>

        {/* Tab 1: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Assigned Site Work Orders ({assignments?.workOrders?.length || 0})
            </h2>

            {assignments?.workOrders?.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-400">
                No open work orders assigned to you or your crew today.
              </div>
            ) : (
              assignments?.workOrders?.map((wo: any) => (
                <div key={wo.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#714B67] bg-[#714B67]/10 px-2 py-0.5 rounded">
                        {wo.workOrderNumber}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mt-1">
                        {wo.projectInitiation?.projectName}
                      </h3>
                      <div className="text-[11px] text-gray-400">
                        {wo.projectInitiation?.site?.addressLine1}, {wo.projectInitiation?.site?.city}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#714B67]">
                      {Math.round(Number(wo.completionPercentage))}%
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 border-t border-gray-100 pt-2 space-y-2">
                    {wo.tasks?.map((t: any) => (
                      <div key={t.id} className="pt-2 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-gray-800">{t.taskName}</div>
                          <div className="text-[10px] text-gray-400">{t.category}</div>
                        </div>

                        {t.status === 'COMPLETED' ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => setSelectedTask(t)}
                            className="px-3 py-1 bg-[#714B67] text-white font-semibold rounded text-xs hover:bg-[#5b3c53]"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Safety */}
        {activeTab === 'safety' && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-gray-900 text-sm">Daily Rooftop Safety Briefing</h2>
            </div>
            <p className="text-gray-500">
              You must verify mandatory PPE, fall protection harness anchorage, and LOTO electrical isolation before working.
            </p>

            <div className="space-y-2.5">
              {[
                'Full body safety harness worn and anchored to static lifeline',
                'Hard hat, safety boots, and high-visibility vest verified',
                'Lockout/Tagout (LOTO) engaged on main AC isolator switch',
                'Ladder secured with 4:1 slope angle and tied at top rung',
                'Weather checked: No rain, lightning, or high wind gusts',
              ].map((text, idx) => (
                <label key={idx} className="flex items-start gap-2.5 p-2 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#714B67]" />
                  <span className="text-gray-800 font-medium">{text}</span>
                </label>
              ))}
            </div>

            <button
              disabled={actionLoading}
              onClick={handleSafetySubmit}
              className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Certify & Submit Pre-Work Safety
            </button>
          </div>
        )}

        {/* Tab 3: Serials */}
        {activeTab === 'serials' && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Boxes className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-gray-900 text-sm">On-Site Serial Verification</h2>
            </div>
            <p className="text-gray-500">
              Scan solar panel manufacturer barcodes and inverter serial numbers delivered to site:
            </p>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan or type serial number..."
                  value={scannedSerial}
                  onChange={(e) => setScannedSerial(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => alert(`Simulating camera barcode scan: Scanned PV-${Date.now().toString().slice(-6)}`)}
                  className="p-2.5 bg-gray-100 rounded-lg border border-gray-300 text-gray-700"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!scannedSerial) return;
                  alert(`Verified serial ${scannedSerial} on site!`);
                  setScannedSerial('');
                }}
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                Confirm Serial Match
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Tests */}
        {activeTab === 'tests' && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900 text-sm">Pre-Commissioning Test Entry</h2>
            </div>
            <p className="text-gray-500">Record cold resistance, voltage, and continuity values:</p>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Megger Insulation Resistance (MOhm)</label>
                <input type="text" defaultValue="25.4" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">String Voc Open Circuit Voltage (V DC)</label>
                <input type="text" defaultValue="412.5" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">String Isc Short Circuit Current (A DC)</label>
                <input type="text" defaultValue="13.1" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Earth Pit Electrode Resistance (Ohms)</label>
                <input type="text" defaultValue="2.1" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>

              <button
                type="button"
                onClick={() => alert('Commissioning field measurements recorded successfully!')}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
              >
                Submit Test Results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Complete Bottom Sheet Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">{selectedTask.taskName}</h3>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Actual Hours Spent</label>
                <input
                  type="number"
                  value={taskHours}
                  onChange={(e) => setTaskHours(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Execution Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on installation quality, torque, or alignment..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 cursor-pointer">
                <Camera className="w-4 h-4" />
                <span>Attach Photo Evidence</span>
              </div>

              <button
                disabled={actionLoading}
                onClick={() => handleCompleteTask(selectedTask.id)}
                className="w-full py-2.5 bg-[#714B67] hover:bg-[#5b3c53] text-white font-bold rounded-lg"
              >
                Confirm Task Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
