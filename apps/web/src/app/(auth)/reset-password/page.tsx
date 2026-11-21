'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sun, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ApiClient.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. The token may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md border border-[#DEE2E6] overflow-hidden">
          <div className="bg-[#714B67] py-6 px-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 ring-1 ring-white/20 mb-2">
              <Sun className="w-7 h-7 text-amber-300" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SolarOS ERP</h1>
            <p className="text-xs text-white/80 mt-1">Set New Password</p>
          </div>

          <div className="p-8">
            <h2 className="text-base font-semibold text-[#212529] mb-1">Create a new password</h2>
            <p className="text-xs text-[#6C757D] mb-5">
              Choose a strong password to protect your enterprise account.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {success ? (
              <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold text-sm">Password Updated!</p>
                <p className="text-[#495057]">
                  Your password has been successfully updated with Argon2id encryption. All other sessions have been invalidated.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-[#714B67] text-white rounded font-medium text-xs hover:bg-[#58394F]"
                  >
                    Proceed to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Reset Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your 64-character token"
                    className="w-full px-3 py-2 border border-[#CED4DA] rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
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
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-10 py-2 border border-[#CED4DA] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#714B67] hover:bg-[#58394F] text-white font-medium rounded text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] text-xs">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
