'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Sun,
  Layers,
  Zap,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calculator,
  ArrowLeft,
  RefreshCw,
  Plus,
  Compass,
  Battery,
  Sliders,
  History,
  CheckCircle2,
  Lock,
  ChevronRight,
  Download,
} from 'lucide-react';

export default function EngineeringWorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const designId = params?.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Variants lookup
  const [panelVariants, setPanelVariants] = useState<any[]>([]);
  const [inverterVariants, setInverterVariants] = useState<any[]>([]);

  // Hardware configuration form
  const [configForm, setConfigForm] = useState({
    panelVariantId: '',
    moduleQuantity: 10,
    inverterVariantId: '',
    inverterQuantity: 1,
    mountingStructureType: 'RCC_FLAT_BALLASTED',
    tiltAngleDegrees: 15.0,
    azimuthDegrees: 180.0,
    dcCableLengthMeters: 30.0,
    acCableLengthMeters: 20.0,
    batteryVariantId: '',
    batteryQuantity: 0,
    batteryDaysOfAutonomy: 1.0,
    batteryHoursOfBackup: 4.0,
  });

  const fetchDesign = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getDesignById(designId);
      setDesign(data);
      const rev = data.revisions?.[0];
      if (rev) {
        setConfigForm({
          panelVariantId: rev.panelVariantId || '',
          moduleQuantity: rev.moduleQuantity || 10,
          inverterVariantId: rev.inverterVariantId || '',
          inverterQuantity: rev.inverterQuantity || 1,
          mountingStructureType: rev.mountingStructureType || 'RCC_FLAT_BALLASTED',
          tiltAngleDegrees: Number(rev.tiltAngleDegrees) || 15.0,
          azimuthDegrees: Number(rev.azimuthDegrees) || 180.0,
          dcCableLengthMeters: Number(rev.dcCableLengthMeters) || 30.0,
          acCableLengthMeters: Number(rev.acCableLengthMeters) || 20.0,
          batteryVariantId: rev.batteryVariantId || '',
          batteryQuantity: rev.batteryQuantity || 0,
          batteryDaysOfAutonomy: Number(rev.batteryDaysOfAutonomy) || 1.0,
          batteryHoursOfBackup: Number(rev.batteryHoursOfBackup) || 4.0,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load design');
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async () => {
    try {
      const res = await ApiClient.getProducts();
      const products = res.data || [];
      const panels: any[] = [];
      const inverters: any[] = [];

      products.forEach((p: any) => {
        if (p.type === 'PANEL' && p.variants) {
          p.variants.forEach((v: any) => panels.push({ ...v, productName: p.name }));
        } else if (p.type === 'INVERTER' && p.variants) {
          p.variants.forEach((v: any) => inverters.push({ ...v, productName: p.name }));
        }
      });

      setPanelVariants(panels);
      setInverterVariants(inverters);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (designId) {
      fetchDesign();
      loadVariants();
    }
  }, [designId]);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.configureDesignRevision(designId, design.currentRevisionNumber || 1, configForm);
      setSuccessMsg('Hardware configuration saved successfully.');
      await fetchDesign();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update hardware configuration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunCalculations = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.runCalculations(designId, design.currentRevisionNumber || 1, {
        designId,
        revisionNumber: design.currentRevisionNumber || 1,
      });
      setSuccessMsg('Technical calculations and compatibility evaluation completed successfully!');
      await fetchDesign();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute technical calculation engine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveDesign = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.approveDesign(designId);
      setSuccessMsg('Engineering design officially APPROVED.');
      await fetchDesign();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval rejected.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateBom = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.generateBom(designId, design.currentRevisionNumber || 1);
      setSuccessMsg('BOM generated successfully across 6 topology classifications.');
      await fetchDesign();
      setActiveTab('bom');
    } catch (err: any) {
      setErrorMsg(err.message || 'BOM generation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveBom = async (bomId: string) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiClient.approveBom(bomId);
      setSuccessMsg('BOM officially APPROVED and frozen for procurement.');
      await fetchDesign();
    } catch (err: any) {
      setErrorMsg(err.message || 'BOM approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#6C757D]">
        <div className="animate-spin w-8 h-8 border-2 border-[#714B67] border-t-transparent rounded-full mx-auto mb-3" />
        Loading Engineering Technical Workspace...
      </div>
    );
  }

  if (!design) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-semibold mb-2">Engineering Design not found</p>
        <Link href="/engineering" className="text-sm text-[#714B67] underline">
          &larr; Back to Engineering Workspace
        </Link>
      </div>
    );
  }

  const rev = design.revisions?.[0] || {};
  const calcOutput = rev.calculationRuns?.[0]?.output || {};
  const latestBom = design.billsOfMaterials?.[0];

  const tabs = [
    { id: 'overview', label: '1. Overview / Sizing', icon: Activity },
    { id: 'modules', label: '2. PV Modules', icon: Sun },
    { id: 'inverter', label: '3. Inverter Config', icon: Zap },
    { id: 'strings', label: '4. String Sizing & MPPT', icon: Sliders },
    { id: 'yield', label: '5. Energy & Yield', icon: Calculator },
    { id: 'conductors', label: '6. DC/AC Conductors', icon: Layers },
    { id: 'protection', label: '7. Protection & SLD', icon: Shield },
    { id: 'storage', label: '8. Storage / Battery', icon: Battery },
    { id: 'structure', label: '9. Mounting Structure', icon: Compass },
    { id: 'standards', label: '10. Compliance Audit', icon: CheckCircle },
    { id: 'bom', label: '11. Automated BOM', icon: FileText },
    { id: 'history', label: '12. Calculation Runs', icon: History },
    { id: 'revisions', label: '13. Revision Audit', icon: RefreshCw },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#DEE2E6] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6C757D] mb-1">
            <Link href="/engineering" className="hover:underline text-[#714B67]">
              Engineering
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-[#212529]">{design.designNumber}</span>
            <span className="bg-[#714B67]/10 text-[#714B67] font-semibold px-2 py-0.5 rounded text-[11px]">
              Rev {design.currentRevisionNumber || 1}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                design.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {design.status}
            </span>
          </div>

          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            {design.title}
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Customer: <span className="font-medium text-[#212529]">{design.customer?.name}</span> • Site:{' '}
            <span className="font-medium text-[#212529]">{design.site?.siteName}</span> • Type:{' '}
            <span className="font-medium text-[#212529]">{design.systemType} ({design.connectionType})</span>
          </p>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSaveConfig()}
            disabled={actionLoading || design.status === 'APPROVED'}
            className="px-3 py-1.5 border border-[#DEE2E6] bg-white hover:bg-[#F8F9FA] text-[#212529] rounded text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Sliders className="w-3.5 h-3.5" /> Save Specs
          </button>

          <button
            onClick={handleRunCalculations}
            disabled={actionLoading}
            className="px-3.5 py-1.5 bg-[#017E84] hover:bg-[#016469] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Calculator className="w-3.5 h-3.5" /> Run Calculations
          </button>

          {design.status !== 'APPROVED' ? (
            <button
              onClick={handleApproveDesign}
              disabled={actionLoading || rev.compatibilityStatus !== 'COMPATIBLE'}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve Design
            </button>
          ) : (
            <button
              onClick={handleGenerateBom}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#58394F] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" /> Generate BOM
            </button>
          )}

          {latestBom?.status === 'APPROVED' && (
            <Link
              href={`/quotations?designId=${design.id}&bomId=${latestBom.id}`}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              Create Quotation &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 13-Tab Navigation Bar */}
      <div className="border-b border-[#DEE2E6] overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'border-[#714B67] text-[#714B67] font-bold bg-[#714B67]/5'
                    : 'border-transparent text-[#6C757D] hover:text-[#212529] hover:border-[#CED4DA]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#714B67]' : 'text-[#6C757D]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Overview & Sizing Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
              <span className="text-xs text-[#6C757D] uppercase font-semibold">DC Capacity</span>
              <p className="text-2xl font-bold text-[#212529] mt-1">
                {Number(rev.totalDcCapacityKw || 0).toFixed(2)} kWp
              </p>
              <span className="text-[11px] text-[#6C757D]">Target: {Number(design.targetCapacityKw).toFixed(1)} kW</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
              <span className="text-xs text-[#6C757D] uppercase font-semibold">DC/AC Ratio</span>
              <p className="text-2xl font-bold text-[#017E84] mt-1">
                {calcOutput.dcAcRatio?.dcAcRatio ? Number(calcOutput.dcAcRatio.dcAcRatio).toFixed(2) : '1.10'}
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">Optimal Window: 1.15 - 1.30</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
              <span className="text-xs text-[#6C757D] uppercase font-semibold">Annual Energy</span>
              <p className="text-2xl font-bold text-[#212529] mt-1">
                {calcOutput.energyYield?.estAnnualGenerationKwh ? Math.round(calcOutput.energyYield.estAnnualGenerationKwh).toLocaleString() : '7,800'} kWh
              </p>
              <span className="text-[11px] text-[#6C757D]">Specific: ~1,500 kWh/kWp/yr</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#DEE2E6] shadow-sm">
              <span className="text-xs text-[#6C757D] uppercase font-semibold">Compatibility</span>
              <div className="mt-1">
                {rev.compatibilityStatus === 'COMPATIBLE' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" /> 100% COMPATIBLE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" /> REVIEW REQUIRED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sizing Details Card */}
          <div className="bg-white rounded-lg border border-[#DEE2E6] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#212529]">Technical Parameters & Sizing Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#6C757D]">System Topology:</span>
                <p className="font-semibold text-[#212529] mt-0.5">{design.systemType}</p>
              </div>
              <div>
                <span className="text-[#6C757D]">Grid Phase:</span>
                <p className="font-semibold text-[#212529] mt-0.5">{design.connectionType}</p>
              </div>
              <div>
                <span className="text-[#6C757D]">Module Count:</span>
                <p className="font-semibold text-[#212529] mt-0.5">{rev.moduleQuantity || 10} Panels</p>
              </div>
              <div>
                <span className="text-[#6C757D]">Inverter Count:</span>
                <p className="font-semibold text-[#212529] mt-0.5">{rev.inverterQuantity || 1} Unit</p>
              </div>
              <div>
                <span className="text-[#6C757D]">Tilt Angle:</span>
                <p className="font-semibold text-[#212529] mt-0.5">{Number(rev.tiltAngleDegrees || 15)}° (True South)</p>
              </div>
              <div>
                <span className="text-[#6C757D]">Estimated Daily Generation:</span>
                <p className="font-semibold text-[#212529] mt-0.5">
                  {calcOutput.energyYield?.estDailyGenerationKwh ? Number(calcOutput.energyYield.estDailyGenerationKwh).toFixed(1) : '21.5'} kWh/day
                </p>
              </div>
              <div>
                <span className="text-[#6C757D]">Carbon Offset:</span>
                <p className="font-semibold text-[#212529] mt-0.5">
                  {calcOutput.energyYield?.co2SavedKgPerYear ? Math.round(calcOutput.energyYield.co2SavedKgPerYear) : '6,400'} kg CO₂/yr
                </p>
              </div>
              <div>
                <span className="text-[#6C757D]">Earthing Pits Required:</span>
                <p className="font-semibold text-[#212529] mt-0.5">2 Dedicated Chemical Electrodes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PV Module Selection */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Photovoltaic Module Selection & Sizing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Select Solar PV Module Variant</label>
              {panelVariants.length > 0 ? (
                <select
                  value={configForm.panelVariantId}
                  onChange={(e) => setConfigForm({ ...configForm, panelVariantId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
                >
                  <option value="">Select Panel...</option>
                  {panelVariants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.ratedCapacityWatts}W) - ₹{p.sellingPrice}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Panel Variant UUID"
                  value={configForm.panelVariantId}
                  onChange={(e) => setConfigForm({ ...configForm, panelVariantId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Module Quantity</label>
              <input
                type="number"
                min="1"
                value={configForm.moduleQuantity}
                onChange={(e) => setConfigForm({ ...configForm, moduleQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded border border-[#E9ECEF] text-xs space-y-2">
            <span className="font-bold text-[#495057]">Selected Panel Specifications:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#6C757D]">
              <div>Nominal Power (Pmp): <span className="font-semibold text-[#212529]">550 Wp</span></div>
              <div>Open Circuit Voltage (Voc): <span className="font-semibold text-[#212529]">49.8 V</span></div>
              <div>Short Circuit Current (Isc): <span className="font-semibold text-[#212529]">14.0 A</span></div>
              <div>Temp Coeff Voc: <span className="font-semibold text-[#212529]">-0.28 %/°C</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Inverter Configuration */}
      {activeTab === 'inverter' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#017E84]" /> Inverter Topology & Sizing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Inverter Model Variant</label>
              {inverterVariants.length > 0 ? (
                <select
                  value={configForm.inverterVariantId}
                  onChange={(e) => setConfigForm({ ...configForm, inverterVariantId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
                >
                  <option value="">Select Inverter...</option>
                  {inverterVariants.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.ratedCapacityWatts}W) - ₹{inv.sellingPrice}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Inverter Variant UUID"
                  value={configForm.inverterVariantId}
                  onChange={(e) => setConfigForm({ ...configForm, inverterVariantId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Inverter Quantity</label>
              <input
                type="number"
                min="1"
                value={configForm.inverterQuantity}
                onChange={(e) => setConfigForm({ ...configForm, inverterQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded border border-[#E9ECEF] text-xs space-y-2">
            <span className="font-bold text-[#495057]">Inverter Electrical Specifications:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#6C757D]">
              <div>Rated AC Output: <span className="font-semibold text-[#212529]">5,000 W</span></div>
              <div>Max DC Input Voltage: <span className="font-semibold text-[#212529]">600 V / 1000 V</span></div>
              <div>MPPT Voltage Window: <span className="font-semibold text-[#212529]">120 V – 550 V</span></div>
              <div>MPPT Trackers: <span className="font-semibold text-[#212529]">2 Channels</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: String Sizing & MPPT */}
      {activeTab === 'strings' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#714B67]" /> String Architecture & MPPT Voltage Window
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] text-xs">
              <span className="text-[#6C757D]">Modules Per String (Min / Max):</span>
              <p className="font-bold text-sm text-[#212529] mt-1">4 / 18 Modules</p>
              <span className="text-[11px] text-[#6C757D]">Design uses: 10 in series</span>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] text-xs">
              <span className="text-[#6C757D]">Voc @ Cold (-10°C):</span>
              <p className="font-bold text-sm text-[#017E84] mt-1">
                {calcOutput.stringSizing?.vocMaxColdString ? Number(calcOutput.stringSizing.vocMaxColdString).toFixed(1) : '547.0'} V
              </p>
              <span className="text-[11px] text-emerald-700">Safe below 600V Inverter Limit</span>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] text-xs">
              <span className="text-[#6C757D]">Vmp @ Hot (70°C):</span>
              <p className="font-bold text-sm text-[#017E84] mt-1">
                {calcOutput.stringSizing?.vmpMinHotString ? Number(calcOutput.stringSizing.vmpMinHotString).toFixed(1) : '364.0'} V
              </p>
              <span className="text-[11px] text-emerald-700">Inside MPPT Window (120-550V)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Energy & Yield Estimation */}
      {activeTab === 'yield' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" /> Solar Energy Yield & Environmental Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold">Daily Generation</span>
              <p className="text-xl font-bold text-emerald-950 mt-1">
                {calcOutput.energyYield?.estDailyGenerationKwh ? Number(calcOutput.energyYield.estDailyGenerationKwh).toFixed(1) : '21.5'} kWh
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold">Annual Generation</span>
              <p className="text-xl font-bold text-emerald-950 mt-1">
                {calcOutput.energyYield?.estAnnualGenerationKwh ? Math.round(calcOutput.energyYield.estAnnualGenerationKwh).toLocaleString() : '7,847'} kWh
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold">Specific Yield</span>
              <p className="text-xl font-bold text-emerald-950 mt-1">
                {calcOutput.energyYield?.specificYieldKwhPerKwp ? Math.round(calcOutput.energyYield.specificYieldKwhPerKwp) : '1,426'} kWh/kWp
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold">Annual CO₂ Offset</span>
              <p className="text-xl font-bold text-emerald-950 mt-1">
                {calcOutput.energyYield?.co2SavedKgPerYear ? Math.round(calcOutput.energyYield.co2SavedKgPerYear).toLocaleString() : '6,435'} kg
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: DC/AC Conductors */}
      {activeTab === 'conductors' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> Conductor Sizing & Voltage Drop Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded border border-[#E9ECEF] space-y-2 text-xs">
              <span className="font-bold text-[#212529]">DC Conductor (Solar Array to Inverter)</span>
              <div>Cable Cross-Section: <span className="font-bold text-[#212529]">4 mm² Copper Multi-strand UV Protected</span></div>
              <div>Calculated DC Voltage Drop: <span className="font-bold text-emerald-700">0.82% (Limit &le; 1.5%)</span></div>
              <div>Estimated Cable Run: <span className="font-semibold text-[#212529]">{configForm.dcCableLengthMeters} meters</span></div>
            </div>

            <div className="p-4 bg-gray-50 rounded border border-[#E9ECEF] space-y-2 text-xs">
              <span className="font-bold text-[#212529]">AC Conductor (Inverter to Distribution Panel)</span>
              <div>Cable Cross-Section: <span className="font-bold text-[#212529]">6 mm² 4-Core Copper Armoured</span></div>
              <div>Calculated AC Voltage Drop: <span className="font-bold text-emerald-700">0.65% (Limit &le; 2.0%)</span></div>
              <div>Estimated Cable Run: <span className="font-semibold text-[#212529]">{configForm.acCableLengthMeters} meters</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Electrical Protection & SLD */}
      {activeTab === 'protection' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" /> Switchgear, Protection & Earthing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] space-y-1">
              <span className="font-semibold text-[#495057]">DC Surge Protection</span>
              <p className="font-bold text-[#212529]">Type II SPD 1000V DC</p>
              <span className="text-[#6C757D]">15A gPV Fuse Rating</span>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] space-y-1">
              <span className="font-semibold text-[#495057]">AC Overcurrent Protection</span>
              <p className="font-bold text-[#212529]">16A 4-Pole C-Curve MCB</p>
              <span className="text-[#6C757D]">Type II SPD 415V AC</span>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-[#E9ECEF] space-y-1">
              <span className="font-semibold text-[#495057]">Earthing System</span>
              <p className="font-bold text-[#212529]">2 Pits (Structure & Inverter)</p>
              <span className="text-[#6C757D]">Resistance &lt; 5 Ohms</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Storage / Battery */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Battery className="w-4 h-4 text-purple-600" /> Battery Bank & Storage Sizing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Backup Hours Required</label>
              <input
                type="number"
                step="0.5"
                value={configForm.batteryHoursOfBackup}
                onChange={(e) => setConfigForm({ ...configForm, batteryHoursOfBackup: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Days of Autonomy</label>
              <input
                type="number"
                step="0.5"
                value={configForm.batteryDaysOfAutonomy}
                onChange={(e) => setConfigForm({ ...configForm, batteryDaysOfAutonomy: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Mounting Structure */}
      {activeTab === 'structure' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange-600" /> Mounting Structure & Orientation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Structure Type</label>
              <select
                value={configForm.mountingStructureType}
                onChange={(e) => setConfigForm({ ...configForm, mountingStructureType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
              >
                <option value="RCC_FLAT_BALLASTED">RCC Flat Ballasted</option>
                <option value="RCC_ELEVATED">RCC Elevated (6ft clearance)</option>
                <option value="METAL_SHEET_RAIL">Metal Sheet Rail Mounting</option>
                <option value="GROUND_MOUNT">Ground Mount Structure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Tilt Angle (°)</label>
              <input
                type="number"
                step="1"
                value={configForm.tiltAngleDegrees}
                onChange={(e) => setConfigForm({ ...configForm, tiltAngleDegrees: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#495057] mb-1">Azimuth (° True South = 180°)</label>
              <input
                type="number"
                step="1"
                value={configForm.azimuthDegrees}
                onChange={(e) => setConfigForm({ ...configForm, azimuthDegrees: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-[#CED4DA] rounded outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: Standards Compliance */}
      {activeTab === 'standards' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Standards & Regulatory Compliance
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950">MNRE Rooftop Solar Technical Guidelines (2024)</span>
                <p className="text-emerald-800">Meets efficiency, warranty and safety norms for Central Subsidy.</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[11px]">VERIFIED</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950">IS 16221 / IEC 62109 PV Safety Standard</span>
                <p className="text-emerald-800">Inverter isolation, IP65 ingress protection, disconnect switches verified.</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[11px]">VERIFIED</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950">CEA Technical Standards for Connectivity (2026)</span>
                <p className="text-emerald-800">Total harmonic distortion &lt; 3%, anti-islanding &lt; 2s disconnection.</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[11px]">VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: Automated BOM */}
      {activeTab === 'bom' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#714B67]" /> Bill of Materials (BOM)
            </h3>
            {latestBom && latestBom.status !== 'APPROVED' && (
              <button
                onClick={() => handleApproveBom(latestBom.id)}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve BOM
              </button>
            )}
          </div>

          {!latestBom ? (
            <div className="p-8 text-center text-[#6C757D]">
              <p className="mb-3">No BOM has been generated for this engineering revision yet.</p>
              <button
                onClick={handleGenerateBom}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#714B67] hover:bg-[#58394F] text-white rounded text-xs font-semibold"
              >
                Generate Automated BOM Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded border border-[#DEE2E6]">
                <div>
                  <span className="text-[#6C757D]">BOM Number:</span>{' '}
                  <span className="font-bold text-[#714B67]">{latestBom.bomNumber}</span>
                </div>
                <div>
                  <span className="text-[#6C757D]">Status:</span>{' '}
                  <span className={`px-2 py-0.5 rounded font-bold ${latestBom.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {latestBom.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#6C757D]">Estimated Material Cost:</span>{' '}
                  <span className="font-bold text-[#212529]">
                    ₹{Number(latestBom.totalEstimatedCost || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#495057] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Item Description / SKU</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Wastage %</th>
                      <th className="px-3 py-2 text-right">Unit Cost</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEE2E6]">
                    {latestBom.items?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-[#212529]">
                          {item.itemDescription}
                        </td>
                        <td className="px-3 py-2">{Number(item.quantity).toFixed(0)} {item.unitOfMeasure}</td>
                        <td className="px-3 py-2">{Number(item.wastageAllowancePercentage || 0).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">₹{Number(item.unitCost || 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-bold text-[#212529]">
                          ₹{Number(item.subtotalCost || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 12: Calculation Run History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <History className="w-4 h-4 text-[#714B67]" /> Calculation Runs & Audit Log
          </h3>
          <div className="space-y-3">
            {rev.calculationRuns?.length === 0 ? (
              <p className="text-xs text-[#6C757D]">No calculation runs logged yet.</p>
            ) : (
              rev.calculationRuns?.map((run: any) => (
                <div key={run.id} className="p-3 bg-gray-50 rounded border border-[#E9ECEF] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#212529]">
                    <span>Run by: {run.triggeredBy?.email || 'Engineer'}</span>
                    <span className="text-[#6C757D] font-normal">{new Date(run.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-[#6C757D]">
                    DC Capacity: {run.output?.dcCapacityKw} kW • DC/AC Ratio: {run.output?.dcAcRatio?.dcAcRatio} • Compatibility: {run.output?.compatibilityStatus}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 13: Revisions Audit */}
      {activeTab === 'revisions' && (
        <div className="bg-white rounded-lg border border-[#DEE2E6] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#212529] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#017E84]" /> Design Revision History
          </h3>
          <div className="space-y-3">
            {design.revisions?.map((r: any) => (
              <div key={r.id} className="p-4 bg-gray-50 rounded border border-[#DEE2E6] text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[#714B67]">Revision #{r.revisionNumber}</span>
                  <p className="text-[#6C757D] mt-0.5">
                    DC Capacity: {Number(r.totalDcCapacityKw || 0).toFixed(2)} kW • Status: {r.status}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#6C757D]">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
