'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Share2,
  Trash2
} from 'lucide-react';

export interface StagePill {
  id: string;
  label: string;
  status: 'active' | 'completed' | 'pending';
}

export interface SmartButton {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
}

interface RecordFormLayoutProps {
  backHref?: string;
  backLabel?: string;
  title: string;
  referenceNumber?: string;
  statusText?: string;
  stages?: StagePill[];
  smartButtons?: SmartButton[];
  onSave?: () => void;
  onDiscard?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  tabs?: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  actions?: React.ReactNode;
  auditInfo?: {
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
  };
  children?: React.ReactNode;
}

export function RecordFormLayout({
  backHref,
  backLabel = 'Back',
  title,
  referenceNumber,
  statusText,
  stages,
  smartButtons,
  onSave,
  onDiscard,
  onDelete,
  isSaving = false,
  isDirty = false,
  tabs,
  activeTabId,
  onTabChange,
  actions,
  auditInfo,
  children,
}: RecordFormLayoutProps) {
  const [internalTab, setInternalTab] = useState(tabs?.[0]?.id || '');
  const currentTab = activeTabId || internalTab;

  return (
    <div className="space-y-4">
      {/* Top Action Ribbon (Odoo Control Bar) */}
      <div className="bg-white rounded-xl border border-[#DEE2E6] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C757D] hover:text-[#714B67] px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>
          )}

          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#017E84] text-white text-xs font-semibold hover:bg-[#00666B] disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}

          {onDiscard && (
            <button
              onClick={onDiscard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DEE2E6] bg-white text-xs font-semibold text-[#495057] hover:bg-slate-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          {actions}
        </div>

        {/* Status Pipeline Stages Ribbon */}
        {stages && stages.length > 0 && (
          <div className="flex items-center overflow-x-auto py-1">
            <div className="inline-flex items-center bg-[#F8F9FA] p-1 rounded-lg border border-[#DEE2E6] gap-1">
              {stages.map((st) => (
                <span
                  key={st.id}
                  className={`erp-stage-pill ${
                    st.status === 'active'
                      ? 'erp-stage-pill--active'
                      : st.status === 'completed'
                      ? 'erp-stage-pill--completed'
                      : 'erp-stage-pill--pending'
                  }`}
                >
                  {st.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Sheet Container */}
      <div className="erp-sheet">
        {/* Record Sheet Header & Smart Buttons */}
        <div className="erp-sheet__header flex flex-wrap items-center justify-between gap-4">
          <div>
            {referenceNumber && (
              <span className="font-mono text-xs font-bold text-[#714B67] bg-[#F1EAF0] px-2 py-0.5 rounded">
                {referenceNumber}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-[#212529] mt-1 tracking-tight">
              {title}
            </h1>
            {statusText && (
              <span className="text-xs text-[#6C757D] font-medium mt-0.5 block">
                {statusText}
              </span>
            )}
          </div>

          {/* Smart Buttons Row */}
          {smartButtons && smartButtons.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              {smartButtons.map((btn, idx) => {
                const Icon = btn.icon;
                const content = (
                  <>
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon className="w-3.5 h-3.5 text-[#714B67]" />}
                      <span className="erp-smart-btn__value">{btn.value}</span>
                    </div>
                    <span className="erp-smart-btn__label">{btn.label}</span>
                  </>
                );

                return btn.href ? (
                  <Link key={idx} href={btn.href} className="erp-smart-btn">
                    {content}
                  </Link>
                ) : (
                  <button key={idx} onClick={btn.onClick} className="erp-smart-btn">
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Body or Tabs */}
        {tabs && tabs.length > 0 ? (
          <div>
            {/* Tab Navigation Ribbon */}
            <div className="border-b border-[#DEE2E6] px-6 bg-[#FAFBFD] flex gap-6">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (onTabChange) onTabChange(tab.id);
                      else setInternalTab(tab.id);
                    }}
                    className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                      isActive
                        ? 'border-[#714B67] text-[#714B67]'
                        : 'border-transparent text-[#6C757D] hover:text-[#212529]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="erp-sheet__body">
              {tabs.find((t) => t.id === currentTab)?.content}
            </div>
          </div>
        ) : (
          <div className="erp-sheet__body">{children}</div>
        )}

        {/* Audit Information Footer */}
        {auditInfo && (
          <div className="px-6 py-3 bg-[#FAFBFD] border-t border-[#DEE2E6] rounded-b-lg flex flex-wrap items-center justify-between text-[11px] text-[#6C757D]">
            <div className="flex items-center gap-4">
              {auditInfo.createdBy && (
                <span>Created by: <strong>{auditInfo.createdBy}</strong></span>
              )}
              {auditInfo.createdAt && (
                <span>At: <strong className="font-tabular">{auditInfo.createdAt}</strong></span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {auditInfo.updatedBy && (
                <span>Last updated by: <strong>{auditInfo.updatedBy}</strong></span>
              )}
              {auditInfo.updatedAt && (
                <span>At: <strong className="font-tabular">{auditInfo.updatedAt}</strong></span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
