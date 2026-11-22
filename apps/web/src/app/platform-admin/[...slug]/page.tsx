'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Shield, ExternalLink } from 'lucide-react';

export default function PlatformAdminCatchAllRedirectPage() {
  const params = useParams();
  const slugArray = Array.isArray(params?.slug) ? params.slug : [params?.slug];
  const targetPath = slugArray.filter(Boolean).join('/');

  const adminUrl =
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_URL || 'http://localhost:3001';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = `${adminUrl}/${targetPath}`;
    }
  }, [adminUrl, targetPath]);

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E4E5E9] shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center mx-auto border border-[#714B67]/20">
          <Shield className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#151A2B]">Redirecting...</h1>
          <p className="text-xs text-[#737B8B] mt-1.5 leading-relaxed">
            Redirecting to dedicated Platform Admin on Port 3001:
          </p>
        </div>

        <a
          href={`${adminUrl}/${targetPath}`}
          className="w-full py-3 rounded-xl bg-[#714B67] hover:bg-[#5A3750] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>Continue to {adminUrl}/{targetPath}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
