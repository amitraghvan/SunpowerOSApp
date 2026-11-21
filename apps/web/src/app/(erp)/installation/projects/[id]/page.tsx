'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import {
  Sun,
  HardHat,
  Calendar,
  Wrench,
  Boxes,
  ShieldAlert,
  Zap,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Play,
  FileText,
  Clock,
  ShieldCheck,
  UserCheck,
  Award,
} from 'lucide-react';

export default function ProjectInstallationWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal / Form States
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newVisitType, setNewVisitType] = useState('PRE_INSTALLATION');
  const [exceptionReason, setExceptionReason] = useState('');
  const [stopWorkReason, setStopWorkReason] = useState('');
  const [reworkNotes, setReworkNotes] = useState('');
  const [punchlistDesc, setPunchlistDesc] = useState('');
  const [punchlistSeverity, setPunchlistSeverity] = useState('MINOR');
  const [costAmount, setCostAmount] = useState('');
  const [costCategory, setCostCategory] = useState('LABOR');
  const [costVendor, setCostVendor] = useState('');

  const fetchProjectData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await ApiClient.getInstallationProjectById(projectId);
      setProject(data);
    } catch (err: any) {
      console.error('Failed to load project details:', err);
      setErrorMsg(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Quick Action Handlers
  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      await ApiClient.updateInstallationProjectStatus(projectId, { status: newStatus });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthorizeException = async (recordId: string) => {
    if (!exceptionReason.trim()) {
      alert('Please enter exception reason');
      return;
    }
    setActionLoading(true);
    try {
      await ApiClient.authorizeSiteReadinessException(recordId, { exceptionReason });
      setExceptionReason('');
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Authorization failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReadiness = async (recordId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.approveSiteReadiness(recordId);
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Readiness approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    setActionLoading(true);
    try {
      await ApiClient.createInstallationWorkOrder({
        projectInitiationId: projectId,
        priority: 'HIGH',
      });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to create work order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.updateInstallationTaskStatus(taskId, {
        status: 'COMPLETED',
        actualHours: 8,
      });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateMaterialHandover = async () => {
    setActionLoading(true);
    try {
      // Find matching dispatch order if any
      const dispatchId = project?.dispatchOrders?.[0]?.id;
      await ApiClient.createMaterialHandover({
        projectInitiationId: projectId,
        dispatchOrderId: dispatchId,
        receiverRole: 'SITE_SUPERVISOR',
      });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to initiate material custody handover');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptMaterialCustody = async (handoverId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.acceptMaterialHandover(handoverId, {
        siteLocationNotes: 'Rooftop staging area verified safe & dry',
      });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Acceptance failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueStopWork = async (safetyId: string) => {
    if (!stopWorkReason.trim()) {
      alert('Please state the safety stop-work reason');
      return;
    }
    setActionLoading(true);
    try {
      await ApiClient.issueStopWork(safetyId, { stopWorkReason });
      setStopWorkReason('');
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to issue stop work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLiftStopWork = async (safetyId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.liftStopWork(safetyId, { resolutionNotes: 'Safety violation corrected and cleared by supervisor' });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to lift stop work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCommissioning = async (commissioningId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.approveCommissioning(commissioningId, { notes: 'All electrical tests certified by commissioning engineer' });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Commissioning approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPunchlist = async (handoverId: string) => {
    if (!punchlistDesc.trim()) return;
    setActionLoading(true);
    try {
      await ApiClient.addPunchlistItem(handoverId, {
        description: punchlistDesc,
        severity: punchlistSeverity,
      });
      setPunchlistDesc('');
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to add punchlist item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolvePunchlist = async (punchlistId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.resolvePunchlistItem(punchlistId, { resolutionNotes: 'Corrected and verified with customer rep' });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve punchlist item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOffHandover = async (handoverId: string) => {
    setActionLoading(true);
    try {
      await ApiClient.signOffCustomerHandover(handoverId, {
        customerSatisfactionScore: 5,
        customerSignatureUrl: 'https://cdn.solaros.erp/signatures/cust-signed.png',
        warrantyPeriodMonths: 60,
      });
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Handover sign-off failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCost = async () => {
    if (!costAmount) return;
    setActionLoading(true);
    try {
      await ApiClient.createProjectCost({
        projectInitiationId: projectId,
        amount: Number(costAmount),
        costCategory,
        vendorName: costVendor,
      });
      setCostAmount('');
      setCostVendor('');
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to record cost');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#714B67] mb-3" />
        <p className="text-sm font-medium">Loading project execution workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-red-600 bg-white m-6 rounded-xl border border-red-200">
        Project not found.
      </div>
    );
  }

  const latestReadiness = project.siteReadinessRecords?.[0];
  const activeWorkOrder = project.workOrders?.[0];
  const latestHandover = project.materialHandovers?.[0];
  const activeSafety = project.safetyRecords?.[0];
  const latestQuality = project.qualityInspections?.[0];
  const latestCommissioning = project.commissioningRecords?.[0];
  const latestUtility = project.utilityTrackings?.[0];
  const latestCustomerHandover = project.customerHandovers?.[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/installation" className="hover:text-gray-900">
              Execution Cockpit
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/installation/projects" className="hover:text-gray-900">
              Projects
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-mono font-medium">{project.projectCode}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
            <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
              {project.installationStatus?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Customer: <strong className="text-gray-800">{project.customer?.name}</strong> &bull; Site:{' '}
            <strong className="text-gray-800">{project.site?.siteName}</strong> ({project.site?.city},{' '}
            {project.site?.state}) &bull; Capacity:{' '}
            <strong className="text-gray-800">{Number(project.systemCapacityKw)} kW</strong> ({project.systemType})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjectData}
            disabled={actionLoading}
            className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Workspace Navigation Tabs (12 Subsystems) */}
      <div className="flex border-b border-gray-200 overflow-x-auto space-x-1 text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview', icon: Sun },
          { id: 'crews', label: 'Technicians & Crew', icon: HardHat },
          { id: 'schedules', label: 'Schedules', icon: Calendar },
          { id: 'readiness', label: 'Site Readiness', icon: ShieldCheck },
          { id: 'workorders', label: 'Work Orders', icon: Wrench },
          { id: 'material', label: 'Material Custody', icon: Boxes },
          { id: 'safety', label: 'Safety & Incidents', icon: ShieldAlert },
          { id: 'quality', label: 'Quality Inspection', icon: Award },
          { id: 'commissioning', label: 'Commissioning', icon: Zap },
          { id: 'discom', label: 'DISCOM / Subsidy', icon: FileSpreadsheet },
          { id: 'handover', label: 'Customer Handover', icon: CheckCircle2 },
          { id: 'costs', label: 'Execution Costs', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#714B67] text-[#714B67] font-bold bg-[#714B67]/5 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                Project Technical & Commercial Parameters
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-gray-400">System Capacity</div>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">{Number(project.systemCapacityKw)} kW</div>
                </div>
                <div>
                  <div className="text-gray-400">System Type</div>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">{project.systemType}</div>
                </div>
                <div>
                  <div className="text-gray-400">Assigned Crew</div>
                  <div className="font-bold text-purple-700 text-sm mt-0.5">
                    {project.assignedCrew?.crewName || 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Project Manager</div>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">
                    {project.projectManager
                      ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
                      : 'None'}
                  </div>
                </div>
              </div>
            </div>

            {/* Subsystem Readiness Matrix */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-gray-900">Execution Phase Progress Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-700">Site Readiness</div>
                  <div className="mt-1 font-bold text-indigo-700">
                    {latestReadiness?.overallStatus || 'PENDING'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-700">Work Orders Progress</div>
                  <div className="mt-1 font-bold text-amber-700">
                    {activeWorkOrder ? `${Math.round(Number(activeWorkOrder.completionPercentage))}%` : 'Not Started'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-700">Material Custody</div>
                  <div className="mt-1 font-bold text-teal-700">
                    {latestHandover?.status || 'NOT_INITIATED'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-700">Safety Status</div>
                  <div className="mt-1 font-bold text-blue-700">
                    {activeSafety?.status || 'CLEARED'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-700">Commissioning Gate</div>
                  <div className="mt-1 font-bold text-emerald-700">
                    {latestCommissioning?.status || 'PENDING'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-700">Customer Handover</div>
                  <div className="mt-1 font-bold text-purple-700">
                    {latestCustomerHandover?.status || 'PENDING'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Lifecycle Status Switcher */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Execution Status Controls
            </h2>
            <div className="space-y-2 text-xs">
              {[
                'READY_FOR_INSTALLATION',
                'READY_FOR_EXECUTION',
                'INSTALLATION_IN_PROGRESS',
                'INSTALLATION_COMPLETED',
                'COMMISSIONING_PENDING',
                'COMMISSIONED',
                'CUSTOMER_HANDOVER_PENDING',
                'COMPLETED',
                'ON_HOLD',
              ].map((status) => (
                <button
                  key={status}
                  disabled={actionLoading || project.installationStatus === status}
                  onClick={() => handleUpdateStatus(status)}
                  className={`w-full py-2 px-3 text-left rounded-lg font-medium transition-colors flex items-center justify-between ${
                    project.installationStatus === status
                      ? 'bg-[#714B67] text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{status.replace(/_/g, ' ')}</span>
                  {project.installationStatus === status && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Technicians & Crew */}
      {activeTab === 'crews' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Assigned Installation Crew</h2>
              <p className="text-xs text-gray-500">
                On-site execution team assigned to mount structures, lay wiring, and test inverters
              </p>
            </div>
            <Link
              href="/installation/technicians"
              className="text-xs text-[#714B67] hover:underline font-medium"
            >
              Manage Crews &rarr;
            </Link>
          </div>

          {project.assignedCrew ? (
            <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-900 text-sm">
                    {project.assignedCrew.crewName} ({project.assignedCrew.crewCode})
                  </span>
                  <div className="text-xs text-purple-700">
                    Leader:{' '}
                    <strong>
                      {project.assignedCrew.crewLeader?.firstName} {project.assignedCrew.crewLeader?.lastName}
                    </strong>{' '}
                    ({project.assignedCrew.crewLeader?.phone || 'No phone'})
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-800 border border-purple-200">
                  {project.assignedCrew.status}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Crew Members Roster ({project.assignedCrew.members?.length || 0})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {project.assignedCrew.members?.map((m: any) => (
                    <div key={m.id} className="p-3 bg-white rounded-lg border border-gray-200 text-xs">
                      <div className="font-bold text-gray-900">
                        {m.technicianProfile?.user?.firstName} {m.technicianProfile?.user?.lastName}
                      </div>
                      <div className="text-gray-500">
                        {m.technicianProfile?.technicianCode} &bull; {m.roleInCrew}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        Phone: {m.technicianProfile?.phone || m.technicianProfile?.user?.phone || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-lg">
              No crew assigned to this project yet. Please assign an active crew in Technicians & Crews management.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Schedules */}
      {activeTab === 'schedules' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Site Execution Schedules & Visits</h2>
              <p className="text-xs text-gray-500">
                Scheduled mobilization, structure installation, commissioning tests, and customer handovers
              </p>
            </div>
            <Link
              href="/installation/schedules"
              className="text-xs text-[#714B67] hover:underline font-medium"
            >
              Full Calendar &rarr;
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {project.installationSchedules?.length === 0 ? (
              <div className="py-8 text-center text-gray-400">No scheduled visits recorded yet.</div>
            ) : (
              project.installationSchedules?.map((s: any) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#714B67] mr-2">{s.scheduleCode}</span>
                    <span className="font-semibold text-gray-900">{s.visitType?.replace(/_/g, ' ')}</span>
                    <div className="text-gray-400 mt-0.5">
                      {new Date(s.scheduledDate).toLocaleDateString()} {s.startTime && `at ${s.startTime}`}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Site Readiness */}
      {activeTab === 'readiness' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Pre-Installation Site Readiness Checklist</h2>
              <p className="text-xs text-gray-500">
                12-point mandatory verification gate. Execution cannot begin until all mandatory checks pass or supervisor authorizes exception.
              </p>
            </div>
            {latestReadiness && (
              <div className="flex items-center gap-2">
                {latestReadiness.overallStatus !== 'APPROVED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApproveReadiness(latestReadiness.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Approve Readiness
                  </button>
                )}
              </div>
            )}
          </div>

          {latestReadiness ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-gray-800">{latestReadiness.readinessCode}</span> &bull; Inspected by:{' '}
                  <strong>{latestReadiness.inspectedBy?.firstName} {latestReadiness.inspectedBy?.lastName}</strong>
                </div>
                <span
                  className={`px-2.5 py-0.5 font-bold rounded-full text-xs ${
                    latestReadiness.overallStatus.includes('APPROVED')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {latestReadiness.overallStatus}
                </span>
              </div>

              {/* 12 Checklist Items */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {latestReadiness.checks?.map((c: any) => (
                  <div key={c.id} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-2.5">
                      {c.status === 'PASS' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {c.description}{' '}
                          {c.isMandatory && <span className="text-red-500 font-bold">*Mandatory</span>}
                        </div>
                        {c.remarks && <div className="text-gray-400 text-[11px]">{c.remarks}</div>}
                      </div>
                    </div>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        c.status === 'PASS' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Controlled Supervisor Exception Panel */}
              {latestReadiness.overallStatus === 'REJECTED' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Authorize Controlled Supervisor Exception
                  </div>
                  <p className="text-xs text-amber-700">
                    Mandatory items failed. If site conditions permit safe work under documented mitigation controls, an authorized supervisor may grant an exception.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Specify mitigation notes & exception justification..."
                      value={exceptionReason}
                      onChange={(e) => setExceptionReason(e.target.value)}
                      className="flex-1 text-xs bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:outline-none"
                    />
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAuthorizeException(latestReadiness.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg"
                    >
                      Grant Exception & Proceed
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No site readiness record created yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Work Orders & Tasks */}
      {activeTab === 'workorders' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Installation Work Orders (IWO)</h2>
              <p className="text-xs text-gray-500">
                Execution work order governing the 9 standard solar installation tasks
              </p>
            </div>
            {!activeWorkOrder && (
              <button
                disabled={actionLoading}
                onClick={handleCreateWorkOrder}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] rounded-lg hover:bg-[#5b3c53]"
              >
                + Create Work Order
              </button>
            )}
          </div>

          {activeWorkOrder ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-sm text-[#714B67]">
                    {activeWorkOrder.workOrderNumber}
                  </span>
                  <div className="text-xs text-gray-500 mt-0.5">{activeWorkOrder.workScope}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Tasks Completed</div>
                    <div className="font-bold text-gray-900 text-sm">
                      {activeWorkOrder.completedTasks} / {activeWorkOrder.totalTasks}
                    </div>
                  </div>
                  <div className="w-28 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#714B67] h-full"
                      style={{ width: `${Number(activeWorkOrder.completionPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {activeWorkOrder.tasks?.map((t: any) => (
                  <div key={t.id} className="p-3.5 flex items-center justify-between text-xs bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[11px] text-gray-700">
                        {t.sequenceOrder}
                      </span>
                      <div>
                        <div className="font-bold text-gray-900">{t.taskName}</div>
                        <div className="text-[11px] text-gray-400">
                          Category: {t.category} &bull; Planned: {Number(t.plannedHours || 0)} hrs
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          t.status === 'COMPLETED'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {t.status}
                      </span>
                      {t.status !== 'COMPLETED' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCompleteTask(t.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#714B67] rounded hover:bg-[#5b3c53]"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No work order generated yet for this project.
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Material Custody */}
      {activeTab === 'material' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Project Site Material Custody (MHO)</h2>
              <p className="text-xs text-gray-500">
                Verification of solar panels, inverters, and BOS dispatched from warehouse.
                <strong className="text-teal-700 ml-1">Zero double inventory deduction.</strong>
              </p>
            </div>
            {!latestHandover && (
              <button
                disabled={actionLoading}
                onClick={handleCreateMaterialHandover}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] rounded-lg hover:bg-[#5b3c53]"
              >
                + Initiate Material Custody
              </button>
            )}
          </div>

          {latestHandover ? (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-teal-900">{latestHandover.handoverNumber}</span> &bull; Status:{' '}
                  <span className="font-bold text-teal-800">{latestHandover.status}</span>
                </div>
                {latestHandover.status !== 'ACCEPTED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAcceptMaterialCustody(latestHandover.id)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg"
                  >
                    Accept Site Custody
                  </button>
                )}
              </div>

              {/* Handover Lines */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {latestHandover.lines?.map((l: any) => (
                  <div key={l.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <div className="font-bold text-gray-900">{l.productVariant?.name || l.productVariantId}</div>
                      <div className="text-[11px] text-gray-400">SKU: {l.productVariant?.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">Expected: {Number(l.expectedQuantity)}</div>
                      <div className="text-[11px] text-teal-700">Verified: {Number(l.verifiedQuantity || l.expectedQuantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No material custody record created yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Safety & Quality */}
      {activeTab === 'safety' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Installation Safety Review & Stop-Work Controls</h2>
              <p className="text-xs text-gray-500">
                Pre-work daily safety briefing, PPE audits, and formal stop-work controls
              </p>
            </div>
          </div>

          {activeSafety ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  activeSafety.status === 'STOP_WORK'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div>
                  <span className="font-bold text-gray-900">{activeSafety.safetyNumber}</span> &bull; Topic:{' '}
                  <span className="italic">{activeSafety.toolboxTopic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      activeSafety.status === 'STOP_WORK'
                        ? 'bg-red-200 text-red-900'
                        : 'bg-green-200 text-green-900'
                    }`}
                  >
                    {activeSafety.status}
                  </span>

                  {activeSafety.status === 'STOP_WORK' ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleLiftStopWork(activeSafety.id)}
                      className="px-3 py-1 bg-green-700 hover:bg-green-800 text-white font-semibold rounded text-xs"
                    >
                      Lift Stop-Work
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Stop-work reason..."
                        value={stopWorkReason}
                        onChange={(e) => setStopWorkReason(e.target.value)}
                        className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        disabled={actionLoading}
                        onClick={() => handleIssueStopWork(activeSafety.id)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-xs"
                      >
                        Issue Stop-Work
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety Checklist Items */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {activeSafety.checklistItems?.map((i: any) => (
                  <div key={i.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-800">{i.description}</span>
                    </div>
                    <span className="font-bold text-green-700 text-[11px] bg-green-50 px-2 py-0.5 rounded">
                      {i.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No daily safety review logged for this project yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Quality Inspection */}
      {activeTab === 'quality' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Stage-Gate Quality Inspections (IQI)</h2>
              <p className="text-xs text-gray-500">
                Mechanical torque, electrical wiring clearances, and earthing pit resistance checks
              </p>
            </div>
          </div>

          {latestQuality ? (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900">{latestQuality.inspectionNumber}</span> &bull; Stage:{' '}
                  <strong>{latestQuality.stage}</strong>
                </div>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-xs ${
                    latestQuality.overallResult === 'PASS'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {latestQuality.overallResult}
                </span>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {latestQuality.items?.map((it: any) => (
                  <div key={it.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <div className="font-bold text-gray-900">{it.checkpointName}</div>
                      <div className="text-[11px] text-gray-400">Criteria: {it.toleranceCriteria}</div>
                    </div>
                    <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded text-[11px]">
                      {it.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No quality inspection logged yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Testing & Commissioning */}
      {activeTab === 'commissioning' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">System Testing & Technical Commissioning (COM)</h2>
              <p className="text-xs text-gray-500">
                Megger insulation, Voc, Isc, and anti-islanding tests. Mandatory tests strictly gate commissioning sign-off.
              </p>
            </div>
            {latestCommissioning && latestCommissioning.status !== 'APPROVED' && (
              <button
                disabled={actionLoading}
                onClick={() => handleApproveCommissioning(latestCommissioning.id)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                Approve & Certify Commissioning
              </button>
            )}
          </div>

          {latestCommissioning ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-emerald-900 text-sm">
                    {latestCommissioning.commissioningNumber}
                  </span>
                  <div className="text-xs text-emerald-700 mt-1">
                    Grid Voltage: <strong>{Number(latestCommissioning.gridVoltageObserved)} V</strong> &bull; Frequency:{' '}
                    <strong>{Number(latestCommissioning.gridFrequencyObserved)} Hz</strong> &bull; AC Output:{' '}
                    <strong>{Number(latestCommissioning.acPowerOutputKw)} kW</strong>
                  </div>
                </div>
                <span
                  className={`font-bold px-3 py-1 rounded-full text-xs ${
                    latestCommissioning.status === 'APPROVED'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-yellow-200 text-yellow-900'
                  }`}
                >
                  {latestCommissioning.status}
                </span>
              </div>

              {/* Commissioning Test Results */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {latestCommissioning.tests?.map((t: any) => (
                  <div key={t.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <div className="font-bold text-gray-900">
                        {t.testName} {t.isMandatory && <span className="text-red-500">*Mandatory</span>}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Expected: {t.expectedValue} &bull; Measured: <strong className="text-gray-800">{t.measuredValue}</strong>
                      </div>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
                        t.testResult === 'PASS' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {t.testResult}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No technical commissioning record submitted yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 10: DISCOM & Net-Metering */}
      {activeTab === 'discom' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">DISCOM & Net-Metering Progress</h2>
              <p className="text-xs text-gray-500">
                Distribution utility application, feasibility clearance, bi-directional net meter installation & PM Surya Ghar subsidy
              </p>
            </div>
          </div>

          {latestUtility ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400">DISCOM Utility</div>
                  <div className="font-bold text-gray-900 mt-0.5">{latestUtility.discomName}</div>
                </div>
                <div>
                  <div className="text-gray-400">Consumer Number</div>
                  <div className="font-mono font-bold text-gray-900 mt-0.5">{latestUtility.consumerNumber}</div>
                </div>
                <div>
                  <div className="text-gray-400">Sanctioned Load</div>
                  <div className="font-bold text-gray-900 mt-0.5">{Number(latestUtility.sanctionedLoadKw)} kW</div>
                </div>
                <div>
                  <div className="text-gray-400">Net Meter Serial</div>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">
                    {latestUtility.netMeterSerialNumber || 'Pending Inspection'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <div className="font-bold text-blue-900">PM Surya Ghar Subsidy Claim Status</div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Registration ID: {latestUtility.subsidyPortalRegistrationId || 'N/A'}</span>
                  <span className="font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded text-xs">
                    {latestUtility.subsidyClaimStatus}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No DISCOM tracking record initialized for this project.
            </div>
          )}
        </div>
      )}

      {/* Tab 11: Customer Handover */}
      {activeTab === 'handover' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Customer Handover & Sign-Off (CHO)</h2>
              <p className="text-xs text-gray-500">
                Punchlist clearance, satisfaction rating, and final project sign-off
              </p>
            </div>
            {latestCustomerHandover && latestCustomerHandover.status !== 'COMPLETED' && (
              <button
                disabled={actionLoading}
                onClick={() => handleSignOffHandover(latestCustomerHandover.id)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 rounded-lg hover:bg-purple-800 shadow-sm"
              >
                Sign Off & Complete Project
              </button>
            )}
          </div>

          {latestCustomerHandover ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/40 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-900">{latestCustomerHandover.handoverNumber}</span> &bull; Rep:{' '}
                  <strong>{latestCustomerHandover.customerRepName}</strong> ({latestCustomerHandover.customerRepPhone})
                </div>
                <span
                  className={`font-bold px-3 py-1 rounded-full text-xs ${
                    latestCustomerHandover.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {latestCustomerHandover.status}
                </span>
              </div>

              {/* Punchlist items */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700">Punchlist Items ({latestCustomerHandover.punchlistItems?.length || 0})</div>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                  {latestCustomerHandover.punchlistItems?.map((pi: any) => (
                    <div key={pi.id} className="p-3 flex items-center justify-between text-xs bg-white">
                      <div>
                        <div className="font-semibold text-gray-900">{pi.description}</div>
                        <div className="text-[11px] text-gray-400">Severity: {pi.severity} &bull; Category: {pi.category}</div>
                      </div>
                      <div>
                        {pi.isResolved ? (
                          <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-[11px]">
                            Resolved
                          </span>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleResolvePunchlist(pi.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#714B67] rounded hover:bg-[#5b3c53]"
                          >
                            Resolve Item
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add punchlist form */}
                {latestCustomerHandover.status !== 'COMPLETED' && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add punchlist item description..."
                      value={punchlistDesc}
                      onChange={(e) => setPunchlistDesc(e.target.value)}
                      className="flex-1 text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                    <select
                      value={punchlistSeverity}
                      onChange={(e) => setPunchlistSeverity(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1.5"
                    >
                      <option value="MINOR">Minor</option>
                      <option value="MAJOR">Major</option>
                    </select>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAddPunchlist(latestCustomerHandover.id)}
                      className="px-3 py-1.5 bg-[#714B67] text-white text-xs font-semibold rounded hover:bg-[#5b3c53]"
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No customer handover initiated yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 12: Project Costs */}
      {activeTab === 'costs' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Project Site Execution Cost Records</h2>
              <p className="text-xs text-gray-500">
                Track direct expenses for site labor, travel, scaffolding rental, and consumables
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input
                type="number"
                placeholder="Amount (₹)"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                className="w-32 bg-white border border-gray-300 rounded px-2.5 py-1.5"
              />
              <select
                value={costCategory}
                onChange={(e) => setCostCategory(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2.5 py-1.5"
              >
                <option value="LABOR">Labor</option>
                <option value="TRAVEL_LOGISTICS">Travel & Logistics</option>
                <option value="EQUIPMENT_RENTAL">Equipment Rental</option>
                <option value="SITE_PERMITS">Site Permits</option>
                <option value="MATERIAL_CONSUMABLE">Material Consumables</option>
              </select>
              <input
                type="text"
                placeholder="Vendor / Contractor..."
                value={costVendor}
                onChange={(e) => setCostVendor(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1.5"
              />
              <button
                disabled={actionLoading}
                onClick={handleAddCost}
                className="px-4 py-1.5 bg-[#714B67] hover:bg-[#5b3c53] text-white font-semibold rounded text-xs"
              >
                + Record Cost
              </button>
            </div>

            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
              {project.projectCosts?.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs">No execution costs recorded yet.</div>
              ) : (
                project.projectCosts?.map((c: any) => (
                  <div key={c.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <span className="font-mono font-bold text-[#714B67] mr-2">{c.costRecordNumber}</span>
                      <span className="font-semibold text-gray-800">{c.costCategory}</span>
                      {c.vendorName && <span className="text-gray-400 ml-2">({c.vendorName})</span>}
                    </div>
                    <span className="font-bold text-gray-900">₹{Number(c.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
