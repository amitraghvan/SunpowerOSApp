'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  Shield,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  X,
  Mail,
  Loader2,
} from 'lucide-react';

export default function PlatformAdministratorsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New admin modal
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('PLATFORM_ADMIN');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getPlatformAdministrators();
      setAdmins(res || []);
    } catch (err) {
      console.error('Failed to load administrators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await ApiClient.createPlatformAdministrator({
        firstName,
        lastName,
        email,
        role,
      });
      setModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      fetchAdmins();
    } catch (err: any) {
      alert(`Failed to create administrator: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (admin: any) => {
    if (!confirm(`${admin.isActive ? 'Deactivate' : 'Activate'} administrator ${admin.user?.email}?`))
      return;
    try {
      await ApiClient.updatePlatformAdministrator(admin.id, {
        isActive: !admin.isActive,
      });
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#151A2B] tracking-tight">
            Platform Administrators
          </h1>
          <p className="text-xs text-[#737B8B] mt-0.5">
            Manage SunPower Solutions super administrators, support operators and platform roles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-[#E4E5E9] bg-white hover:bg-[#F6F6F6] text-xs font-semibold text-[#475065] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-[#E4E5E9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E4E5E9] text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Platform Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E5E9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#8A92A6]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#714B67]" />
                    Loading platform administrators...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#8A92A6]">
                    No platform administrators found.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-[#FAFAFB]">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#151A2B]">
                        {adm.user?.firstName} {adm.user?.lastName}
                      </div>
                      <div className="text-[11px] text-[#737B8B]">{adm.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                      {adm.role}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          adm.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {adm.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#737B8B] font-mono text-[11px]">
                      {new Date(adm.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {adm.role !== 'PLATFORM_OWNER' && (
                        <button
                          onClick={() => handleToggleActive(adm)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            adm.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {adm.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Administrator Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E4E5E9] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#151A2B]">Add Platform Administrator</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F6F6F6] text-[#8A92A6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sunpowersolutions.in"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                  Platform Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E5E9] text-xs bg-white focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="PLATFORM_ADMIN">Platform Administrator</option>
                  <option value="PLATFORM_SUPPORT">Platform Support Agent</option>
                  <option value="PLATFORM_ANALYST">Platform Analyst (Read Only Analytics)</option>
                  <option value="PLATFORM_OWNER">Platform Owner (Full Privileges)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E5E9] text-xs font-semibold text-[#475065]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white text-xs font-semibold"
                >
                  {modalLoading ? 'Adding...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
