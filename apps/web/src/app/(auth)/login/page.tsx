'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SunpowerLogo } from '@/components/marketing/sunpower-logo';
import { ApiClient } from '@/lib/api-client';
import {
  Lock,
  Mail,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Layers,
  FileCheck2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await ApiClient.login({
        email,
        password,
        organizationSlug: organizationSlug.trim() || undefined,
        rememberMe,
      });

      if (res && res.user) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans selection:bg-[#714B67] selection:text-white">
      {/* Left Column: Brand Story & Product Preview (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 bg-gradient-to-br from-[#714B67] via-[#5D3D54] to-[#3B2535] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#06C6AE]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-white/40 rounded-lg">
            <SunpowerLogo theme="dark" size="md" showTagline />
          </Link>

          <div className="mt-14 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-4">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Solar EPC Operating Platform</span>
            </div>
            <h1 className="font-display font-bold text-3xl xl:text-4xl leading-tight">
              Power every project. From enquiry to installation.
            </h1>
            <p className="mt-4 text-sm text-purple-100 leading-relaxed font-normal">
              SunPowerOS unites leads, rooftop feasibility, solar engineering sizing, dynamic GST quotations, and inward quality inspection under a single governed ERP system.
            </p>
          </div>

          {/* Operational Highlights */}
          <div className="mt-10 space-y-4 max-w-md">
            <div className="flex items-start gap-3 text-xs text-purple-100">
              <CheckCircle2 className="w-4 h-4 text-[#06C6AE] shrink-0 mt-0.5" />
              <span>Automated 5-point inverter electrical compatibility validation</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-purple-100">
              <CheckCircle2 className="w-4 h-4 text-[#06C6AE] shrink-0 mt-0.5" />
              <span>Multi-rate GST quotations with configurable milestone billing</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-purple-100">
              <CheckCircle2 className="w-4 h-4 text-[#06C6AE] shrink-0 mt-0.5" />
              <span>PostgreSQL Row-Level Security ensuring strict organization isolation</span>
            </div>
          </div>
        </div>

        {/* Illustrative Preview Badge */}
        <div className="relative z-10 pt-10 border-t border-white/10 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Argon2id Encrypted • Role-Governed Access</span>
          </div>
          <span className="font-mono text-[11px] opacity-75">v1.0 Production</span>
        </div>
      </div>

      {/* Right Column: Focused Sign In Form */}
      <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#F8F9FA]">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Link href="/">
              <SunpowerLogo size="sm" />
            </Link>
          </div>
          <Link
            href="/"
            className="text-xs text-[#737B8B] hover:text-[#714B67] ml-auto font-medium"
          >
            ← Back to website
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full py-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#151A2B] tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs sm:text-sm text-[#737B8B] mt-1.5">
              Enter your organizational credentials to continue to SunPowerOS ERP.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@solarepc.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DEE2E6] rounded-xl text-sm text-[#151A2B] focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#151A2B]">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  href="/contact"
                  className="text-xs text-[#017E84] hover:underline font-medium"
                >
                  Need password reset?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#DEE2E6] rounded-xl text-sm text-[#151A2B] focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737B8B] hover:text-[#151A2B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                Organization Slug <span className="text-[#737B8B] font-normal">(optional if user has unique email)</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={organizationSlug}
                  onChange={(e) => setOrganizationSlug(e.target.value)}
                  placeholder="e.g. sunpower-india"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DEE2E6] rounded-xl text-sm text-[#151A2B] focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#475065]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DEE2E6] text-[#714B67] focus:ring-[#714B67]"
                />
                <span>Keep me signed in for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full !py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Signup prompt */}
          <div className="mt-8 pt-6 border-t border-[#DEE2E6] text-center text-xs text-[#737B8B]">
            <span>Don&apos;t have an organization workspace? </span>
            <Link href="/signup" className="font-semibold text-[#714B67] hover:underline">
              Create Organization Free
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-[#737B8B] pt-6">
          © {new Date().getFullYear()} SunPower Solutions. All rights reserved.
        </div>
      </div>
    </div>
  );
}
