'use client';

import React from 'react';
import { User } from 'lucide-react';

export function UserNav() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-semibold text-xs border border-blue-200">
        <User className="w-4 h-4" />
      </div>
      <div className="hidden lg:flex flex-col text-left">
        <span className="text-xs font-semibold text-slate-800 leading-tight">Admin User</span>
        <span className="text-[10px] text-slate-400">admin@solaros.local</span>
      </div>
    </div>
  );
}
