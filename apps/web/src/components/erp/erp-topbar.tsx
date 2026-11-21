'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Grid,
  Sun,
  Users,
  UserCheck,
  ClipboardList,
  Package,
  FileSpreadsheet,
  FileText,
  FileSignature,
  ShoppingCart,
  Truck,
  Boxes,
  Settings,
  Building2,
  GitBranch,
  LogOut,
  Shield,
  Key,
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface ErpTopbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function ErpTopbar({ onToggleSidebar, sidebarCollapsed }: ErpTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [appsOpen, setAppsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeOrg, setActiveOrg] = useState<any>({ name: 'SunPower India', slug: 'sunpower-in' });
  const [activeBranch, setActiveBranch] = useState<string>('Delhi Main Hub');

  const appsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (appsMenuRef.current && !appsMenuRef.current.contains(event.target as Node)) {
        setAppsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setOrgMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadIdentity() {
      try {
        const me = await ApiClient.getMe();
        if (me?.user) {
          setCurrentUser(me.user);
          if (me.activeOrganization) {
            setActiveOrg(me.activeOrganization);
          }
          if (me.activeBranch) {
            setActiveBranch(me.activeBranch.name);
          }
        }
      } catch {
        // Fallback default for demo/unauthenticated preview
        setCurrentUser({
          firstName: 'Solar',
          lastName: 'Engineer',
          email: 'engineer@sunpoweros.in',
          roles: ['SOLAR_ENGINEER', 'ORG_ADMIN'],
        });
      }

      try {
        const orgs = await ApiClient.getOrganizations();
        if (orgs && orgs.length > 0) {
          setOrganizations(orgs);
        }
      } catch {
        // fallback
      }
    }
    loadIdentity();
  }, []);

  const handleLogout = async () => {
    try {
      await ApiClient.logout();
    } catch {
      // ignore
    }
    router.push('/login');
  };

  const getAppName = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/crm')) return 'CRM & Sales';
    if (pathname.startsWith('/customers')) return 'Customers 360';
    if (pathname.startsWith('/surveys')) return 'Site Surveys';
    if (pathname.startsWith('/catalog')) return 'Product Catalog';
    if (pathname.startsWith('/engineering')) return 'Solar Engineering & BOM';
    if (pathname.startsWith('/quotations')) return 'Quotations & Pricing';
    if (pathname.startsWith('/contracts')) return 'Legal Contracts';
    if (pathname.startsWith('/sales-orders')) return 'Sales Orders';
    if (pathname.startsWith('/suppliers')) return 'Suppliers & Vendors';
    if (pathname.startsWith('/procurement')) return 'Procurement & Supply Chain';
    if (pathname.startsWith('/settings')) return 'Settings & IAM';
    return 'SunPowerOS';
  };

  return (
    <header className="h-[58px] bg-[#714B67] text-white flex items-center justify-between px-3 sm:px-4 shrink-0 select-none shadow-sm relative z-50">
      {/* Left: Odoo 9-Dot Launcher + Brand + App Name */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded hover:bg-white/10 lg:hidden text-white"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 9-Dot App Launcher */}
        <div className="relative" ref={appsMenuRef}>
          <button
            onClick={() => setAppsOpen(!appsOpen)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              appsOpen ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            title="Application Launcher"
          >
            <Grid className="w-5 h-5 text-white" />
          </button>

          {/* Odoo Full-Screen App Launcher Dropdown */}
          {appsOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-[360px] sm:w-[480px] bg-white text-[#212529] rounded-2xl shadow-2xl border border-[#DEE2E6] p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <Link
                href="/dashboard"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Dashboard</span>
              </Link>

              <Link
                href="/crm"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008784] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">CRM</span>
              </Link>

              <Link
                href="/customers"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0284C7] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Customers</span>
              </Link>

              <Link
                href="/surveys"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E11D48] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Surveys</span>
              </Link>

              <Link
                href="/engineering"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Engineering</span>
              </Link>

              <Link
                href="/catalog"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#475569] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Catalog</span>
              </Link>

              <Link
                href="/quotations"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Quotations</span>
              </Link>

              <Link
                href="/contracts"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <FileSignature className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Contracts</span>
              </Link>

              <Link
                href="/sales-orders"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0891B2] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Sales Orders</span>
              </Link>

              <Link
                href="/procurement"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Procurement</span>
              </Link>

              <Link
                href="/suppliers"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Suppliers</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setAppsOpen(false)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F8F9FA] text-center group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#475569] group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#151A2B] group-hover:text-[#714B67]">Settings</span>
              </Link>
            </div>
          )}
        </div>

        {/* Brand & App Name */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="font-bold text-sm tracking-tight hover:opacity-90">
            SunPowerOS
          </Link>
          <span className="opacity-40 text-xs">/</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/10 text-white/95">
            {getAppName()}
          </span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            readOnly
            placeholder="Search records, leads, designs..."
            className="w-full pl-8 pr-3 py-1 bg-white/10 border border-white/15 rounded-lg text-xs text-white placeholder-white/50 focus:outline-none focus:bg-white/20 cursor-pointer"
          />
        </div>
      </div>

      {/* Right Controls: Org Switcher, Branch, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Multi-tenant Org Switcher */}
        <div className="relative" ref={orgMenuRef}>
          <button
            onClick={() => setOrgMenuOpen(!orgMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-xs font-medium"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="max-w-[120px] truncate hidden sm:inline">{activeOrg?.name || 'Solar Org'}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {orgMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-60 bg-white text-[#212529] rounded-xl shadow-xl border border-[#DEE2E6] py-1 z-50">
              <div className="px-3 py-2 border-b border-[#DEE2E6] text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
                Active Organization
              </div>
              <div className="p-2">
                <div className="font-bold text-xs text-[#151A2B]">{activeOrg?.name}</div>
                <div className="text-[11px] text-[#6C757D] font-mono">Slug: {activeOrg?.slug}</div>
              </div>
              <div className="px-3 py-1.5 bg-[#F8F9FA] border-t border-[#DEE2E6] flex items-center justify-between text-[11px] text-[#6C757D]">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-[#008784]" />
                  <span>{activeBranch}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  RLS ACTIVE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-white text-[#714B67] flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.firstName?.[0] || 'S'}
              {currentUser?.lastName?.[0] || 'E'}
            </div>
            <ChevronDown className="w-3 h-3 opacity-70 hidden sm:inline" />
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-white text-[#212529] rounded-xl shadow-xl border border-[#DEE2E6] py-1 z-50 animate-in fade-in-50 duration-100">
              <div className="px-4 py-3 border-b border-[#DEE2E6]">
                <div className="font-bold text-xs text-[#151A2B]">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-[11px] text-[#6C757D] truncate mt-0.5">
                  {currentUser?.email}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[#714B67] text-[10px] font-bold">
                    {currentUser?.roles?.[0] || 'ENGINEER'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#212529] hover:bg-[#F8F9FA]"
                >
                  <Settings className="w-3.5 h-3.5 text-[#6C757D]" />
                  <span>ERP Settings</span>
                </Link>
                <Link
                  href="/settings/roles"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#212529] hover:bg-[#F8F9FA]"
                >
                  <Shield className="w-3.5 h-3.5 text-[#6C757D]" />
                  <span>My Permissions</span>
                </Link>
              </div>

              <div className="border-t border-[#DEE2E6] py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
