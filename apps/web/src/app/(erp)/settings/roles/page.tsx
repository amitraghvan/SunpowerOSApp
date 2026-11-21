'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Plus,
  Key,
  CheckCircle2,
  Lock,
  Trash2,
  Edit,
  X,
  AlertCircle,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New role modal
  const [modalOpen, setModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleScope, setRoleScope] = useState('ORGANIZATION');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [r, p] = await Promise.all([
        ApiClient.getRoles(),
        ApiClient.getPermissions(),
      ]);
      setRoles(r || []);
      setPermissions(p || []);
    } catch (err: any) {
      console.warn('Error loading roles:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await ApiClient.createRole({
        name: roleName,
        code: roleCode.toUpperCase().replace(/\s+/g, '_'),
        description: roleDescription,
        scope: roleScope,
        permissionIds: selectedPermissionIds,
      });
      setModalOpen(false);
      setRoleName('');
      setRoleCode('');
      setRoleDescription('');
      setSelectedPermissionIds([]);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    try {
      await ApiClient.deleteRole(roleId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Cannot delete role');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded border border-[#DEE2E6] px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
            <Link href="/settings" className="hover:text-[#714B67]">Settings</Link>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Access Rights & Roles</span>
          </div>
          <h1 className="text-lg font-bold text-[#212529] mt-0.5">Enterprise RBAC Matrix</h1>
        </div>

        <button
          onClick={() => {
            setError(null);
            setModalOpen(true);
          }}
          className="odoo-btn-primary px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Custom Role</span>
        </button>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div
            key={r.id || r.code}
            className="bg-white rounded border border-[#DEE2E6] p-4 flex flex-col justify-between shadow-sm hover:border-[#714B67] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#714B67] px-2 py-0.5 rounded bg-[#714B67]/10">
                  {r.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  r.isSystem ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {r.isSystem ? 'System Template' : 'Custom Org Role'}
                </span>
              </div>

              <h2 className="text-sm font-bold text-[#212529]">{r.name}</h2>
              <p className="text-xs text-[#6C757D] mt-1 line-clamp-2 leading-relaxed">
                {r.description || 'Standard access permissions.'}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs text-[#495057]">
                <div className="flex items-center gap-1">
                  <span className="text-[#6C757D]">Scope:</span>
                  <span className="font-semibold text-[#017E84]">{r.scope || 'ORGANIZATION'}</span>
                </div>
                <div>&middot;</div>
                <div className="flex items-center gap-1">
                  <span className="text-[#6C757D]">Rules:</span>
                  <span className="font-semibold text-[#212529]">{r.permissions?.length || 0} permissions</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#6C757D]">
                Category: <strong>{r.category}</strong>
              </span>

              {!r.isSystem && (
                <button
                  onClick={() => handleDeleteRole(r.id)}
                  className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-xl w-full overflow-hidden">
            <div className="bg-[#714B67] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Define Custom Organization Role</h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Regional Auditor"
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Role Code *</label>
                  <input
                    type="text"
                    required
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
                    placeholder="e.g. REGIONAL_AUDITOR"
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Summarize the operational responsibilities of this role"
                  className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Record-Level Access Scope</label>
                <select
                  value={roleScope}
                  onChange={(e) => setRoleScope(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
                >
                  <option value="ORGANIZATION">Organization (Full company visibility)</option>
                  <option value="BRANCH">Branch (Restricted to assigned branch)</option>
                  <option value="ASSIGNED">Assigned (Restricted to projects/leads assigned to user)</option>
                  <option value="OWN">Own (Restricted to user created records)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Granted Permissions ({selectedPermissionIds.length} selected)</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPermissionIds.length === permissions.length) {
                        setSelectedPermissionIds([]);
                      } else {
                        setSelectedPermissionIds(permissions.map((p) => p.id));
                      }
                    }}
                    className="text-[#017E84] hover:underline text-[11px]"
                  >
                    {selectedPermissionIds.length === permissions.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="p-2 border border-[#CED4DA] rounded max-h-48 overflow-y-auto space-y-1">
                  {permissions.map((p) => (
                    <label key={p.id} className="flex items-start gap-2 p-1 hover:bg-[#F8F9FA] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissionIds([...selectedPermissionIds, p.id]);
                          } else {
                            setSelectedPermissionIds(selectedPermissionIds.filter((id) => id !== p.id));
                          }
                        }}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-[#212529] font-mono text-[11px]">{p.code}</div>
                        <div className="text-[10px] text-[#6C757D]">{p.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-[#CED4DA] rounded hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="odoo-btn-primary px-4 py-1.5 rounded font-semibold"
                >
                  Create Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
