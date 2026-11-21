import React from 'react';
import Link from 'next/link';
import { LucideIcon, Plus, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#DEE2E6] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#212529] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {actionLabel && (
        <div>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#017E84] text-white text-xs font-semibold hover:bg-[#00666B] transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#017E84] text-white text-xs font-semibold hover:bg-[#00666B] transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
