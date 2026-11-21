'use client';

import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';

/**
 * Tenant Switcher Placeholder
 * Per Phase 0 specifications: Contains NO fake organization records or dummy names.
 * Displays active tenant state or prompting when multi-tenancy context is assigned.
 */
export function TenantSwitcher() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
        <Building2 className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-slate-800 leading-tight">
          Default Organization
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Tenant Context
        </span>
      </div>
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
    </div>
  );
}
