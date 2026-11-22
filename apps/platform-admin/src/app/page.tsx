'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';

export default function PlatformRootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = ApiClient.getToken();
    if (token) {
      router.replace('/overview');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] text-xs text-[#737B8B]">
      Connecting to SunPowerOS Platform Administration...
    </div>
  );
}
