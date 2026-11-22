'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';

export default function PlatformAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const existingWebUrl =
    process.env.NEXT_PUBLIC_EXISTING_WEB_URL || 'http://localhost:3000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await ApiClient.login({ email: email.trim(), password });
      if (res?.accessToken) {
        router.push('/overview');
      } else {
        router.push('/overview');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Authentication failed. Please check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 selection:bg-[#714B67] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#DEE2E6]">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center mx-auto mb-4 border border-[#714B67]/20 shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#151A2B] tracking-tight">Platform Control Center</h1>
          <p className="text-xs text-[#6C757D] mt-1.5">
            SunPower Solutions — Administrative Sign In
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A92A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DEE2E6] text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                placeholder="admin@sunpowersolutions.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A92A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DEE2E6] text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A92A6] hover:text-[#151A2B] transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#DEE2E6] text-center space-y-3">
          <div className="text-[11px] text-[#6C757D] flex items-center justify-center gap-1.5">
            <span>Customer organization user?</span>
            <a
              href={`${existingWebUrl}/login`}
              target="_blank"
              rel="noreferrer"
              className="text-[#714B67] font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span>Go to Customer ERP</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
