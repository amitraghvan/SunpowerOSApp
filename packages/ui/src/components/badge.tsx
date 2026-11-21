import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'analytics';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'neutral',
  children,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-blue-50 text-[#2563EB] border-blue-200',
    success: 'bg-teal-50 text-[#14B8A6] border-teal-200',
    warning: 'bg-amber-50 text-[#F59E0B] border-amber-200',
    danger: 'bg-rose-50 text-[#F43F5E] border-rose-200',
    analytics: 'bg-purple-50 text-[#8B5CF6] border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
