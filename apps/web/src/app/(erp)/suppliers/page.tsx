'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  Plus,
  Search,
  Filter,
  Building,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Tag,
  Star,
  RefreshCw,
} from 'lucide-react';

export default function SuppliersListPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Creation form state
  const [form, setForm] = useState({
    legalName: '',
    tradeName: '',
    category: 'MANUFACTURER',
    supplierType: 'SOLAR_PANELS',
    gstin: '',
    pan: '',
    msmeRegistrationNumber: '',
    paymentTerms: 'NET_30',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (typeFilter !== 'ALL') params.supplierType = typeFilter;
      if (search) params.search = search;
      const res = await ApiClient.getSuppliers(params);
      setSuppliers(res || []);
    } catch (err: any) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [categoryFilter, typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await ApiClient.createSupplier({
        legalName: form.legalName,
        tradeName: form.tradeName || undefined,
        category: form.category,
        supplierType: form.supplierType,
        gstin: form.gstin || undefined,
        pan: form.pan || undefined,
        msmeRegistrationNumber: form.msmeRegistrationNumber || undefined,
        paymentTerms: form.paymentTerms,
        contacts: form.contactName
          ? [
              {
                name: form.contactName,
                email: form.contactEmail || undefined,
                phone: form.contactPhone,
                isPrimary: true,
              },
            ]
          : undefined,
        addresses: form.city
          ? [
              {
                addressType: 'REGISTERED_OFFICE',
                addressLine1: `${form.city}, ${form.state}`,
                city: form.city,
                state: form.state,
                postalCode: '400001',
                country: 'India',
                isDefaultBilling: true,
              },
            ]
          : undefined,
      });
      setIsModalOpen(false);
      setForm({
        legalName: '',
        tradeName: '',
        category: 'MANUFACTURER',
        supplierType: 'SOLAR_PANELS',
        gstin: '',
        pan: '',
        msmeRegistrationNumber: '',
        paymentTerms: 'NET_30',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        city: '',
        state: '',
      });
      fetchSuppliers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to onboard supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = suppliers.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.legalName?.toLowerCase().includes(q) ||
      s.supplierCode?.toLowerCase().includes(q) ||
      s.tradeName?.toLowerCase().includes(q) ||
      s.gstin?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212529] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#714B67]" />
            Suppliers & Vendor Management
          </h1>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Enterprise procurement registry, OEM authorizations, GSTIN validation & live rate cards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSuppliers}
            className="p-2 border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded text-xs flex items-center gap-1.5 text-[#495057]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#714B67] hover:bg-[#58394F] text-white px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Onboard Supplier
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white border border-[#DEE2E6] rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#ADB5BD] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by legal name, code, trade name or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#CED4DA] rounded text-xs focus:outline-none focus:border-[#714B67]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6C757D]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-[#CED4DA] rounded py-1.5 px-2 text-xs focus:outline-none focus:border-[#714B67]"
            >
              <option value="ALL">All Categories</option>
              <option value="MANUFACTURER">OEM / Manufacturer</option>
              <option value="DISTRIBUTOR">Authorized Distributor</option>
              <option value="WHOLESALER">Wholesaler / Stockist</option>
              <option value="SERVICE_PROVIDER">Service / EPC Contractor</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-[#CED4DA] rounded py-1.5 px-2 text-xs focus:outline-none focus:border-[#714B67]"
            >
              <option value="ALL">All Product Types</option>
              <option value="SOLAR_PANELS">Solar Panels</option>
              <option value="INVERTERS">Inverters</option>
              <option value="BATTERIES">Batteries / ESS</option>
              <option value="MOUNTING_STRUCTURES">MMS / Structures</option>
              <option value="BOS_ELECTRICAL">Electrical BOS</option>
              <option value="MULTI_CATEGORY">Multi-Category</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#6C757D]">
          Total Suppliers: <span className="font-semibold text-[#212529]">{filtered.length}</span>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-[#212529] border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[#495057] font-semibold">
              <th className="py-2.5 px-3">Supplier Code</th>
              <th className="py-2.5 px-3">Supplier Name & Trade Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Specialization</th>
              <th className="py-2.5 px-3">GSTIN / Tax ID</th>
              <th className="py-2.5 px-3">Primary Contact</th>
              <th className="py-2.5 px-3">Payment Terms</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#6C757D]">
                  Loading suppliers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#6C757D]">
                  No suppliers found matching current criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const primaryContact = s.contacts?.[0];
                return (
                  <tr key={s.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#714B67]">
                      <Link href={`/suppliers/${s.id}`} className="hover:underline">
                        {s.supplierCode}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#212529]">{s.legalName}</div>
                      {s.tradeName && (
                        <div className="text-[11px] text-[#6C757D]">t/a {s.tradeName}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#E9ECEF] text-[#495057]">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[#017E84] font-medium text-[11px]">
                        {s.supplierType?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#495057]">
                      {s.gstin || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      {primaryContact ? (
                        <div>
                          <div className="font-medium">{primaryContact.name}</div>
                          <div className="text-[11px] text-[#6C757D]">{primaryContact.phone}</div>
                        </div>
                      ) : (
                        <span className="text-[#ADB5BD]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#495057]">{s.paymentTerms || 'NET_30'}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'ACTIVE'
                            ? 'bg-[#D1E7DD] text-[#0F5132]'
                            : s.status === 'UNDER_EVALUATION'
                            ? 'bg-[#CFF4FC] text-[#055160]'
                            : 'bg-[#F8D7DA] text-[#842029]'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/suppliers/${s.id}`}
                        className="inline-flex items-center gap-1 text-[#714B67] hover:text-[#58394F] font-semibold text-xs"
                      >
                        360 Profile <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Onboard Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#212529]">Onboard New Solar Equipment Supplier</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#6C757D] hover:text-[#212529] text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#F8D7DA] text-[#842029] rounded text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Legal Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Solar Limited"
                    value={form.legalName}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Trade / Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Solar"
                    value={form.tradeName}
                    onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vendor Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  >
                    <option value="MANUFACTURER">Manufacturer (OEM)</option>
                    <option value="DISTRIBUTOR">Authorized Distributor</option>
                    <option value="WHOLESALER">Wholesaler / Stockist</option>
                    <option value="SERVICE_PROVIDER">Service / EPC Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Product Specialization *</label>
                  <select
                    value={form.supplierType}
                    onChange={(e) => setForm({ ...form, supplierType: e.target.value })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  >
                    <option value="SOLAR_PANELS">Solar PV Modules</option>
                    <option value="INVERTERS">Inverters (String/Hybrid/Micro)</option>
                    <option value="BATTERIES">Batteries / Energy Storage</option>
                    <option value="MOUNTING_STRUCTURES">Mounting Structures (MMS)</option>
                    <option value="BOS_ELECTRICAL">Electrical Balance of System (BOS)</option>
                    <option value="MULTI_CATEGORY">Multi-Category Components</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    placeholder="27AAACV1234F1Z1"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                    className="w-full border rounded p-2 text-xs uppercase focus:outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">PAN (10 Characters)</label>
                  <input
                    type="text"
                    placeholder="AAACV1234F"
                    value={form.pan}
                    onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                    className="w-full border rounded p-2 text-xs uppercase focus:outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Terms</label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  >
                    <option value="ADVANCE_100">100% Advance</option>
                    <option value="ADVANCE_50_BALANCE_DISPATCH">50% Advance, 50% on Dispatch</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_45">Net 45 Days</option>
                    <option value="LC">Letter of Credit (LC)</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="font-semibold text-[#495057]">Primary Contact & Location</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="Sales Manager Name"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+919876543210"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="sales@supplier.com"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai / Pune"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">State</label>
                    <input
                      type="text"
                      placeholder="Maharashtra"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#58394F] text-white rounded text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
