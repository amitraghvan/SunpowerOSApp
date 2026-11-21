'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
  Upload,
  RefreshCw,
  Sun,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [surveyDetails, setSurveyDetails] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Scheduling Form
  const [scheduleForm, setScheduleForm] = useState({
    assignedTechnicianId: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
  });

  // Assessment Form
  const [assessmentForm, setAssessmentForm] = useState({
    roofType: 'RCC_FLAT',
    roofAgeYears: 5,
    roofPitchDegrees: 0,
    roofAzimuthDegrees: 180, // South
    roofCondition: 'GOOD',
    usableAreaSqFt: 500,
    shadowObstacles: 'PARAPET_WALL',
    recommendedCapacityKw: 4,

    sanctionedLoadKw: 5,
    currentVoltage: 230,
    phaseType: 'SINGLE_PHASE',
    incomingCableCapacitySqMm: 16,
    cableLengthMeters: 25,
    earthingRequired: true,
    earthResistanceOhms: 3.2,
    lightningArresterRequired: true,
    mainSwitchboardCondition: 'GOOD',
    inverterLocation: 'INDOOR',
    distanceToMainPanelMeters: 10,

    craneRequired: false,
    ladderRequired: false,
    storageAvailableOnSite: true,
    canSupportStructure: true,
    reinforcementRequired: false,
    remarks: 'Clear rooftop with good southern exposure.',
  });

  // Upload Form
  const [uploadCategory, setUploadCategory] = useState('ROOF');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      const res = await ApiClient.getSurveys(params);
      setSurveys(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [statusFilter]);

  const handleSelectSurvey = async (survey: any) => {
    setSelectedSurvey(survey);
    try {
      const full = await ApiClient.getSurveyById(survey.id);
      setSurveyDetails(full);
      const photoList = await ApiClient.getSurveyPhotos(survey.id);
      setPhotos(photoList || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;
    try {
      await ApiClient.scheduleSurvey(selectedSurvey.id, scheduleForm);
      const full = await ApiClient.getSurveyById(selectedSurvey.id);
      setSurveyDetails(full);
      fetchSurveys();
      alert('Survey scheduled successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule');
    }
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;
    try {
      await ApiClient.submitSurveyAssessment(selectedSurvey.id, assessmentForm);
      const full = await ApiClient.getSurveyById(selectedSurvey.id);
      setSurveyDetails(full);
      fetchSurveys();
      alert('Technical assessment recorded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment');
    }
  };

  const handleReview = async (action: 'APPROVE' | 'REQUEST_REVISION') => {
    if (!selectedSurvey) return;
    let reason = '';
    if (action === 'REQUEST_REVISION') {
      const input = prompt('Please enter revision remarks:');
      if (!input) return;
      reason = input;
    }
    try {
      await ApiClient.reviewSurvey(selectedSurvey.id, action, reason);
      const full = await ApiClient.getSurveyById(selectedSurvey.id);
      setSurveyDetails(full);
      fetchSurveys();
      alert(`Survey marked as ${action === 'APPROVE' ? 'APPROVED' : 'REVISION REQUESTED'}`);
    } catch (err: any) {
      alert(err.message || 'Review failed');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSurvey) return;

    setUploadingFile(true);
    try {
      // 1. Request presigned upload URL from API
      const { uploadUrl, objectKey } = await ApiClient.requestPhotoUploadUrl(selectedSurvey.id, {
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        category: uploadCategory,
        caption: uploadCaption,
      });

      // 2. Upload file directly to MinIO using presigned PUT
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
      });

      // 3. Confirm upload with API
      await ApiClient.confirmPhotoUpload(selectedSurvey.id, {
        category: uploadCategory,
        objectKey,
        originalFileName: file.name,
        mimeType: file.type || 'image/jpeg',
        fileSize: file.size,
        caption: uploadCaption,
      });

      // Refresh photos
      const photoList = await ApiClient.getSurveyPhotos(selectedSurvey.id);
      setPhotos(photoList || []);
      setUploadCaption('');
      alert('Photo uploaded and verified successfully!');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleOpenReport = async () => {
    if (!selectedSurvey) return;
    try {
      const data = await ApiClient.getSurveyReport(selectedSurvey.id);
      setReportData(data);
      setIsReportModalOpen(true);
    } catch (err: any) {
      alert('Failed to load report data');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#2563EB]" />
            Site Surveys & Technical Feasibility
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rooftop solar engineering, electrical checks, photo documentation & revision management.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {['ALL', 'REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REVISION_REQUESTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by survey #, customer, or site name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={fetchSurveys}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearch('');
              fetchSurveys();
            }}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Surveys List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading surveys...</div>
        ) : surveys.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900">No surveys found</h3>
            <p className="text-sm text-slate-500 mt-1">Schedule a survey from the Customer 360 or Lead views.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Survey #</th>
                  <th className="px-4 py-3 font-semibold">Customer & Site</th>
                  <th className="px-4 py-3 font-semibold">Schedule Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Evidence</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {surveys.map((surv) => (
                  <tr
                    key={surv.id}
                    onClick={() => handleSelectSurvey(surv)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                      {surv.surveyNumber}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{surv.customer?.name}</div>
                      <div className="text-xs text-slate-400">{surv.site?.siteName} ({surv.site?.city})</div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {surv.scheduledDate ? new Date(surv.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          surv.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : surv.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : surv.status === 'REVISION_REQUESTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {surv.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-slate-400" />
                        {surv._count?.photos || 0} photo(s)
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSurvey(surv);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Assess &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Survey Assessment & Workspace Drawer */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600">{selectedSurvey.surveyNumber}</span>
                <h2 className="text-lg font-bold text-slate-900">
                  {surveyDetails?.customer?.name} — {surveyDetails?.site?.siteName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenReport}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Printable Report
                </button>
                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status and Approval Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Current Status</span>
                    <span className="text-sm font-bold text-slate-800">{surveyDetails?.status}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Revision: <strong>#{surveyDetails?.currentRevisionNumber || 1}</strong>
                  </div>
                </div>

                {surveyDetails?.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                    <strong>Revision Requested:</strong> {surveyDetails.rejectionReason}
                  </div>
                )}

                {/* Review Controls for Lead Engineer / PM */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => handleReview('APPROVE')}
                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Approve Survey & Feasibility
                  </button>
                  <button
                    onClick={() => handleReview('REQUEST_REVISION')}
                    className="px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                  >
                    Request Revision
                  </button>
                </div>
              </div>

              {/* Technical Assessment Form */}
              <form onSubmit={handleSubmitAssessment} className="space-y-6">
                {/* 1. Rooftop Assessment */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    1. Rooftop Technical Assessment
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">Roof Type</label>
                      <select
                        value={assessmentForm.roofType}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, roofType: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="RCC_FLAT">RCC Flat Roof</option>
                        <option value="METAL_SHEET">Industrial Metal Sheet</option>
                        <option value="TILED">Sloped Tiled Roof</option>
                        <option value="GROUND">Ground Mounted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Roof Condition</label>
                      <select
                        value={assessmentForm.roofCondition}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, roofCondition: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="EXCELLENT">Excellent</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor (Needs repair)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Usable Shadow-Free Area (sq.ft.)</label>
                      <input
                        type="number"
                        value={assessmentForm.usableAreaSqFt}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, usableAreaSqFt: parseFloat(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Recommended Solar Capacity (kW)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={assessmentForm.recommendedCapacityKw}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, recommendedCapacityKw: parseFloat(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Azimuth Angle (Degrees)</label>
                      <input
                        type="number"
                        value={assessmentForm.roofAzimuthDegrees}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, roofAzimuthDegrees: parseFloat(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                        placeholder="180 for true south"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Shadow Obstacles</label>
                      <input
                        type="text"
                        value={assessmentForm.shadowObstacles}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, shadowObstacles: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Electrical Grid Assessment */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    2. Electrical & Grid Feasibility
                  </h3>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">Sanctioned Load (kW)</label>
                      <input
                        type="number"
                        value={assessmentForm.sanctionedLoadKw}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, sanctionedLoadKw: parseFloat(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Phase Type</label>
                      <select
                        value={assessmentForm.phaseType}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, phaseType: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="SINGLE_PHASE">Single Phase</option>
                        <option value="THREE_PHASE">Three Phase</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Measured Voltage (V)</label>
                      <input
                        type="number"
                        value={assessmentForm.currentVoltage}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, currentVoltage: parseFloat(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">Cable Run to Main Panel (Meters)</label>
                      <input
                        type="number"
                        value={assessmentForm.cableLengthMeters}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, cableLengthMeters: parseFloat(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Inverter Proposed Location</label>
                      <select
                        value={assessmentForm.inverterLocation}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, inverterLocation: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="INDOOR">Indoor Wall Mount</option>
                        <option value="OUTDOOR">Outdoor Weatherproof</option>
                        <option value="ROOF_TOP">Rooftop Canopy</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assessmentForm.earthingRequired}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, earthingRequired: e.target.checked })}
                      />
                      <span>Dedicated Chemical Earthing Required</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assessmentForm.lightningArresterRequired}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, lightningArresterRequired: e.target.checked })}
                      />
                      <span>Lightning Arrester Required</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Save & Submit Technical Assessment
                  </button>
                </div>
              </form>

              {/* 3. Photographs & Upload Workspace */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    3. Site Photographs (Direct MinIO Upload)
                  </h3>
                  <span className="text-xs text-slate-400">{photos.length} photo(s) on record</span>
                </div>

                {/* Upload controls */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">Photo Category</label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="ROOF">Rooftop View</option>
                        <option value="METER">Electricity Meter & CA</option>
                        <option value="MAIN_SWITCHBOARD">Main Switchboard</option>
                        <option value="INVERTER_LOCATION">Inverter Placement</option>
                        <option value="OBSTACLE">Shadow Obstacle</option>
                        <option value="STRUCTURE">Structure Anchoring</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Caption / Note</label>
                      <input
                        type="text"
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="e.g. South parapet wall shadow"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingFile ? 'Uploading...' : 'Select & Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">Presigned secure direct transfer</span>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                      {photo.downloadUrl ? (
                        <img
                          src={photo.downloadUrl}
                          alt={photo.caption || photo.category}
                          className="w-full h-28 object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-full h-28 bg-slate-100 flex items-center justify-center text-slate-400">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                      <div className="p-2 space-y-0.5">
                        <span className="font-semibold text-slate-800 block truncate">{photo.category}</span>
                        {photo.caption && <p className="text-slate-500 text-[11px] truncate">{photo.caption}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Report Modal */}
      {isReportModalOpen && reportData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">{reportData.reportTitle}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
                >
                  Print PDF
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-sm">
              {/* Report Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">SOLAR EPC TECHNICAL SURVEY REPORT</h2>
                  <p className="text-xs text-slate-500">Document #{reportData.survey.surveyNumber} • Status: {reportData.survey.status}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Date: {new Date(reportData.generatedAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Customer & Site Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <strong className="block text-slate-900 mb-1">Customer Information</strong>
                  <p>{reportData.customer.name}</p>
                  <p>{reportData.customer.phone} | {reportData.customer.email}</p>
                  <p>Customer #{reportData.customer.customerNumber}</p>
                </div>
                <div>
                  <strong className="block text-slate-900 mb-1">Site Location & Utility</strong>
                  <p>{reportData.site.siteName}</p>
                  <p>{reportData.site.address}</p>
                  <p>Sanctioned Load: {reportData.site.sanctionedLoadKw || 'N/A'} kW • DISCOM: {reportData.site.discomName || 'N/A'}</p>
                </div>
              </div>

              {/* Technical Assessment Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Feasibility Engineering Findings</h4>
                <div className="grid grid-cols-3 gap-3 text-xs border border-slate-200 rounded-xl p-4">
                  <div>
                    <span className="text-slate-400 block">Recommended Capacity</span>
                    <span className="font-bold text-blue-600 text-base">{reportData.roofAssessment.recommendedCapacityKw || 0} kW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Usable Roof Area</span>
                    <span className="font-bold text-slate-800 text-base">{reportData.roofAssessment.usableAreaSqFt || 0} sq.ft.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grid Phase</span>
                    <span className="font-bold text-slate-800 text-base">{reportData.electricalAssessment.phaseType}</span>
                  </div>
                </div>
              </div>

              {/* Photo Evidence in Report */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Field Photo Documentation</h4>
                <div className="grid grid-cols-3 gap-3">
                  {reportData.photos.map((p: any) => (
                    <div key={p.id} className="border border-slate-200 rounded p-1 text-center text-xs">
                      {p.downloadUrl && (
                        <img src={p.downloadUrl} alt={p.category} className="w-full h-24 object-cover rounded mb-1" />
                      )}
                      <span className="font-semibold text-slate-700">{p.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
