import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h3>}
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
