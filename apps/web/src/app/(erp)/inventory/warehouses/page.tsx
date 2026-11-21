'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Layers,
  CheckCircle,
  XCircle,
  X,
  RefreshCw,
} from 'lucide-react';

export default function WarehouseDirectoryPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [createWarehouseOpen, setCreateWarehouseOpen] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  // Form states
  const [whForm, setWhForm] = useState({
    code: '',
    name: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
  });

  const [locForm, setLocForm] = useState({
    code: '',
    name: '',
    type: 'STORAGE',
    zone: 'ZONE-A',
    rack: 'RACK-01',
    bin: 'BIN-01',
    isDefaultReceiving: false,
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getWarehouses({ search });
      setWarehouses(data || []);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [search]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createWarehouse(whForm);
      setCreateWarehouseOpen(false);
      setWhForm({ code: '', name: '', address: '', contactPhone: '', contactEmail: '' });
      await fetchWarehouses();
    } catch (err: any) {
      alert(`Error creating warehouse: ${err.message || 'Check inputs'}`);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;
    try {
      await ApiClient.createWarehouseLocation(selectedWarehouse.id, locForm);
      setAddLocationOpen(false);
      setLocForm({
        code: '',
        name: '',
        type: 'STORAGE',
        zone: 'ZONE-A',
        rack: 'RACK-01',
        bin: 'BIN-01',
        isDefaultReceiving: false,
      });
      await fetchWarehouses();
    } catch (err: any) {
      alert(`Error adding location: ${err.message || 'Check inputs'}`);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#714B67]/10 text-[#714B67]">
              <WarehouseIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Warehouse Directory & Locations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage central facilities, regional fulfillment centers, storage zones, racks, and bins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateWarehouseOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by warehouse code, name, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:bg-white"
          />
        </div>
        <button
          onClick={fetchWarehouses}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Warehouses Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-xs text-slate-500">
            Loading warehouses...
          </div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
            <WarehouseIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No Warehouses Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by creating your primary warehouse facility to manage receiving bays, storage zones, and bins.
            </p>
            <button
              onClick={() => setCreateWarehouseOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] rounded hover:bg-[#5b3c53]"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Warehouse
            </button>
          </div>
        ) : (
          warehouses.map((wh) => (
            <div
              key={wh.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-4.5 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 uppercase tracking-wider mb-1">
                      {wh.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{wh.name}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      wh.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {wh.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  {wh.address && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{wh.address}</span>
                    </div>
                  )}
                  {wh.contactPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{wh.contactPhone}</span>
                    </div>
                  )}
                  {wh.managerName && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Manager: {wh.managerName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {wh.locationsCount || 0} Storage Location(s)
                </span>
                <button
                  onClick={() => {
                    setSelectedWarehouse(wh);
                    setLocForm({
                      code: `${wh.code}-BIN-`,
                      name: `${wh.name} Bin `,
                      type: 'STORAGE',
                      zone: 'ZONE-A',
                      rack: 'RACK-01',
                      bin: 'BIN-01',
                      isDefaultReceiving: false,
                    });
                    setAddLocationOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#714B67] bg-[#714B67]/5 hover:bg-[#714B67]/10 rounded transition"
                >
                  <Plus className="w-3 h-3" />
                  Add Bin/Zone
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Warehouse Modal */}
      {createWarehouseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add New Warehouse</h3>
              <button
                onClick={() => setCreateWarehouseOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH-BLR-01"
                  value={whForm.code}
                  onChange={(e) => setWhForm({ ...whForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru Central Hub"
                  value={whForm.name}
                  onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                <textarea
                  rows={2}
                  placeholder="Plot 42, Peenya Industrial Area, Phase 2, Bengaluru"
                  value={whForm.address}
                  onChange={(e) => setWhForm({ ...whForm, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={whForm.contactPhone}
                    onChange={(e) => setWhForm({ ...whForm, contactPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="warehouse@sunpower.com"
                    value={whForm.contactEmail}
                    onChange={(e) => setWhForm({ ...whForm, contactEmail: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setCreateWarehouseOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
                >
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {addLocationOpen && selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Storage Location / Bin</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Warehouse: {selectedWarehouse.name}</p>
              </div>
              <button
                onClick={() => setAddLocationOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BLR-Z1-R2-B04"
                    value={locForm.code}
                    onChange={(e) => setLocForm({ ...locForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Type *</label>
                  <select
                    value={locForm.type}
                    onChange={(e) => setLocForm({ ...locForm, type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67] bg-white"
                  >
                    <option value="STORAGE">STORAGE (Racks & Bins)</option>
                    <option value="RECEIVING">RECEIVING (Unloading Bay)</option>
                    <option value="QUALITY_HOLD">QUALITY_HOLD (Inspection)</option>
                    <option value="QUARANTINE">QUARANTINE (Rejected/Defective)</option>
                    <option value="PICKING">PICKING (Staging)</option>
                    <option value="PACKING">PACKING (Dispatch Prep)</option>
                    <option value="DISPATCH">DISPATCH (Loading Dock)</option>
                    <option value="RETURN">RETURN (Customer Inward)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descriptive Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zone A Inverter Rack 2 Bin 4"
                  value={locForm.name}
                  onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zone</label>
                  <input
                    type="text"
                    placeholder="ZONE-A"
                    value={locForm.zone}
                    onChange={(e) => setLocForm({ ...locForm, zone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rack</label>
                  <input
                    type="text"
                    placeholder="RACK-01"
                    value={locForm.rack}
                    onChange={(e) => setLocForm({ ...locForm, rack: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bin</label>
                  <input
                    type="text"
                    placeholder="BIN-01"
                    value={locForm.bin}
                    onChange={(e) => setLocForm({ ...locForm, bin: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={locForm.isDefaultReceiving}
                    onChange={(e) => setLocForm({ ...locForm, isDefaultReceiving: e.target.checked })}
                    className="rounded text-[#714B67] focus:ring-[#714B67]"
                  />
                  <span className="text-slate-700 font-medium">Set as default receiving location for this warehouse</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setAddLocationOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5b3c53] rounded"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
