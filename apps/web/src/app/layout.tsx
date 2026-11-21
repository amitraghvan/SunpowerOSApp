import React from 'react';
import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SolarOS ERP — Solar EPC Operations & SaaS Platform',
  description: 'Enterprise ERP for Solar EPC Contractors, Installers, and Asset Managers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F9FC] text-slate-900 antialiased font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
