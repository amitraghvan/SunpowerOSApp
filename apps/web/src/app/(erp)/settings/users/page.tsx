'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Building2,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  X,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formBranchId, setFormBranchId] = useState('');
  const [formSelectedRoles, setFormSelectedRoles] = useState<string[]>(['SOLAR_ENGINEER']);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [u, r] = await Promise.all([
        ApiClient.getUsers(),
        ApiClient.getRoles(),
      ]);
      setUsers(u || []);
      setRoles(r || []);
    } catch (err: any) {
      console.warn('Error loading users:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await ApiClient.createUser({
        email: formEmail,
        firstName: formFirstName,
        lastName: formLastName,
        phone: formPhone || undefined,
        password: formPassword || undefined,
        branchId: formBranchId || undefined,
        roleCodes: formSelectedRoles,
      });
      setFormSuccess('User successfully added to organization.');
      setTimeout(() => {
        setInviteModalOpen(false);
        setFormSuccess(null);
        loadData();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user account.');
    }
  };

  const handleSaveRoleAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await ApiClient.assignRoles(selectedUser.user.id, formSelectedRoles);
      setEditUserModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user roles');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${u.user.firstName} ${u.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Bar (Odoo Style) */}
      <div className="bg-white rounded border border-[#DEE2E6] px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
            <Link href="/settings" className="hover:text-[#714B67]">Settings</Link>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Users & Team Access</span>
          </div>
          <h1 className="text-lg font-bold text-[#212529] mt-0.5">Team Directory</h1>
        </div>

        <button
          onClick={() => {
            setFormEmail('');
            setFormFirstName('');
            setFormLastName('');
            setFormPassword('');
            setFormSelectedRoles(['SOLAR_ENGINEER']);
            setInviteModalOpen(true);
          }}
          className="odoo-btn-primary px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New User</span>
        </button>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white rounded border border-[#DEE2E6] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6C757D]" />
          <span className="text-[#6C757D] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#CED4DA] rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          >
            <option value="ALL">All Statuses ({users.length})</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded border border-[#DEE2E6] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#6C757D] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5">User</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Branch</th>
              <th className="px-4 py-2.5">Assigned Roles</th>
              <th className="px-4 py-2.5">Joined</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((item) => {
                const u = item.user;
                return (
                  <tr key={u.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-[#212529]">
                            {u.firstName} {u.lastName}
                          </div>
                          {u.isSuperAdmin && (
                            <span className="text-[10px] text-purple-700 font-bold">Super Admin</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-[#495057]">{u.email}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`odoo-badge ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'INVITED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[#6C757D]">
                      {item.branch ? item.branch.name : '—'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.roles.map((r: any) => (
                          <span
                            key={r.id || r.code}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#714B67]/10 text-[#714B67]"
                          >
                            {r.code}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-[#6C757D]">
                      {new Date(item.joinedAt || u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(item);
                          setFormSelectedRoles(item.roles.map((r: any) => r.id));
                          setEditUserModalOpen(true);
                        }}
                        className="text-[#017E84] hover:underline font-semibold"
                      >
                        Edit Roles
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6C757D]">
                  {isLoading ? 'Loading team directory...' : 'No users match your criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite / Create User Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-lg w-full overflow-hidden">
            <div className="bg-[#714B67] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Add Team Member</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Temporary Password (optional)</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Leave empty to send email invitation"
                  className="w-full px-2.5 py-1.5 border border-[#CED4DA] rounded focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assign Roles *</label>
                <div className="grid grid-cols-2 gap-2 p-2 border border-[#CED4DA] rounded max-h-36 overflow-y-auto">
                  {roles.map((r) => (
                    <label key={r.code} className="flex items-center gap-2 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSelectedRoles.includes(r.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormSelectedRoles([...formSelectedRoles, r.code]);
                          } else {
                            setFormSelectedRoles(formSelectedRoles.filter((c) => c !== r.code));
                          }
                        }}
                      />
                      <span>{r.name}</span>
                    </label>
                  ))}
                </div>
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
                  className="odoo-btn-primary px-4 py-1.5 rounded font-semibold"
                >
                  Save & Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Roles Modal */}
      {editUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-[#DEE2E6] max-w-md w-full overflow-hidden">
            <div className="bg-[#714B67] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Edit Roles: {selectedUser.user.firstName} {selectedUser.user.lastName}
              </h3>
              <button onClick={() => setEditUserModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleAssignments} className="p-5 space-y-4 text-xs">
              <p className="text-[#6C757D]">
                Select the enterprise roles to assign for <strong>{selectedUser.user.email}</strong>.
              </p>

              <div className="space-y-2 border border-[#CED4DA] rounded p-3 max-h-56 overflow-y-auto">
                {roles.map((r) => (
                  <label key={r.id} className="flex items-start gap-2 cursor-pointer p-1 hover:bg-[#F8F9FA] rounded">
                    <input
                      type="checkbox"
                      checked={formSelectedRoles.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormSelectedRoles([...formSelectedRoles, r.id]);
                        } else {
                          setFormSelectedRoles(formSelectedRoles.filter((id) => id !== r.id));
                        }
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-[#212529]">{r.name} ({r.code})</div>
                      <div className="text-[10px] text-[#6C757D]">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-3 border-t border-[#DEE2E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-3 py-1.5 border border-[#CED4DA] rounded hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="odoo-btn-primary px-4 py-1.5 rounded font-semibold"
                >
                  Save Access Rights
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
