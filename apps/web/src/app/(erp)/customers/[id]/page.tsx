'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  Building,
  User,
  MapPin,
  Phone,
  Mail,
  Zap,
  Sun,
  ClipboardList,
  Plus,
  Clock,
  ArrowLeft,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export default function Customer360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sites' | 'contacts' | 'addresses' | 'timeline' | 'surveys'>('sites');

  // Modals
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [siteForm, setSiteForm] = useState({
    siteName: 'Main Rooftop Site',
    addressLine1: '',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110001',
    roofType: 'RCC_FLAT',
    sanctionedLoadKw: 5,
    electricityConnectionNumber: '',
    discomName: 'BSES Rajdhani',
    roofAreaSqFt: 600,
  });

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    designation: 'Site Manager',
    phone: '',
    email: '',
    isPrimary: false,
  });

  const fetchCustomer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ApiClient.getCustomer360(id);
      setCustomer(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.addCustomerSite(id, siteForm);
      setIsSiteModalOpen(false);
      fetchCustomer();
    } catch (err: any) {
      alert(err.message || 'Failed to add site');
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.addCustomerContact(id, contactForm);
      setIsContactModalOpen(false);
      fetchCustomer();
    } catch (err: any) {
      alert(err.message || 'Failed to add contact');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading Customer 360 View...</div>;
  }

  if (!customer) {
    return (
      <div className="p-12 text-center">
        <h3 className="font-bold text-slate-900">Customer not found</h3>
        <button onClick={() => router.push('/customers')} className="text-blue-600 mt-2 text-sm">
          &larr; Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Back Button */}
      <button
        onClick={() => router.push('/customers')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Customers
      </button>

      {/* Customer 360 Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {customer.customerType === 'COMMERCIAL' ? (
                <Building className="w-7 h-7" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {customer.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{customer.customerNumber}</span>
                <span>Type: <strong>{customer.customerType}</strong></span>
                {customer.taxId && <span>Tax ID: <strong>{customer.taxId}</strong></span>}
                <span>Registered: {new Date(customer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Site
            </button>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Quick Contact & Lead Info */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{customer.email || 'No email registered'}</span>
          </div>
          {customer.convertedLead && (
            <div className="flex items-center gap-2 text-blue-600">
              <Sun className="w-4 h-4" />
              <span>Converted from Lead {customer.convertedLead.leadNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* 360 Workspace Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('sites')}
          className={`pb-3 relative ${
            activeTab === 'sites' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Installation Sites ({customer.sites?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 relative ${
            activeTab === 'contacts' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Contacts ({customer.contacts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 relative ${
            activeTab === 'addresses' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Addresses ({customer.addresses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('surveys')}
          className={`pb-3 relative ${
            activeTab === 'surveys' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Surveys ({customer.surveys?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 relative ${
            activeTab === 'timeline' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity Timeline ({customer.activityTimeline?.length || 0})
        </button>
      </div>

      {/* Tab 1: Installation Sites */}
      {activeTab === 'sites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Solar Installation Sites</h3>
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              + Register New Site
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.sites?.map((site: any) => (
              <div key={site.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{site.siteName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{site.addressLine1}, {site.city}, {site.state}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {site.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Sanctioned Load</span>
                    <span className="font-semibold text-slate-800">{site.sanctionedLoadKw || 'N/A'} kW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Roof Type</span>
                    <span className="font-semibold text-slate-800">{site.roofType || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Roof Area</span>
                    <span className="font-semibold text-slate-800">{site.roofAreaSqFt || 'N/A'} sq.ft.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Connection #</span>
                    <span className="font-mono text-slate-800">{site.electricityConnectionNumber || 'Pending'}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href={`/surveys?siteId=${site.id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View / Schedule Survey &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Contacts */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customer.contacts?.map((contact: any) => (
              <div key={contact.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{contact.name}</span>
                  {contact.isPrimary && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold text-[10px]">
                      PRIMARY
                    </span>
                  )}
                </div>
                <div className="text-slate-500">{contact.designation || 'Representative'}</div>
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {contact.phone}
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {contact.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Addresses */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customer.addresses?.map((addr: any) => (
            <div key={addr.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wider">{addr.type} ADDRESS</span>
                {addr.isPrimary && <span className="text-emerald-600 font-semibold text-[10px]">PRIMARY</span>}
              </div>
              <p className="text-slate-700 font-medium">
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
              </p>
              <p className="text-slate-500">{addr.city}, {addr.state} - {addr.postalCode}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Surveys */}
      {activeTab === 'surveys' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.surveys?.map((survey: any) => (
              <div key={survey.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-blue-600">{survey.surveyNumber}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded font-semibold text-slate-700">
                    {survey.status}
                  </span>
                </div>
                <div className="text-slate-600">
                  Scheduled: {survey.scheduledDate ? new Date(survey.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                </div>
                <div className="pt-2 flex justify-end">
                  <a href={`/surveys`} className="text-blue-600 hover:underline font-medium">
                    Open in Surveys Module &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Chronological Activity Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="space-y-6">
            {customer.activityTimeline?.map((item: any, idx: number) => (
              <div key={item.id || idx} className="relative flex gap-4 text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  {idx < customer.activityTimeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                  )}
                </div>

                <div className="pb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.summary}</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Site Modal */}
      {isSiteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register Solar Site</h3>
              <button onClick={() => setIsSiteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Site Nickname *</label>
                <input
                  required
                  type="text"
                  value={siteForm.siteName}
                  onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address *</label>
                <input
                  required
                  type="text"
                  value={siteForm.addressLine1}
                  onChange={(e) => setSiteForm({ ...siteForm, addressLine1: e.target.value })}
                  placeholder="Street / Plot / Colony"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">City *</label>
                  <input
                    required
                    type="text"
                    value={siteForm.city}
                    onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">State *</label>
                  <input
                    required
                    type="text"
                    value={siteForm.state}
                    onChange={(e) => setSiteForm({ ...siteForm, state: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={siteForm.postalCode}
                    onChange={(e) => setSiteForm({ ...siteForm, postalCode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Roof Type</label>
                  <select
                    value={siteForm.roofType}
                    onChange={(e) => setSiteForm({ ...siteForm, roofType: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="RCC_FLAT">RCC Flat Roof</option>
                    <option value="METAL_SHEET">Industrial Metal Sheet</option>
                    <option value="TILED">Sloped Tiled Roof</option>
                    <option value="GROUND">Ground Mount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sanctioned Load (kW)</label>
                  <input
                    type="number"
                    value={siteForm.sanctionedLoadKw}
                    onChange={(e) => setSiteForm({ ...siteForm, sanctionedLoadKw: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Electricity Connection / CA #</label>
                  <input
                    type="text"
                    value={siteForm.electricityConnectionNumber}
                    onChange={(e) => setSiteForm({ ...siteForm, electricityConnectionNumber: e.target.value })}
                    placeholder="e.g. 100293847"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">DISCOM Utility</label>
                  <input
                    type="text"
                    value={siteForm.discomName}
                    onChange={(e) => setSiteForm({ ...siteForm, discomName: e.target.value })}
                    placeholder="e.g. Tata Power / BSES"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSiteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                >
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Contact Person</h3>
              <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                <input
                  required
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Designation</label>
                <input
                  type="text"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone *</label>
                <input
                  required
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
