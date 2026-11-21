import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Plus,
  LayoutList,
  Kanban,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'plum' | 'neutral';
  };
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryActions?: {
    label: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  viewSwitcher?: {
    current: 'list' | 'kanban';
    onChange: (view: 'list' | 'kanban') => void;
  };
  onRefresh?: () => void;
  children?: React.ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  badge,
  primaryAction,
  secondaryActions,
  viewSwitcher,
  onRefresh,
  children,
}: PageHeaderProps) {
  const getBadgeClass = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'erp-badge--success';
      case 'warning':
        return 'erp-badge--warning';
      case 'danger':
        return 'erp-badge--danger';
      case 'info':
        return 'erp-badge--info';
      case 'plum':
        return 'erp-badge--plum';
      default:
        return 'erp-badge--neutral';
    }
  };

  return (
    <div className="bg-white border-b border-[#DEE2E6] mb-6 -mx-6 -mt-6 p-6 pb-5 shadow-2xs">
      {/* Breadcrumb row */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#6C757D] mb-2 font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-[#ADB5BD] shrink-0" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[#714B67] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#212529] font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#212529] tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className={`erp-badge ${getBadgeClass(badge.variant)}`}>
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6C757D] mt-1">{subtitle}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg border border-[#DEE2E6] text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#212529] transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {viewSwitcher && (
            <div className="flex items-center bg-[#F8F9FA] p-0.5 rounded-lg border border-[#DEE2E6]">
              <button
                onClick={() => viewSwitcher.onChange('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewSwitcher.current === 'list'
                    ? 'bg-white text-[#714B67] shadow-2xs font-semibold'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => viewSwitcher.onChange('kanban')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewSwitcher.current === 'kanban'
                    ? 'bg-white text-[#714B67] shadow-2xs font-semibold'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
                title="Kanban View"
              >
                <Kanban className="w-4 h-4" />
              </button>
            </div>
          )}

          {secondaryActions?.map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                onClick={act.onClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DEE2E6] bg-white text-xs font-semibold text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529] transition-colors"
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{act.label}</span>
              </button>
            );
          })}

          {primaryAction && (
            <>
              {primaryAction.href ? (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#017E84] text-white text-xs font-semibold hover:bg-[#00666B] transition-colors shadow-2xs"
                >
                  {primaryAction.icon ? (
                    <primaryAction.icon className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{primaryAction.label}</span>
                </Link>
              ) : (
                <button
                  onClick={primaryAction.onClick}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#017E84] text-white text-xs font-semibold hover:bg-[#00666B] transition-colors shadow-2xs"
                >
                  {primaryAction.icon ? (
                    <primaryAction.icon className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{primaryAction.label}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {children && <div className="mt-4 pt-4 border-t border-[#DEE2E6]">{children}</div>}
    </div>
  );
}
