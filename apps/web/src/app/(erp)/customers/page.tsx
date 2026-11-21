'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  Plus,
  Search,
  Building,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    customerType: 'INDIVIDUAL',
    phone: '',
    email: '',
    taxId: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (customerType !== 'ALL') params.customerType = customerType;
      if (search) params.search = search;
      const res = await ApiClient.getCustomers(params);
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [customerType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createCustomer(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        customerType: 'INDIVIDUAL',
        phone: '',
        email: '',
        taxId: '',
        notes: '',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2563EB]" />
            Customer Management & 360
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Maintain accounts, installation sites, DISCOM meters, and service history.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'INDIVIDUAL', 'COMMERCIAL', 'INSTITUTIONAL'].map((type) => (
            <button
              key={type}
              onClick={() => setCustomerType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                customerType === type
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, email, or customer #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              fetchCustomers();
            }}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Customers List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900">No customers found</h3>
            <p className="text-sm text-slate-500 mt-1">Convert a won lead or manually register a new customer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Contact Info</th>
                  <th className="px-4 py-3 font-semibold">Sites</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Customer 360</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {cust.customerType === 'COMMERCIAL' ? (
                          <Building className="w-4 h-4 text-slate-400" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                        {cust.name}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{cust.customerNumber}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {cust.customerType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {cust.phone}
                      </div>
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {cust.email}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-slate-700">
                        {cust._count?.sites || 0} Registered Site(s)
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          cust.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/customers/${cust.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#2563EB] hover:bg-blue-100 rounded text-xs font-medium"
                      >
                        View 360
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register New Customer</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer / Entity Name *</label>
                <input
                  required
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Verma or SunTech Industries"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    value={createForm.customerType}
                    onChange={(e) => setCreateForm({ ...createForm, customerType: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INSTITUTIONAL">Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tax ID (GST/PAN)</label>
                  <input
                    type="text"
                    value={createForm.taxId}
                    onChange={(e) => setCreateForm({ ...createForm, taxId: e.target.value })}
                    placeholder="Optional"
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
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
