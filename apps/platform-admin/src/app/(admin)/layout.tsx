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
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('CHECKING');

  const existingWebUrl =
    process.env.NEXT_PUBLIC_EXISTING_WEB_URL || 'http://localhost:3000';

  useEffect(() => {
    const token = ApiClient.getToken();
    const storedAdmin =
      typeof window !== 'undefined' ? localStorage.getItem('solaros_platform_admin') : null;

    if (!token) {
      router.push('/login');
      return;
    }

    if (storedAdmin) {
      try {
        setAdminUser(JSON.parse(storedAdmin));
      } catch {
        // ignore
      }
    }

    // Verify session with backend
    ApiClient.getMe()
      .then((res) => {
        if (res) {
          setAdminUser(res);
          if (typeof window !== 'undefined') {
            localStorage.setItem('solaros_platform_admin', JSON.stringify(res));
          }
        }
        setLoading(false);
      })
      .catch(() => {
        ApiClient.setToken(null);
        router.push('/login');
      });

    // Check infrastructure health
    ApiClient.getHealth()
      .then((res) => {
        if (res?.status) {
          setHealthStatus(res.status);
        } else {
          setHealthStatus('HEALTHY');
        }
      })
      .catch(() => {
        setHealthStatus('HEALTHY');
      });
  }, [router]);

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

  // Derive robust admin display name and initial (never undefined undefined)
  const firstName = adminUser?.firstName || adminUser?.user?.firstName || '';
  const lastName = adminUser?.lastName || adminUser?.user?.lastName || '';
  const email = adminUser?.email || adminUser?.user?.email || '';

  const adminDisplayName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : email
      ? email.split('@')[0]
      : 'Platform Admin';

  const adminInitial = (
    firstName?.[0] ||
    email?.[0] ||
    'P'
  ).toUpperCase();

  const roleRaw = adminUser?.role || 'PLATFORM_OWNER';
  const roleDisplay = roleRaw.replace(/_/g, ' ');

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#212529] font-sans flex flex-col selection:bg-[#714B67] selection:text-white">
      {/* Platform Admin Topbar */}
      <header className="h-14 bg-[#714B67] text-white flex items-center justify-between px-4 lg:px-6 shrink-0 border-b border-[#5A3750] z-30 shadow-xs">
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

          {/* Operational Status Indicator */}
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-200 text-[11px] font-medium border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* External Link to Customer ERP */}
          <a
            href={`${existingWebUrl}/dashboard`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors border border-white/15"
          >
            <span>Customer ERP</span>
            <ExternalLink className="w-3 h-3 text-white/70" />
          </a>

          {/* Admin User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white border border-white/30">
              {adminInitial}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold leading-tight text-white">
                {adminDisplayName}
              </div>
              <div className="text-[10px] text-white/70 tracking-wider uppercase font-medium">
                {roleDisplay}
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

          {/* Clean Sidebar Footer */}
          <div className="p-3 border-t border-[#E4E5E9] bg-[#FAFAFB]">
            <div className="px-3 py-2 rounded-xl bg-white border border-[#E4E5E9] text-[11px] text-[#737B8B] flex items-center justify-between">
              <div className="font-semibold text-[#151A2B] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#714B67]" />
                <span>Platform Control</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">ACTIVE</span>
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
