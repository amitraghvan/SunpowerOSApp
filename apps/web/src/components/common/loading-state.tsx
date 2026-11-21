import React from 'react';

export function LoadingState({ message = 'Loading SolarOS...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-8 h-8 border-3 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin mb-3" />
      <span className="text-xs font-medium text-slate-500">{message}</span>
    </div>
  );
}
