'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function PlatformAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@sunpowersolutions.in');
  const [password, setPassword] = useState('SuperAdmin123!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await ApiClient.platformLogin({ email, password });
      if (res?.accessToken) {
        router.push('/platform-admin/overview');
      } else {
        router.push('/platform-admin/overview');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Authentication failed. Please verify platform administrator credentials.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1924] flex items-center justify-center p-4 selection:bg-[#714B67] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center mx-auto mb-4 border border-[#714B67]/20 shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#151A2B]">Platform Control Center</h1>
          <p className="text-xs text-[#737B8B] mt-1.5">
            SunPower Solutions — Master SaaS Administrative Gateway
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
              Platform Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A92A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                placeholder="superadmin@sunpowersolutions.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A92A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Platform Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E4E5E9] text-center space-y-3">
          <div className="text-[11px] text-[#737B8B]">
            Tenant organization members must log in via the{' '}
            <Link href="/login" className="text-[#714B67] font-semibold hover:underline">
              Customer ERP Portal
            </Link>
          </div>
          <div className="text-[10px] text-[#8A92A6]">
            Strict Audit Logging & Role Based Security Enforced
          </div>
        </div>
      </div>
    </div>
  );
}
