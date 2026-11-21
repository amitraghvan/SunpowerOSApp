'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sun, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await ApiClient.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset instructions.');
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
            <p className="text-xs text-white/80 mt-1">Identity & Access Recovery</p>
          </div>

          <div className="p-8">
            <h2 className="text-base font-semibold text-[#212529] mb-1">Reset your password</h2>
            <p className="text-xs text-[#6C757D] mb-5">
              Enter your verified work email address to receive password reset instructions.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {submitted ? (
              <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold text-sm">Instructions Sent</p>
                <p className="text-[#495057]">
                  If an account exists with <strong>{email}</strong>, a cryptographically signed reset link has been dispatched.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-[#714B67] text-white rounded font-medium text-xs hover:bg-[#58394F]"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Work Email Address <span className="text-red-500">*</span>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#714B67] hover:bg-[#58394F] text-white font-medium rounded text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Dispatching...' : 'Send Reset Link'}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs text-[#017E84] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
