'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

interface Lead {
  id: string;
  leadNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  city: string;
  state: string;
  source: string;
  status: string;
  systemType: string;
  estimatedCapacityKw?: number;
  score: number;
  assignedTo?: { firstName: string; lastName: string };
  createdAt: string;
}

const STAGES = [
  'ALL',
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'SURVEY_PENDING',
  'PROPOSAL_PENDING',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [analytics, setAnalytics] = useState<any>(null);

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadDetails, setLeadDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: 'New Delhi',
    state: 'Delhi',
    source: 'WEBSITE',
    systemType: 'ON_GRID',
    estimatedMonthlyBill: 4000,
    estimatedRoofAreaSqFt: 500,
    estimatedCapacityKw: 3.5,
  });
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Activity Form State
  const [newActivity, setNewActivity] = useState({
    type: 'CALL',
    summary: '',
    details: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedStage !== 'ALL') params.status = selectedStage;
      if (search) params.search = search;
      const res = await ApiClient.getLeads(params);
      setLeads(res.data || []);

      const analyticsRes = await ApiClient.getCrmAnalytics().catch(() => null);
      if (analyticsRes) setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleSelectLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsLoading(true);
    try {
      const full = await ApiClient.getLeadById(lead.id);
      setLeadDetails(full);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCheckDuplicate = async (phone: string, email?: string) => {
    if (!phone || phone.length < 10) {
      setDuplicateWarning(null);
      return;
    }
    try {
      const res = await ApiClient.checkDuplicateLead(phone, email);
      if (res.isDuplicate) {
        setDuplicateWarning(`Potential duplicate detected! Matches existing lead ${res.existingLeadNumber} on ${res.matchingField}.`);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      setDuplicateWarning(null);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createLead(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        city: 'New Delhi',
        state: 'Delhi',
        source: 'WEBSITE',
        systemType: 'ON_GRID',
        estimatedMonthlyBill: 4000,
        estimatedRoofAreaSqFt: 500,
        estimatedCapacityKw: 3.5,
      });
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to create lead');
    }
  };

  const handleStatusChange = async (targetStatus: string, reason?: string) => {
    if (!selectedLead) return;
    try {
      await ApiClient.changeLeadStatus(selectedLead.id, targetStatus, reason);
      const updated = await ApiClient.getLeadById(selectedLead.id);
      setLeadDetails(updated);
      setSelectedLead((prev: any) => ({ ...prev, status: targetStatus }));
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newActivity.summary) return;
    try {
      await ApiClient.addLeadActivity(selectedLead.id, newActivity);
      setNewActivity({ type: 'CALL', summary: '', details: '' });
      const updated = await ApiClient.getLeadById(selectedLead.id);
      setLeadDetails(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to add activity');
    }
  };

  const handleConvertLead = async () => {
    if (!selectedLead) return;
    try {
      const res = await ApiClient.convertLead(selectedLead.id, {
        customerType: 'INDIVIDUAL',
        siteName: `${selectedLead.firstName} ${selectedLead.lastName} Residence`,
      });
      alert(`Lead successfully converted! Customer #${res.customerNumber} created.`);
      setIsConvertModalOpen(false);
      const updated = await ApiClient.getLeadById(selectedLead.id);
      setLeadDetails(updated);
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Conversion failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2563EB]" />
            CRM & Solar Lead Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track inquiries, manage stage transitions, and convert solar prospects into verified customers.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Capture New Lead
        </button>
      </div>

      {/* KPI Stats Row */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalLeads}</div>
            <div className="text-xs text-slate-400 mt-0.5">Active inquiries in pipeline</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">New</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">{analytics.newLeads}</div>
            <div className="text-xs text-slate-400 mt-0.5">Pending first outreach</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Qualified</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{analytics.qualifiedLeads}</div>
            <div className="text-xs text-slate-400 mt-0.5">Feasibility confirmed</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Converted (Won)</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{analytics.wonLeads}</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">{analytics.conversionRatePercent}% Win Rate</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Avg Capacity</span>
            <div className="text-2xl font-bold text-purple-600 mt-1">{analytics.averageDealSizeKw} kW</div>
            <div className="text-xs text-slate-400 mt-0.5">Residential & Small Comm.</div>
          </div>
        </div>
      )}

      {/* Stage Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {STAGES.map((stage) => {
            const isActive = selectedStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {stage.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name, phone, email, lead # or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              fetchLeads();
            }}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Leads Table & Pipeline View */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading solar leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900">No leads found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or capture a new lead.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Lead Info</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">System Specs</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => handleSelectLead(lead)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">{lead.leadNumber}</div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {lead.city}, {lead.state}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {lead.estimatedCapacityKw ? `${lead.estimatedCapacityKw} kW` : 'Custom'}
                        </div>
                        <div className="text-xs text-slate-400">{lead.systemType.replace('_', ' ')}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'WON'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lead.status === 'LOST'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : lead.status === 'NEW'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{lead.score}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {lead.source}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectLead(lead);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50 rounded"
                        >
                          Details &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Side Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600">{selectedLead.leadNumber}</span>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedLead.firstName} {selectedLead.lastName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {isDetailsLoading ? (
                <div className="p-12 text-center text-slate-400">Loading details...</div>
              ) : leadDetails ? (
                <>
                  {/* Status & Quick Transition Bar */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Current Stage</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {leadDetails.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-xs text-slate-500 block mb-2">Available Actions:</span>
                      <div className="flex flex-wrap gap-2">
                        {leadDetails.status === 'NEW' && (
                          <button
                            onClick={() => handleStatusChange('CONTACTED')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                          >
                            Mark Contacted
                          </button>
                        )}
                        {['CONTACTED', 'NEW'].includes(leadDetails.status) && (
                          <button
                            onClick={() => handleStatusChange('QUALIFIED')}
                            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700"
                          >
                            Mark Qualified
                          </button>
                        )}
                        {leadDetails.status === 'QUALIFIED' && (
                          <button
                            onClick={() => handleStatusChange('SURVEY_PENDING')}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700"
                          >
                            Schedule Survey
                          </button>
                        )}
                        {leadDetails.status === 'SURVEY_PENDING' && (
                          <button
                            onClick={() => handleStatusChange('PROPOSAL_PENDING')}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                          >
                            Prepare Proposal
                          </button>
                        )}
                        {['PROPOSAL_PENDING', 'NEGOTIATION'].includes(leadDetails.status) && (
                          <button
                            onClick={() => setIsConvertModalOpen(true)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            Convert to Customer
                          </button>
                        )}
                        {leadDetails.status !== 'LOST' && leadDetails.status !== 'WON' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Please enter reason for losing this lead:');
                              if (reason) handleStatusChange('LOST', reason);
                            }}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100"
                          >
                            Mark Lost
                          </button>
                        )}
                        {leadDetails.status === 'LOST' && (
                          <button
                            onClick={() => handleStatusChange('NEW', 'Reopening lead')}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100"
                          >
                            Reopen Lead
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lead Overview Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block mb-1">Estimated Capacity</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {leadDetails.estimatedCapacityKw ? `${leadDetails.estimatedCapacityKw} kW` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block mb-1">Monthly Electricity Bill</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {leadDetails.estimatedMonthlyBill ? `₹${leadDetails.estimatedMonthlyBill}` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block mb-1">Roof Area</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {leadDetails.estimatedRoofAreaSqFt ? `${leadDetails.estimatedRoofAreaSqFt} sq.ft.` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block mb-1">System Configuration</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {leadDetails.systemType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Customer Conversion Info if Won */}
                  {leadDetails.convertedCustomerId && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <div>
                        <span className="font-bold block">Converted to Customer</span>
                        <span>Customer ID: {leadDetails.convertedCustomerId}</span>
                      </div>
                      <a
                        href={`/customers/${leadDetails.convertedCustomerId}`}
                        className="px-3 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                      >
                        View Customer 360 &rarr;
                      </a>
                    </div>
                  )}

                  {/* Activities & Notes Section */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      Activity Timeline & Follow-Ups
                    </h3>

                    {/* New Activity Input */}
                    <form onSubmit={handleAddActivity} className="p-3 border border-slate-200 rounded-xl space-y-2 bg-slate-50">
                      <div className="flex gap-2">
                        <select
                          value={newActivity.type}
                          onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                          className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="CALL">Call</option>
                          <option value="MEETING">Meeting</option>
                          <option value="EMAIL">Email</option>
                          <option value="NOTE">Note</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Activity summary (e.g. Discussed 5kW subsidy requirement)..."
                          value={newActivity.summary}
                          onChange={(e) => setNewActivity({ ...newActivity, summary: e.target.value })}
                          className="flex-1 px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                        >
                          Post
                        </button>
                      </div>
                    </form>

                    {/* Activity Feed */}
                    <div className="space-y-3">
                      {leadDetails.activities?.map((act: any) => (
                        <div key={act.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-slate-700 uppercase tracking-wider">{act.type}</span>
                            <span>{new Date(act.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="font-medium text-slate-800">{act.summary}</p>
                          {act.details && <p className="text-slate-500 mt-1">{act.details}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Capture Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Capture Solar Lead</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{duplicateWarning}</div>
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, phone: e.target.value });
                      handleCheckDuplicate(e.target.value, createForm.email);
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, email: e.target.value });
                      handleCheckDuplicate(createForm.phone, e.target.value);
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">City *</label>
                  <input
                    required
                    type="text"
                    value={createForm.city}
                    onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">State *</label>
                  <input
                    required
                    type="text"
                    value={createForm.state}
                    onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">System Type</label>
                  <select
                    value={createForm.systemType}
                    onChange={(e) => setCreateForm({ ...createForm, systemType: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="ON_GRID">On-Grid</option>
                    <option value="OFF_GRID">Off-Grid</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Est. kW</label>
                  <input
                    type="number"
                    step="0.5"
                    value={createForm.estimatedCapacityKw}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedCapacityKw: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Bill (₹)</label>
                  <input
                    type="number"
                    value={createForm.estimatedMonthlyBill}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedMonthlyBill: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer Modal */}
      {isConvertModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Convert Lead to Customer</h3>
                <p className="text-xs text-slate-500">
                  This will generate a formal Customer account and initial installation site.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600">
              <div><strong>Name:</strong> {selectedLead.firstName} {selectedLead.lastName}</div>
              <div><strong>Phone:</strong> {selectedLead.phone}</div>
              <div><strong>Location:</strong> {selectedLead.city}, {selectedLead.state}</div>
              <div><strong>System Capacity:</strong> {selectedLead.estimatedCapacityKw || 3} kW ({selectedLead.systemType})</div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertLead}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
              >
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
