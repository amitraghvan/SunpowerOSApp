'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Eye, EyeOff, Lock, Mail, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] px-4 py-12">
      <div className="max-w-md w-full">
        {/* Odoo Enterprise Card */}
        <div className="bg-white rounded-lg shadow-md border border-[#DEE2E6] overflow-hidden">
          {/* Top Brand Banner */}
          <div className="bg-[#714B67] py-6 px-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 ring-1 ring-white/20 mb-2">
              <Sun className="w-7 h-7 text-amber-300" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SolarOS Enterprise ERP</h1>
            <p className="text-xs text-white/80 mt-1">Solar EPC Operations & Management SaaS</p>
          </div>

          <div className="p-8">
            <h2 className="text-base font-semibold text-[#212529] mb-4">Sign in to your account</h2>

            {error && (
              <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@sunpower.com"
                    className="w-full pl-9 pr-3 py-2 border border-[#CED4DA] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#212529]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#017E84] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 border border-[#CED4DA] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#212529]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  Organization Slug <span className="text-[#6C757D] font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={organizationSlug}
                    onChange={(e) => setOrganizationSlug(e.target.value)}
                    placeholder="e.g. sunpower-india"
                    className="w-full pl-9 pr-3 py-2 border border-[#CED4DA] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#495057]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#CED4DA] text-[#714B67] focus:ring-[#714B67]"
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#714B67] hover:bg-[#58394F] text-white font-medium rounded text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Argon2id credentials...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#DEE2E6] text-center text-xs text-[#6C757D]">
              <p>Protected by PostgreSQL Row-Level Security & Argon2id encryption.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-[#6C757D]">
          <span>SolarOS ERP &copy; {new Date().getFullYear()} &middot; Enterprise Edition</span>
        </div>
      </div>
    </div>
  );
}
