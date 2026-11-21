'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563EB] text-white font-bold text-xl mb-3 shadow-sm">
            ☀️
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to SolarOS</h1>
          <p className="text-sm text-slate-500 mt-1">Solar EPC Enterprise Operations Platform</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Organization Slug
            </label>
            <input
              type="text"
              placeholder="e.g. acme-solar"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Work Email
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors shadow-sm"
          >
            Authenticate Session
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Protected by Multi-Tenant RBAC & Hardware Security Module isolation.</p>
        </div>
      </div>
    </div>
  );
}
