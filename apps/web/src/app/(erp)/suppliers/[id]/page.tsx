'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  Building,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Boxes,
  Plus,
  CheckCircle,
  Clock,
  IndianRupee,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export default function SupplierProfile360Page() {
  const params = useParams();
  const id = params?.id as string;

  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'MAPPED_PRODUCTS' | 'CONTACTS' | 'ADDRESSES' | 'BANK_ACCOUNTS' | 'DOCUMENTS' | 'PURCHASE_ORDERS'
  >('MAPPED_PRODUCTS');

  // Product mapping modal state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [mapForm, setMapForm] = useState({
    productVariantId: '',
    supplierPartCode: '',
    supplierPartName: '',
    unitPrice: 0,
    leadTimeDays: 7,
    minimumOrderQuantity: 1,
    isPreferred: false,
    notes: '',
  });

  const fetchSupplierDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ApiClient.getSupplierById(id);
      setSupplier(data);
    } catch (err: any) {
      console.error('Failed to load supplier details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierDetails();
    ApiClient.getProducts().then((res: any) => {
      // Flatten product variants
      const vars: any[] = [];
      const list = Array.isArray(res) ? res : res?.data || [];
      list.forEach((p: any) => {
        if (p.variants) {
          p.variants.forEach((v: any) => {
            vars.push({ ...v, productName: p.name, productCode: p.code });
          });
        }
      });
      setProducts(vars);
    }).catch(() => {});
  }, [id]);

  const handleMapProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createSupplierProductMapping(id, {
        productVariantId: mapForm.productVariantId,
        supplierPartCode: mapForm.supplierPartCode,
        supplierPartName: mapForm.supplierPartName || undefined,
        unitPrice: Number(mapForm.unitPrice),
        leadTimeDays: Number(mapForm.leadTimeDays),
        minimumOrderQuantity: Number(mapForm.minimumOrderQuantity),
        isPreferred: mapForm.isPreferred,
        notes: mapForm.notes || undefined,
      });
      setIsMapModalOpen(false);
      fetchSupplierDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to map product');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#6C757D] text-sm">
        Loading Supplier 360 profile...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-8 text-center text-[#842029] text-sm">
        Supplier record not found or inaccessible.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/suppliers"
            className="p-2 border border-[#DEE2E6] hover:bg-gray-100 rounded text-[#495057] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#714B67] font-bold text-sm">
                {supplier.supplierCode}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  supplier.status === 'ACTIVE'
                    ? 'bg-[#D1E7DD] text-[#0F5132]'
                    : 'bg-[#CFF4FC] text-[#055160]'
                }`}
              >
                {supplier.status}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#212529] mt-0.5">{supplier.legalName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="px-3.5 py-2 bg-[#714B67] hover:bg-[#58394F] text-white rounded font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Map Catalogue Product
          </button>
        </div>
      </div>

      {/* Supplier Identity Summary Card */}
      <div className="bg-white border border-[#DEE2E6] rounded p-4 grid grid-cols-4 gap-4 shadow-sm">
        <div>
          <div className="text-[#6C757D] font-medium mb-1">Company & Category</div>
          <div className="font-semibold text-[#212529] text-sm">{supplier.tradeName || supplier.legalName}</div>
          <div className="text-[11px] text-[#017E84] mt-0.5 font-medium">{supplier.category} · {supplier.supplierType}</div>
        </div>

        <div>
          <div className="text-[#6C757D] font-medium mb-1">Tax & Regulatory</div>
          <div className="font-mono text-[#212529]">GSTIN: {supplier.gstin || 'NOT_REGISTERED'}</div>
          <div className="font-mono text-[11px] text-[#6C757D]">PAN: {supplier.pan || '—'}</div>
        </div>

        <div>
          <div className="text-[#6C757D] font-medium mb-1">Commercial Terms</div>
          <div className="font-semibold text-[#212529]">{supplier.paymentTerms || 'NET_30'}</div>
          <div className="text-[11px] text-[#6C757D]">Credit Limit: ₹{Number(supplier.creditLimit || 0).toLocaleString()}</div>
        </div>

        <div>
          <div className="text-[#6C757D] font-medium mb-1">Rating & Compliance</div>
          <div className="flex items-center gap-1 text-[#D97706] font-bold">
            ★ {supplier.rating ? Number(supplier.rating).toFixed(1) : '5.0'} / 5.0
          </div>
          <div className="text-[11px] text-[#198754]">OEM Authorized Partner</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#DEE2E6] flex gap-6 text-xs font-semibold text-[#495057]">
        <button
          onClick={() => setActiveTab('MAPPED_PRODUCTS')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'MAPPED_PRODUCTS'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent hover:text-[#212529]'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          Mapped Catalog Products ({supplier.productMappings?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('CONTACTS')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'CONTACTS'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent hover:text-[#212529]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Contacts ({supplier.contacts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('ADDRESSES')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'ADDRESSES'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent hover:text-[#212529]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Locations & Warehouses ({supplier.addresses?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('BANK_ACCOUNTS')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'BANK_ACCOUNTS'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent hover:text-[#212529]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Bank Accounts ({supplier.bankAccounts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('PURCHASE_ORDERS')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'PURCHASE_ORDERS'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent hover:text-[#212529]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Orders History ({supplier.purchaseOrders?.length || 0})
        </button>
      </div>

      {/* Tab Content 1: Mapped Products */}
      {activeTab === 'MAPPED_PRODUCTS' && (
        <div className="bg-white border border-[#DEE2E6] rounded shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b text-[#495057] font-semibold">
                <th className="py-2.5 px-3">Supplier SKU / Code</th>
                <th className="py-2.5 px-3">SolarOS Internal Product</th>
                <th className="py-2.5 px-3">Negotiated Unit Price</th>
                <th className="py-2.5 px-3">Lead Time</th>
                <th className="py-2.5 px-3">Min Order Qty (MOQ)</th>
                <th className="py-2.5 px-3">Tax Rate</th>
                <th className="py-2.5 px-3">Preferred Vendor</th>
                <th className="py-2.5 px-3">Effective Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {!supplier.productMappings || supplier.productMappings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                    No catalog products mapped to this vendor yet.
                  </td>
                </tr>
              ) : (
                supplier.productMappings.map((m: any) => (
                  <tr key={m.id} className="hover:bg-[#F8F9FA]">
                    <td className="py-2.5 px-3 font-mono font-medium text-[#714B67]">
                      {m.supplierPartCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#212529]">{m.productVariant?.name}</div>
                      <div className="text-[11px] text-[#6C757D] font-mono">{m.productVariant?.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#0F5132]">
                      ₹{Number(m.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-[#495057]">{m.leadTimeDays} Days</td>
                    <td className="py-2.5 px-3 text-[#495057]">{m.minimumOrderQuantity} Nos</td>
                    <td className="py-2.5 px-3 text-[#495057]">{m.taxRatePercent}% GST</td>
                    <td className="py-2.5 px-3">
                      {m.isPreferred ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#0F5132] font-semibold bg-[#D1E7DD] px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" /> Preferred
                        </span>
                      ) : (
                        <span className="text-[#6C757D]">Secondary</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#6C757D]">
                      {new Date(m.effectiveFrom).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content 2: Contacts */}
      {activeTab === 'CONTACTS' && (
        <div className="grid grid-cols-3 gap-4">
          {!supplier.contacts || supplier.contacts.length === 0 ? (
            <div className="col-span-3 bg-white p-8 text-center border rounded text-[#6C757D]">
              No contact persons registered.
            </div>
          ) : (
            supplier.contacts.map((c: any) => (
              <div key={c.id} className="bg-white border rounded p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#212529]">{c.name}</div>
                  {c.isPrimary && (
                    <span className="px-1.5 py-0.5 bg-[#D1E7DD] text-[#0F5132] rounded text-[10px] font-bold">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#6C757D]">{c.designation || 'Sales Representative'}</div>
                <div className="pt-2 border-t space-y-1 text-[#495057]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#6C757D]" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#6C757D]" />
                      <span>{c.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 3: Addresses */}
      {activeTab === 'ADDRESSES' && (
        <div className="grid grid-cols-2 gap-4">
          {!supplier.addresses || supplier.addresses.length === 0 ? (
            <div className="col-span-2 bg-white p-8 text-center border rounded text-[#6C757D]">
              No facility or warehouse locations recorded.
            </div>
          ) : (
            supplier.addresses.map((a: any) => (
              <div key={a.id} className="bg-white border rounded p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#212529]">{a.addressType}</span>
                  {a.isDefaultBilling && (
                    <span className="px-1.5 py-0.5 bg-[#E9ECEF] text-[#495057] rounded text-[10px] font-bold">
                      Default Billing
                    </span>
                  )}
                </div>
                <p className="text-[#495057]">
                  {a.addressLine1}
                  {a.addressLine2 ? `, ${a.addressLine2}` : ''}
                  <br />
                  {a.city}, {a.state} - {a.postalCode}
                  <br />
                  {a.country}
                </p>
                {a.gstin && <div className="text-[11px] font-mono text-[#714B67]">Site GSTIN: {a.gstin}</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 4: Bank Accounts */}
      {activeTab === 'BANK_ACCOUNTS' && (
        <div className="grid grid-cols-2 gap-4">
          {!supplier.bankAccounts || supplier.bankAccounts.length === 0 ? (
            <div className="col-span-2 bg-white p-8 text-center border rounded text-[#6C757D]">
              No verified settlement bank accounts.
            </div>
          ) : (
            supplier.bankAccounts.map((b: any) => (
              <div key={b.id} className="bg-white border rounded p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#212529]">{b.bankName}</span>
                  {b.isVerified && (
                    <span className="px-1.5 py-0.5 bg-[#D1E7DD] text-[#0F5132] rounded text-[10px] font-bold">
                      Verified
                    </span>
                  )}
                </div>
                <div className="font-mono text-sm text-[#495057]">Acc: {b.accountNumber}</div>
                <div className="font-mono text-[11px] text-[#6C757D]">IFSC: {b.ifscCode} · Branch: {b.branchName || 'Main'}</div>
                <div className="text-[11px] text-[#6C757D]">Beneficiary: {b.accountHolderName}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 5: Purchase Orders History */}
      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="bg-white border rounded shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b text-[#495057] font-semibold">
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">Order Date</th>
                <th className="py-2.5 px-3">Delivery Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E6]">
              {!supplier.purchaseOrders || supplier.purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6C757D]">
                    No purchase orders issued to this supplier yet.
                  </td>
                </tr>
              ) : (
                supplier.purchaseOrders.map((po: any) => (
                  <tr key={po.id} className="hover:bg-[#F8F9FA]">
                    <td className="py-2.5 px-3 font-semibold text-[#714B67]">{po.poNumber}</td>
                    <td className="py-2.5 px-3">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 font-semibold">₹{Number(po.totalAmount).toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E9ECEF] text-[#495057]">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link href={`/procurement/purchase-orders`} className="text-[#714B67] hover:underline font-semibold">
                        View PO
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Mapping Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#212529]">Map Product to {supplier.legalName}</h3>
              <button onClick={() => setIsMapModalOpen(false)} className="text-[#6C757D] text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleMapProduct} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Select Solar Product Variant *</label>
                <select
                  required
                  value={mapForm.productVariantId}
                  onChange={(e) => setMapForm({ ...mapForm, productVariantId: e.target.value })}
                  className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                >
                  <option value="">-- Choose Catalogue SKU --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName} ({p.name}) - SKU: {p.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Supplier Part Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VSMD-550-OEM"
                    value={mapForm.supplierPartCode}
                    onChange={(e) => setMapForm({ ...mapForm, supplierPartCode: e.target.value })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Negotiated Rate (₹ Excl. Tax) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="11500"
                    value={mapForm.unitPrice}
                    onChange={(e) => setMapForm({ ...mapForm, unitPrice: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={mapForm.leadTimeDays}
                    onChange={(e) => setMapForm({ ...mapForm, leadTimeDays: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Min Order Qty (MOQ)</label>
                  <input
                    type="number"
                    min={1}
                    value={mapForm.minimumOrderQuantity}
                    onChange={(e) => setMapForm({ ...mapForm, minimumOrderQuantity: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prefCheck"
                  checked={mapForm.isPreferred}
                  onChange={(e) => setMapForm({ ...mapForm, isPreferred: e.target.checked })}
                  className="rounded text-[#714B67]"
                />
                <label htmlFor="prefCheck" className="font-semibold text-[#212529]">
                  Designate as Primary / Preferred Supplier for this item
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#58394F] text-white rounded font-semibold"
                >
                  Confirm Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
