'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Grid,
  Sun,
  Users,
  UserCheck,
  ClipboardList,
  Layers,
  Settings,
  Building2,
  GitBranch,
  LogOut,
  Shield,
  Key,
  ChevronDown,
  Activity,
  History,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export function OdooTopbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [appsOpen, setAppsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeOrg, setActiveOrg] = useState<any>({ name: 'SunPower India', slug: 'sunpower-in' });
  const [activeBranch, setActiveBranch] = useState<string>('Delhi Main Hub');

  useEffect(() => {
    async function loadIdentity() {
      try {
        const me = await ApiClient.getMe();
        if (me?.user) {
          setCurrentUser(me.user);
          setActiveOrg(me.activeOrganization);
          if (me.activeBranch) {
            setActiveBranch(me.activeBranch.name);
          }
        }
      } catch {
        // Unauthenticated or fallback mode
        setCurrentUser({
          firstName: 'Solar',
          lastName: 'Administrator',
          email: 'admin@solaros.io',
          roles: ['SYSTEM_ADMIN'],
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
    if (pathname.startsWith('/crm')) return 'CRM & Pipeline';
    if (pathname.startsWith('/customers')) return 'Customers 360';
    if (pathname.startsWith('/surveys')) return 'Site Surveys';
    if (pathname.startsWith('/catalog')) return 'Product Catalog';
    if (pathname.startsWith('/engineering')) return 'Solar Engineering & BOM';
    if (pathname.startsWith('/quotations')) return 'Quotations & Pricing';
    if (pathname.startsWith('/contracts')) return 'Legal Contracts';
    if (pathname.startsWith('/sales-orders')) return 'Sales Orders & Handoff';
    if (pathname.startsWith('/settings')) return 'Settings & IAM';
    if (pathname.startsWith('/projects')) return 'Projects';
    if (pathname.startsWith('/inventory')) return 'Inventory';
    if (pathname.startsWith('/finance')) return 'Finance';
    return 'Operations Dashboard';
  };

  const apps = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity, color: '#017E84' },
    { name: 'CRM & Leads', href: '/crm', icon: Users, color: '#E26D5C' },
    { name: 'Customers 360', href: '/customers', icon: UserCheck, color: '#38B000' },
    { name: 'Site Surveys', href: '/surveys', icon: ClipboardList, color: '#FFB703' },
    { name: 'Engineering', href: '/engineering', icon: Sun, color: '#0284C7' },
    { name: 'Quotations', href: '/quotations', icon: Layers, color: '#10B981' },
    { name: 'Contracts', href: '/contracts', icon: Shield, color: '#6366F1' },
    { name: 'Sales Orders', href: '/sales-orders', icon: GitBranch, color: '#8B5CF6' },
    { name: 'Product Catalog', href: '/catalog', icon: Layers, color: '#219EBC' },
    { name: 'Settings & IAM', href: '/settings', icon: Settings, color: '#714B67' },
  ];

  return (
    <header className="h-12 bg-[#714B67] text-white flex items-center justify-between px-4 sticky top-0 z-50 select-none shadow-sm">
      {/* Left: App Launcher & Title */}
      <div className="flex items-center gap-3">
        {/* App Launcher (Odoo 9-dots) */}
        <div className="relative">
          <button
            onClick={() => setAppsOpen(!appsOpen)}
            className="p-1.5 hover:bg-[#58394F] rounded transition-colors flex items-center justify-center text-white/90 hover:text-white"
            title="App Launcher"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* App Launcher Dropdown Grid */}
          {appsOpen && (
            <div
              className="absolute left-0 top-12 w-80 bg-white text-[#212529] rounded shadow-2xl border border-[#DEE2E6] p-4 grid grid-cols-3 gap-3 z-50"
              onMouseLeave={() => setAppsOpen(false)}
            >
              {apps.map((app) => {
                const Icon = app.icon;
                const isActive = pathname.startsWith(app.href);
                return (
                  <Link
                    key={app.name}
                    href={app.href}
                    onClick={() => setAppsOpen(false)}
                    className={`flex flex-col items-center justify-center p-3 rounded hover:bg-[#F6F6F6] transition-all group ${
                      isActive ? 'bg-[#F6F6F6] ring-1 ring-[#714B67]' : ''
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: app.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-center line-clamp-1">{app.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Brand & Current Module Title */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-sm tracking-tight hover:opacity-90">
            <Sun className="w-4 h-4 text-amber-300" />
            <span>SolarOS</span>
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-xs font-medium text-white/95">{getAppName()}</span>
        </div>
      </div>

      {/* Right: Tenant, Branch, and User Profile */}
      <div className="flex items-center gap-2 text-xs">
        {/* Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setOrgMenuOpen(!orgMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[#58394F] rounded text-white/90 hover:text-white transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold max-w-[130px] truncate">{activeOrg.name}</span>
            <ChevronDown className="w-3 h-3 text-white/70" />
          </button>

          {orgMenuOpen && (
            <div
              className="absolute right-0 top-9 w-64 bg-white text-[#212529] rounded shadow-lg border border-[#DEE2E6] py-1 z-50"
              onMouseLeave={() => setOrgMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider border-b border-[#DEE2E6]">
                Connected Organizations
              </div>
              <div className="py-1">
                {organizations.length > 0 ? (
                  organizations.map((o) => (
                    <button
                      key={o.organization.id}
                      onClick={async () => {
                        await ApiClient.switchOrganization(o.organization.id);
                        setActiveOrg(o.organization);
                        setOrgMenuOpen(false);
                        window.location.reload();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#F6F6F6] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium truncate">{o.organization.name}</span>
                      {o.organization.id === activeOrg.id && (
                        <span className="text-[#017E84] font-bold text-[10px]">Active</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-[#6C757D]">{activeOrg.name} (Primary)</div>
                )}
              </div>
              <div className="border-t border-[#DEE2E6] px-3 py-1.5">
                <Link
                  href="/settings/organizations"
                  onClick={() => setOrgMenuOpen(false)}
                  className="text-xs text-[#017E84] hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3" /> Manage Organizations
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Branch Context Pill */}
        <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-black/20 text-white/80 rounded text-[11px]">
          <GitBranch className="w-3 h-3 text-teal-300" />
          <span className="truncate max-w-[120px]">{activeBranch}</span>
        </div>

        {/* User Profile Menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 hover:bg-[#58394F] rounded transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#017E84] text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/30">
              {currentUser?.firstName?.[0] || 'S'}
            </div>
            <span className="hidden sm:inline font-medium max-w-[120px] truncate">
              {currentUser?.firstName || 'Solar'} {currentUser?.lastName || 'User'}
            </span>
            <ChevronDown className="w-3 h-3 text-white/70" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 top-9 w-60 bg-white text-[#212529] rounded shadow-xl border border-[#DEE2E6] py-1 z-50 text-xs"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-[#DEE2E6]">
                <div className="font-semibold text-sm">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-[#6C757D] text-[11px] truncate">{currentUser?.email}</div>
                <div className="mt-1">
                  <span className="inline-block px-1.5 py-0.5 bg-[#714B67]/10 text-[#714B67] rounded text-[10px] font-semibold">
                    {currentUser?.isSuperAdmin ? 'Super Administrator' : 'Enterprise User'}
                  </span>
                </div>
              </div>

              <div className="py-1 border-b border-[#DEE2E6]">
                <Link
                  href="/settings/users"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F6F6F6]"
                >
                  <Users className="w-3.5 h-3.5 text-[#6C757D]" />
                  <span>Team & Users</span>
                </Link>
                <Link
                  href="/settings/roles"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F6F6F6]"
                >
                  <Shield className="w-3.5 h-3.5 text-[#6C757D]" />
                  <span>Access Rights (RBAC)</span>
                </Link>
                <Link
                  href="/settings/sessions"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F6F6F6]"
                >
                  <Key className="w-3.5 h-3.5 text-[#6C757D]" />
                  <span>Active Sessions & Devices</span>
                </Link>
                <Link
                  href="/settings/audit-logs"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F6F6F6]"
                >
                  <History className="w-3.5 h-3.5 text-[#6C757D]" />
                  <span>Audit Trail</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
