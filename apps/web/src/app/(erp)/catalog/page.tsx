'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import {
  Boxes,
  Plus,
  Search,
  Tag,
  Layers,
  History,
  TrendingUp,
  RefreshCw,
  Sun,
  Zap,
  Battery,
  ShieldCheck,
  Building2,
  DollarSign,
} from 'lucide-react';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals & Drawers
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isManufacturerModalOpen, setIsManufacturerModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<any>(null);

  // Forms
  const [productForm, setProductForm] = useState({
    name: 'Mono PERC Bifacial Solar Module 550W',
    code: 'PANEL-MONO-550',
    modelNumber: 'LR5-72HBD-550M',
    type: 'PANEL',
    categoryId: '',
    manufacturerId: '',
    warrantyYears: 25,
    description: 'High efficiency bifacial monocrystalline tier-1 module',
  });

  const [categoryForm, setCategoryForm] = useState({
    code: 'SOLAR_PANELS',
    name: 'Solar PV Modules',
    description: 'Tier-1 Mono and Polycrystalline solar PV panels',
  });

  const [manufacturerForm, setManufacturerForm] = useState({
    code: 'LONGI',
    name: 'LONGi Solar',
    country: 'China',
    website: 'https://www.longi.com',
  });

  const [variantForm, setVariantForm] = useState({
    name: '550W Silver Frame',
    sku: 'PANEL-550-SF',
    ratedCapacityWatts: 550,
    systemVoltage: 1500,
    costPrice: 10500,
    sellingPrice: 13200,
  });

  const [priceUpdateForm, setPriceUpdateForm] = useState({
    variantId: '',
    costPrice: 0,
    sellingPrice: 0,
    reason: 'Quarterly price revision',
  });
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [cats, mans] = await Promise.all([
        ApiClient.getCategories(),
        ApiClient.getManufacturers(),
      ]);
      setCategories(cats || []);
      setManufacturers(mans || []);

      const params: any = {};
      if (selectedCategory !== 'ALL') params.categoryId = selectedCategory;
      if (search) params.search = search;
      const prods = await ApiClient.getProducts(params);
      setProducts(prods.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory]);

  const handleSelectProduct = async (product: any) => {
    setSelectedProduct(product);
    try {
      const full = await ApiClient.getProductById(product.id);
      setProductDetails(full);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createProduct({
        ...productForm,
        categoryId: productForm.categoryId || categories[0]?.id,
        manufacturerId: productForm.manufacturerId || manufacturers[0]?.id,
      });
      setIsProductModalOpen(false);
      fetchCatalog();
      alert('Product created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createCategory(categoryForm);
      setIsCategoryModalOpen(false);
      fetchCatalog();
      alert('Category added successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleCreateManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createManufacturer(manufacturerForm);
      setIsManufacturerModalOpen(false);
      fetchCatalog();
      alert('Manufacturer added successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create manufacturer');
    }
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await ApiClient.createVariant(selectedProduct.id, variantForm);
      const full = await ApiClient.getProductById(selectedProduct.id);
      setProductDetails(full);
      fetchCatalog();
      alert('Variant created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create variant');
    }
  };

  const handleOpenPriceUpdate = async (variant: any) => {
    setPriceUpdateForm({
      variantId: variant.id,
      costPrice: Number(variant.costPrice),
      sellingPrice: Number(variant.sellingPrice),
      reason: 'Market adjustment',
    });
    try {
      const history = await ApiClient.getPriceHistory(variant.id);
      setPriceHistory(history || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.updateVariantPrice(priceUpdateForm.variantId, {
        costPrice: priceUpdateForm.costPrice,
        sellingPrice: priceUpdateForm.sellingPrice,
        reason: priceUpdateForm.reason,
      });
      const full = await ApiClient.getProductById(selectedProduct.id);
      setProductDetails(full);
      const history = await ApiClient.getPriceHistory(priceUpdateForm.variantId);
      setPriceHistory(history || []);
      alert('Price updated & audit record preserved!');
    } catch (err: any) {
      alert(err.message || 'Failed to update price');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#2563EB]" />
            Solar Product Catalog & Pricing
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Modules, Inverters, Batteries, Mounting Structures with variant-level price histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
          >
            + Category
          </button>
          <button
            onClick={() => setIsManufacturerModalOpen(true)}
            className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
          >
            + Manufacturer
          </button>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by model #, product code, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={fetchCatalog}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearch('');
              fetchCatalog();
            }}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900">No products found</h3>
            <p className="text-sm text-slate-500 mt-1">Add your first solar module or inverter to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Model / SKU</th>
                  <th className="px-4 py-3 font-semibold">Category & OEM</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Warranty</th>
                  <th className="px-4 py-3 font-semibold">Variants</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{prod.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{prod.code}</div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700">
                      {prod.modelNumber}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div>{prod.category?.name}</div>
                      <div className="text-slate-400 font-medium">{prod.manufacturer?.name}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                        {prod.type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {prod.warrantyYears} Years
                    </td>

                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                      {prod.variants?.length || 0} Variant(s)
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(prod);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Specs & Pricing &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Detail Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600">{selectedProduct.code}</span>
                <h2 className="text-lg font-bold text-slate-900">{selectedProduct.name}</h2>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product Overview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Manufacturer</span>
                  <span className="font-semibold text-slate-800 text-sm">{productDetails?.manufacturer?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-800 text-sm">{productDetails?.category?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Model Number</span>
                  <span className="font-mono text-slate-800 font-semibold">{productDetails?.modelNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Standard Warranty</span>
                  <span className="font-semibold text-slate-800">{productDetails?.warrantyYears} Years</span>
                </div>
              </div>

              {/* Variants & Pricing Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Product Variants & Commercial Pricing
                  </h3>
                </div>

                <div className="space-y-2">
                  {productDetails?.variants?.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-slate-300"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{v.name}</div>
                        <div className="text-slate-400 font-mono mt-0.5">SKU: {v.sku} • {v.ratedCapacityWatts ? `${v.ratedCapacityWatts}W` : ''}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Selling Price</span>
                          <span className="font-bold text-slate-900 text-sm">₹{Number(v.sellingPrice).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">Cost: ₹{Number(v.costPrice).toLocaleString()}</span>
                        </div>

                        <button
                          onClick={() => handleOpenPriceUpdate(v)}
                          className="px-2 py-1 border border-slate-200 hover:bg-slate-50 rounded text-slate-600 font-medium"
                          title="Price history and adjustments"
                        >
                          Adjust Price
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Variant Form */}
                <form onSubmit={handleCreateVariant} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <span className="font-bold text-slate-800 block">+ Add New Product Variant</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      type="text"
                      placeholder="Variant Name (e.g. 545W All-Black)"
                      value={variantForm.name}
                      onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      required
                      type="text"
                      placeholder="SKU Code"
                      value={variantForm.sku}
                      onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Watts"
                      value={variantForm.ratedCapacityWatts}
                      onChange={(e) => setVariantForm({ ...variantForm, ratedCapacityWatts: parseFloat(e.target.value) })}
                      className="px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      required
                      type="number"
                      placeholder="Cost Price (₹)"
                      value={variantForm.costPrice}
                      onChange={(e) => setVariantForm({ ...variantForm, costPrice: parseFloat(e.target.value) })}
                      className="px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      required
                      type="number"
                      placeholder="Selling Price (₹)"
                      value={variantForm.sellingPrice}
                      onChange={(e) => setVariantForm({ ...variantForm, sellingPrice: parseFloat(e.target.value) })}
                      className="px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-3 py-1 bg-slate-900 text-white rounded font-medium">
                      Add Variant
                    </button>
                  </div>
                </form>
              </div>

              {/* Price Adjustment & History Drawer Popover */}
              {priceUpdateForm.variantId && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Adjust Variant Price & Audit Record
                    </h4>
                    <button
                      onClick={() => setPriceUpdateForm({ variantId: '', costPrice: 0, sellingPrice: 0, reason: '' })}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSavePrice} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">New Cost Price (₹)</label>
                        <input
                          type="number"
                          value={priceUpdateForm.costPrice}
                          onChange={(e) => setPriceUpdateForm({ ...priceUpdateForm, costPrice: parseFloat(e.target.value) })}
                          className="w-full px-2.5 py-1.5 border border-emerald-200 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">New Selling Price (₹)</label>
                        <input
                          type="number"
                          value={priceUpdateForm.sellingPrice}
                          onChange={(e) => setPriceUpdateForm({ ...priceUpdateForm, sellingPrice: parseFloat(e.target.value) })}
                          className="w-full px-2.5 py-1.5 border border-emerald-200 rounded bg-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Adjustment Reason</label>
                      <input
                        type="text"
                        value={priceUpdateForm.reason}
                        onChange={(e) => setPriceUpdateForm({ ...priceUpdateForm, reason: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-emerald-200 rounded bg-white"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded">
                        Save New Price
                      </button>
                    </div>
                  </form>

                  {/* Price History Log */}
                  <div className="space-y-1.5 pt-2 border-t border-emerald-200">
                    <span className="font-semibold text-emerald-900 block">Historical Revisions</span>
                    {priceHistory.map((h) => (
                      <div key={h.id} className="p-2 bg-white rounded border border-emerald-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-800">₹{Number(h.sellingPrice).toLocaleString()}</span>
                          <span className="text-slate-400"> (Cost: ₹{Number(h.costPrice).toLocaleString()})</span>
                          <div className="text-slate-500">{h.reason}</div>
                        </div>
                        <span className="text-slate-400">{new Date(h.effectiveFrom).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register Solar Product</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Product Title *</label>
                <input
                  required
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Internal Code *</label>
                  <input
                    required
                    type="text"
                    value={productForm.code}
                    onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Model Number *</label>
                  <input
                    required
                    type="text"
                    value={productForm.modelNumber}
                    onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="PANEL">Solar Panel</option>
                    <option value="INVERTER">Inverter</option>
                    <option value="BATTERY">Battery</option>
                    <option value="STRUCTURE">Structure</option>
                    <option value="ACCESSORY">BOS Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Manufacturer</label>
                  <select
                    value={productForm.manufacturerId}
                    onChange={(e) => setProductForm({ ...productForm, manufacturerId: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    {manufacturers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Category Name *</label>
                <input
                  required
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Code *</label>
                <input
                  required
                  type="text"
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Manufacturer Modal */}
      {isManufacturerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">New Manufacturer / OEM</h3>
            <form onSubmit={handleCreateManufacturer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Manufacturer Name *</label>
                <input
                  required
                  type="text"
                  value={manufacturerForm.name}
                  onChange={(e) => setManufacturerForm({ ...manufacturerForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Code *</label>
                <input
                  required
                  type="text"
                  value={manufacturerForm.code}
                  onChange={(e) => setManufacturerForm({ ...manufacturerForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Country</label>
                <input
                  type="text"
                  value={manufacturerForm.country}
                  onChange={(e) => setManufacturerForm({ ...manufacturerForm, country: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManufacturerModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium">
                  Save Manufacturer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
