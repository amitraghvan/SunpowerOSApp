'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  GitBranch,
  Plus,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function OrganizationsPage() {
  const [activeOrg, setActiveOrg] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Branch form
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchError, setBranchError] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleCode, setInviteRoleCode] = useState('SOLAR_ENGINEER');
  const [inviteBranchId, setInviteBranchId] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccessToken, setInviteSuccessToken] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const me = await ApiClient.getMe();
      if (me?.activeOrganization) {
        setActiveOrg(me.activeOrganization);
        const [b, inv, r] = await Promise.all([
          ApiClient.getBranches(me.activeOrganization.id),
          ApiClient.getInvitations(me.activeOrganization.id),
          ApiClient.getRoles(),
        ]);
        setBranches(b || []);
        setInvitations(inv || []);
        setRoles(r || []);
      }
    } catch (err: any) {
      console.warn('Error loading organization:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setBranchError(null);
    try {
      await ApiClient.createBranch(activeOrg.id, {
        code: branchCode,
        name: branchName,
        city: branchCity,
        state: branchState,
        address: branchAddress || undefined,
      });
      setBranchModalOpen(false);
      setBranchCode('');
      setBranchName('');
      setBranchCity('');
      setBranchState('');
      setBranchAddress('');
      loadData();
    } catch (err: any) {
      setBranchError(err.message || 'Failed to create branch');
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setInviteError(null);
    try {
      const res = await ApiClient.createInvitation(activeOrg.id, {
        email: inviteEmail,
        roleCode: inviteRoleCode,
        branchId: inviteBranchId || undefined,
      });
      setInviteSuccessToken(res.invitationToken);
      loadData();
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invitation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
            <Link href="/settings" className="hover:text-[#714B67]">Settings</Link>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Organizations & Branches</span>
          </div>
          <h1 className="text-lg font-bold text-[#212529] mt-0.5">Multi-Tenant Corporate Structure</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="odoo-btn-secondary px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Invite Employee</span>
          </button>
          <button
            onClick={() => setBranchModalOpen(true)}
            className="odoo-btn-primary px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Operating Branch</span>
          </button>
        </div>
      </div>

      {/* Organization Profile Card */}
      <div className="bg-white rounded border border-[#DEE2E6] p-5 shadow-sm">
        <h2 className="text-xs font-bold text-[#714B67] uppercase tracking-wider mb-3">
          Active Tenant Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#6C757D]">Company Name:</span>
            <div className="font-bold text-sm text-[#212529] mt-0.5">{activeOrg?.name || 'SolarOS Enterprise'}</div>
          </div>
          <div>
            <span className="text-[#6C757D]">Tenant Slug:</span>
            <div className="font-mono font-semibold text-[#017E84] mt-0.5">{activeOrg?.slug || 'primary-tenant'}</div>
          </div>
          <div>
            <span className="text-[#6C757D]">PostgreSQL Tenant Isolation:</span>
            <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enforced via FORCE ROW LEVEL SECURITY
            </div>
          </div>
        </div>
      </div>

      {/* Operating Branches Table */}
      <div className="bg-white rounded border border-[#DEE2E6] overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <h3 className="font-bold text-xs text-[#212529] flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-[#017E84]" />
            Operating Branches & Regional Depots ({branches.length})
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#6C757D] font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Branch Code</th>
              <th className="px-4 py-2.5">Branch Name</th>
              <th className="px-4 py-2.5">City & State</th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {branches.length > 0 ? (
              branches.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-2.5 font-mono font-bold text-[#714B67]">{b.code}</td>
                  <td className="px-4 py-2.5 font-semibold text-[#212529]">{b.name}</td>
                  <td className="px-4 py-2.5 text-[#495057]">{b.city}, {b.state}</td>
                  <td className="px-4 py-2.5 text-[#6C757D]">{b.address || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="odoo-badge bg-emerald-100 text-emerald-800">
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6C757D]">
                  No regional branches registered yet. Click &quot;New Operating Branch&quot; to configure.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded border border-[#DEE2E6] overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <h3 className="font-bold text-xs text-[#212529] flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-[#714B67]" />
            Employee Invitations & Onboarding ({invitations.length})
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#6C757D] font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Invited Email</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Target Branch</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {invitations.length > 0 ? (
              invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-2.5 font-semibold text-[#212529]">{inv.email}</td>
                  <td className="px-4 py-2.5 font-mono text-[#714B67]">{inv.roleCode}</td>
                  <td className="px-4 py-2.5 text-[#6C757D]">{inv.branch?.name || 'HQ / All'}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`odoo-badge ${
                        inv.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6C757D]">
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6C757D]">
                  No pending employee invitations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Branch Modal */}
      {branchModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-md w-full overflow-hidden">
            <div className="bg-[#714B67] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Add Regional Branch</h3>
              <button onClick={() => setBranchModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="p-5 space-y-3.5 text-xs">
              {branchError && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{branchError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. BLR-HUB"
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Bangalore South Depot"
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={branchState}
                    onChange={(e) => setBranchState(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Physical Address</label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Street / Industrial Area"
                  className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="px-3 py-1.5 border border-[#CED4DA] rounded hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="odoo-btn-primary px-4 py-1.5 rounded font-semibold"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-md w-full overflow-hidden">
            <div className="bg-[#714B67] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Invite Employee to Organization</h3>
              <button onClick={() => { setInviteModalOpen(false); setInviteSuccessToken(null); }} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs">
              {inviteSuccessToken ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded">
                    <p className="font-bold">Invitation Dispatched!</p>
                    <p className="mt-1">
                      Share this invitation acceptance token with the employee:
                    </p>
                    <div className="mt-2 p-2 bg-white rounded border border-emerald-300 font-mono text-[11px] break-all select-all">
                      {inviteSuccessToken}
                    </div>
                  </div>
                  <button
                    onClick={() => { setInviteModalOpen(false); setInviteSuccessToken(null); }}
                    className="w-full py-2 bg-[#714B67] text-white rounded font-semibold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendInvitation} className="space-y-3.5">
                  {inviteError && (
                    <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{inviteError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold mb-1">Employee Email *</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="technician@sunpower.com"
                      className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Target Role *</label>
                    <select
                      value={inviteRoleCode}
                      onChange={(e) => setInviteRoleCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
                    >
                      {roles.map((r) => (
                        <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Assigned Branch (optional)</label>
                    <select
                      value={inviteBranchId}
                      onChange={(e) => setInviteBranchId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
                    >
                      <option value="">Headquarters / All Branches</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="px-3 py-1.5 border border-[#CED4DA] rounded hover:bg-[#F8F9FA]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="odoo-btn-primary px-4 py-1.5 rounded font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Invitation
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
