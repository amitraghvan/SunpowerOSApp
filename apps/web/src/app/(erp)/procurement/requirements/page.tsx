'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import {
  Boxes,
  Plus,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle,
  FileText,
  FolderKanban,
  Zap,
} from 'lucide-react';

export default function MaterialPlanningWorkbenchPage() {
  const router = useRouter();
  const [mrpRuns, setMrpRuns] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMRPData = async () => {
    setLoading(true);
    try {
      const [runs, prjRes] = await Promise.all([
        ApiClient.getMaterialRequirements().catch(() => []),
        ApiClient.getSalesOrders().catch(() => []),
      ]);
      setMrpRuns(runs || []);
      // Load projects/handoffs
      setProjects(prjRes || []);
    } catch (err: any) {
      console.error('Failed to load MRP data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMRPData();
  }, []);

  const handleGenerateMRP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setCalculating(true);
    setErrorMsg('');
    try {
      await ApiClient.generateMRPFromProject({
        projectInitiationId: selectedProjectId,
      });
      setIsModalOpen(false);
      setSelectedProjectId('');
      fetchMRPData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to calculate MRP from project BOM');
    } finally {
      setCalculating(false);
    }
  };

  const handleConvertToPR = async (mrpId: string) => {
    try {
      await ApiClient.convertMRPToRequisition(mrpId);
      router.push('/procurement/requisitions');
    } catch (err: any) {
      alert(err.message || 'Failed to convert MRP to PR');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#017E84]" />
            Material Requirement Planning (MRP) Workbench
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Automatic net BOM explosion against warehouse stocks, scrap allowances & direct purchase requisition generation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMRPData}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-[#495057] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#017E84] hover:bg-[#015C60] text-white px-3.5 py-2 rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            Run Project MRP Calculation
          </button>
        </div>
      </div>

      {/* MRP Runs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border rounded p-8 text-center text-[#6C757D]">
            Loading material requirement plans...
          </div>
        ) : mrpRuns.length === 0 ? (
          <div className="bg-white border rounded p-12 text-center space-y-3">
            <Boxes className="w-10 h-10 text-[#CED4DA] mx-auto" />
            <div className="font-semibold text-sm text-[#495057]">No MRP Calculation Runs Found</div>
            <p className="text-[#6C757D] max-w-md mx-auto">
              Select an approved Solar Project Initiation to explode its Bill of Materials into net purchase requirements.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#017E84] text-white px-4 py-2 rounded font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Start MRP Run
            </button>
          </div>
        ) : (
          mrpRuns.map((mrp) => (
            <div key={mrp.id} className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-[#F8F9FA] border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#017E84]">{mrp.requirementNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mrp.status === 'CONVERTED_TO_PR'
                        ? 'bg-[#D1E7DD] text-[#0F5132]'
                        : 'bg-[#CFF4FC] text-[#055160]'
                    }`}
                  >
                    {mrp.status}
                  </span>
                  <span className="text-[#6C757D]">
                    Project: <span className="font-semibold text-[#212529]">{mrp.projectInitiation?.projectName || mrp.projectInitiation?.projectCode || 'EPC Solar System'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#212529]">
                    Est. Total: ₹{Number(mrp.estimatedTotalAmount || 0).toLocaleString()}
                  </span>
                  {mrp.status !== 'CONVERTED_TO_PR' && (
                    <button
                      onClick={() => handleConvertToPR(mrp.id)}
                      className="px-3 py-1.5 bg-[#714B67] hover:bg-[#58394F] text-white rounded font-semibold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Convert to Purchase Requisition (PR)
                    </button>
                  )}
                </div>
              </div>

              {/* Lines Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-[#6C757D] bg-white">
                    <th className="py-2 px-3">Item Category</th>
                    <th className="py-2 px-3">Catalogue Product Variant</th>
                    <th className="py-2 px-3">Gross BOM Qty</th>
                    <th className="py-2 px-3">In-Stock / Reserved</th>
                    <th className="py-2 px-3">Net Procurement Qty</th>
                    <th className="py-2 px-3">Est. Unit Rate (₹)</th>
                    <th className="py-2 px-3">Total Estimated (₹)</th>
                    <th className="py-2 px-3">Required By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEE2E6]">
                  {mrp.lines?.map((line: any) => (
                    <tr key={line.id} className="hover:bg-[#F8F9FA]">
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-gray-100 text-[#495057]">
                          {line.itemCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#212529]">{line.productVariant?.name || 'Solar PV Component'}</div>
                        <div className="text-[11px] font-mono text-[#6C757D]">{line.productVariant?.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{Number(line.requiredQuantity)} Nos</td>
                      <td className="py-2.5 px-3 text-[#6C757D]">
                        {Number(line.availableStockQuantity || 0)} / {Number(line.allocatedQuantity || 0)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#0F5132]">
                        {Number(line.netProcurementQuantity)} Nos
                      </td>
                      <td className="py-2.5 px-3">₹{Number(line.estimatedUnitCost).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold">
                        ₹{(Number(line.netProcurementQuantity) * Number(line.estimatedUnitCost)).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[#6C757D]">
                        {new Date(line.requiredDate || Date.now() + 7 * 86400000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Start MRP Run Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#212529]">Run MRP on Solar Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6C757D]">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#F8D7DA] text-[#842029] rounded text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleGenerateMRP} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  Select Project Initiation (Ready for Procurement) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Project Initiation UUID (e.g. from Sales Order Handoff)"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#017E84]"
                />
                <p className="text-[11px] text-[#6C757D] mt-1">
                  The MRP engine reads the approved BOM, computes net deficits, and reserves lead times.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={calculating}
                  className="px-4 py-2 bg-[#017E84] hover:bg-[#015C60] text-white rounded font-semibold disabled:opacity-50"
                >
                  {calculating ? 'Exploding BOM...' : 'Calculate Requirements'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
