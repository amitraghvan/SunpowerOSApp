import React from 'react';
import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SunPowerOS — Platform Administration Control Center',
  description: 'Master Super Admin Control Center for SunPower Solutions SaaS operations, organizations and monitoring',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F6F6F6] text-[#212529] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
