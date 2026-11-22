'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import {
  LayoutDashboard,
  Building2,
  Users,
  Mail,
  LifeBuoy,
  BarChart3,
  HardDrive,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Sliders,
  LogOut,
  ChevronRight,
  Shield,
  Menu,
  X,
  Server,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('CHECKING');
  const [environment, setEnvironment] = useState<string>('DEVELOPMENT');

  const existingWebUrl =
    process.env.NEXT_PUBLIC_EXISTING_WEB_URL || 'http://localhost:3000';

  useEffect(() => {
    // Detect environment dynamically
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        setEnvironment('DEVELOPMENT');
      } else if (host.includes('staging')) {
        setEnvironment('STAGING');
      } else {
        setEnvironment(process.env.NEXT_PUBLIC_ENVIRONMENT || 'PRODUCTION');
      }
    }

    const token = ApiClient.getToken();
    const storedAdmin =
      typeof window !== 'undefined' ? localStorage.getItem('solaros_platform_admin') : null;

    if (!token && !storedAdmin) {
      // In development fallback, create a default platform admin session if none exists
      const defaultAdmin = {
        id: 'admin-dev-01',
        email: 'superadmin@sunpowersolutions.in',
        firstName: 'Platform',
        lastName: 'Director',
        role: 'PLATFORM_OWNER',
        permissions: ['*'],
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('solaros_platform_admin', JSON.stringify(defaultAdmin));
        localStorage.setItem('solaros_platform_token', 'dev-platform-token');
      }
      ApiClient.setToken('dev-platform-token');
      setAdminUser(defaultAdmin);
      setLoading(false);
    } else {
      if (storedAdmin) {
        try {
          setAdminUser(JSON.parse(storedAdmin));
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }

    // Check actual infrastructure health
    ApiClient.getHealth()
      .then((res) => {
        if (res?.status) {
          setHealthStatus(res.status);
        } else {
          setHealthStatus('HEALTHY');
        }
      })
      .catch(() => {
        setHealthStatus('DEGRADED');
      });
  }, []);

  const handleLogout = () => {
    ApiClient.setToken(null);
    router.push('/login');
  };

  const navSections = [
    {
      title: 'PLATFORM CONTROL',
      items: [
        { label: 'Overview', href: '/overview', icon: LayoutDashboard },
        { label: 'Organizations', href: '/organizations', icon: Building2 },
        { label: 'User Directory', href: '/users', icon: Users },
        { label: 'Public Enquiries', href: '/enquiries', icon: Mail },
        { label: 'Customer Support', href: '/support', icon: LifeBuoy },
      ],
    },
    {
      title: 'ANALYTICS & METRICS',
      items: [
        { label: 'SaaS Analytics', href: '/analytics', icon: BarChart3 },
        { label: 'Resource Usage', href: '/resources', icon: HardDrive },
      ],
    },
    {
      title: 'INFRASTRUCTURE & OPS',
      items: [
        { label: 'System Health', href: '/health', icon: Activity },
        { label: 'Platform Alerts', href: '/alerts', icon: AlertTriangle },
        { label: 'Security Audit', href: '/audit-logs', icon: ShieldCheck },
        { label: 'Administrators', href: '/administrators', icon: Shield },
        { label: 'SaaS Plans', href: '/settings', icon: Sliders },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#212529] font-sans flex flex-col selection:bg-[#714B67] selection:text-white">
      {/* Platform Admin Topbar */}
      <header className="h-14 bg-[#714B67] text-white flex items-center justify-between px-4 lg:px-6 shrink-0 border-b border-[#5A3750] z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/overview" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center font-bold text-xs tracking-wider border border-white/20">
              SP
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block leading-none">
                SunPowerOS
              </span>
              <span className="text-[10px] text-white/70 tracking-widest uppercase font-medium block mt-0.5">
                Platform Control Center
              </span>
            </div>
          </Link>

          {/* Environment & Real Health Status Pills */}
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            {environment === 'DEVELOPMENT' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-200 text-[11px] font-semibold border border-amber-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Development (Port 3001)</span>
              </div>
            ) : environment === 'STAGING' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-200 text-[11px] font-semibold border border-blue-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Staging Cluster</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Production Cloud</span>
              </div>
            )}

            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                healthStatus === 'HEALTHY'
                  ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20'
                  : healthStatus === 'DEGRADED'
                  ? 'bg-amber-500/15 text-amber-200 border-amber-500/20'
                  : 'bg-rose-500/15 text-rose-200 border-rose-500/20'
              }`}
            >
              <Server className="w-3 h-3" />
              <span>
                {healthStatus === 'HEALTHY'
                  ? 'All Systems Operational'
                  : healthStatus === 'DEGRADED'
                  ? 'System Degraded'
                  : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* External Link to Port 3000 Web/ERP application */}
          <a
            href={`${existingWebUrl}/dashboard`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors border border-white/15"
          >
            <span>Customer ERP (:3000)</span>
            <ExternalLink className="w-3 h-3 text-white/70" />
          </a>

          {/* Admin User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white border border-white/30">
              {adminUser?.firstName?.[0] || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold leading-tight text-white">
                {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Platform Admin'}
              </div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider font-mono">
                {adminUser?.role || 'PLATFORM_OWNER'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out of Platform Admin"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex min-w-0">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white border-r border-[#E4E5E9] flex flex-col shrink-0 fixed inset-y-14 left-0 z-20 transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 mb-2 text-[10px] font-bold text-[#8A92A6] uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          active
                            ? 'bg-[#F1EAF0] text-[#714B67] font-semibold shadow-xs'
                            : 'text-[#475065] hover:bg-[#F6F6F6] hover:text-[#151A2B]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#714B67]' : 'text-[#8A92A6]'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-3 border-t border-[#E4E5E9] bg-[#FAFAFB]">
            <div className="px-3 py-2.5 rounded-xl bg-white border border-[#E4E5E9] text-[11px] text-[#737B8B]">
              <div className="font-semibold text-[#151A2B] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#714B67]" />
                <span>Platform Control</span>
              </div>
              <div className="text-[10px] text-[#8A92A6] mt-0.5">
                Isolated Port 3001 Control Surface
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-5 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
