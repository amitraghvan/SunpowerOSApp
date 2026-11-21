'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CAPABILITIES, CapabilityStatus, ModuleCapability } from '@/lib/capabilities';
import {
  Users,
  UserCheck,
  ClipboardList,
  Package,
  Sun,
  FileSpreadsheet,
  FileText,
  FileSignature,
  ShoppingCart,
  Building,
  Truck,
  Boxes,
  FolderKanban,
  Layers,
  Send,
  Wrench,
  ShieldCheck,
  Receipt,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Users,
  UserCheck,
  ClipboardList,
  Package,
  Sun,
  FileSpreadsheet,
  FileText,
  FileSignature,
  ShoppingCart,
  Building,
  Truck,
  Boxes,
  FolderKanban,
  Layers,
  Send,
  Wrench,
  ShieldCheck,
  Receipt,
};

interface FunctionalGroup {
  id: string;
  name: string;
  tagline: string;
  keys: (keyof typeof CAPABILITIES)[];
}

const functionalGroups: FunctionalGroup[] = [
  {
    id: 'commercial',
    name: 'Commercial & Sales Lifecycle',
    tagline: 'Lead qualification, multi-site customers, GST proposals, legal agreements, and order handoffs.',
    keys: ['CRM', 'CUSTOMERS', 'QUOTATIONS', 'CONTRACTS', 'SALES_ORDERS', 'FINANCE'],
  },
  {
    id: 'technical',
    name: 'Technical Design & Field Engineering',
    tagline: 'Site feasibility surveys, equipment specifications, PV string sizing, and automated BOM calculation.',
    keys: ['SURVEYS', 'CATALOG', 'ENGINEERING', 'BOM', 'PROJECTS', 'INSTALLATION'],
  },
  {
    id: 'operations',
    name: 'Procurement & Supply Chain Operations',
    tagline: 'Approved vendor registry, RFQ rate comparison, PO lifecycle, inward GRN inspection, and serial tracking.',
    keys: ['SUPPLIERS', 'PROCUREMENT', 'INBOUND_GRN', 'INVENTORY', 'DISPATCH', 'WARRANTY'],
  },
];

export function EcosystemSection() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const getStatusBadge = (status: CapabilityStatus, phase: string) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            LIVE
          </span>
        );
      case 'LIMITED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            {phase}
          </span>
        );
      case 'COMING_SOON':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#737B8B]">
            ROADMAP
          </span>
        );
      default:
        return null;
    }
  };

  const displayedGroups =
    activeTab === 'all'
      ? functionalGroups
      : functionalGroups.filter((g) => g.id === activeTab);

  return (
    <section id="ecosystem" className="scroll-mt-24 py-20 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase mb-3">
            UNIFIED APPLICATION ECOSYSTEM
          </div>
          <h2 className="font-display font-bold text-[#151A2B] text-4xl sm:text-5xl lg:text-[54px] leading-tight">
            One solar platform. Every core capability.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475065] leading-relaxed">
            Replace disconnected spreadsheets, paper survey forms, and scattered chat groups with a single role-governed ERP workspace.
          </p>

          {/* Group Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#714B67] text-white shadow-sm'
                  : 'bg-[#F4F4F6] text-[#475065] hover:bg-[#EAEBED]'
              }`}
            >
              All 18 Applications
            </button>
            {functionalGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveTab(group.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === group.id
                    ? 'bg-[#714B67] text-white shadow-sm'
                    : 'bg-[#F4F4F6] text-[#475065] hover:bg-[#EAEBED]'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Capability Display */}
        <div className="space-y-16">
          {displayedGroups.map((group) => (
            <div key={group.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E4E5E9] gap-2">
                <div>
                  <h3 className="text-xl font-bold text-[#151A2B]">{group.name}</h3>
                  <p className="text-xs sm:text-sm text-[#737B8B] mt-0.5">{group.tagline}</p>
                </div>
                <span className="text-xs font-mono font-semibold text-[#714B67] bg-[#F1EAF0] px-3 py-1 rounded-full self-start sm:self-auto">
                  {group.keys.length} Modules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.keys.map((key) => {
                  const app: ModuleCapability = CAPABILITIES[key];
                  if (!app) return null;
                  const IconComponent = iconMap[app.iconName] || Sun;
                  const isLive = app.status === 'LIVE';

                  const card = (
                    <div className="bg-[#FBFBFC] rounded-2xl p-5 border border-[#E4E5E9] hover:bg-white hover:border-[#714B67]/40 hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between group">
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#F1EAF0] text-[#714B67] group-hover:bg-[#714B67] group-hover:text-white transition-colors flex items-center justify-center">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          {getStatusBadge(app.status, app.phase)}
                        </div>

                        <span className="text-[11px] font-semibold text-[#017E84] block mb-0.5">
                          {app.subtitle}
                        </span>
                        <h4 className="font-bold text-base text-[#151A2B] mb-1.5 group-hover:text-[#714B67] transition-colors">
                          {app.name}
                        </h4>
                        <p className="text-xs text-[#737B8B] leading-relaxed line-clamp-3">
                          {app.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F0F1F5] flex items-center justify-between text-xs font-semibold">
                        {isLive ? (
                          <span className="text-[#714B67] group-hover:underline inline-flex items-center gap-1">
                            <span>Open In ERP</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[#737B8B]">{app.phase}</span>
                        )}
                        <span className="text-[10px] text-[#737B8B] font-mono">{app.code}</span>
                      </div>
                    </div>
                  );

                  return isLive ? (
                    <Link key={app.code} href={app.href} className="block">
                      {card}
                    </Link>
                  ) : (
                    <div key={app.code}>{card}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
