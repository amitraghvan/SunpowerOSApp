import React from 'react';

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white rounded-xl border border-[#DEE2E6] overflow-hidden animate-pulse">
      {/* Top search/filter bar skeleton */}
      <div className="p-3 border-b border-[#DEE2E6] flex items-center justify-between">
        <div className="h-8 w-64 bg-slate-200 rounded-md" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-slate-200 rounded-md" />
          <div className="h-8 w-24 bg-slate-200 rounded-md" />
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-[#E9ECEF]">
        <div className="p-3 bg-[#F8F9FA] flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-300 rounded flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3.5 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-3.5 bg-slate-100 rounded flex-1"
                style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="w-full bg-white rounded-xl border border-[#DEE2E6] p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-[#DEE2E6]">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-12 w-20 bg-slate-100 rounded" />
          <div className="h-12 w-20 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-9 w-full bg-slate-100 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-9 w-full bg-slate-100 rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-9 w-full bg-slate-100 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-9 w-full bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#DEE2E6] p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-5 w-5 bg-slate-200 rounded-full" />
          </div>
          <div className="h-7 w-32 bg-slate-300 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}
