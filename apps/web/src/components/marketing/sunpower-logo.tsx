import React from 'react';

interface SunpowerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  theme?: 'dark' | 'light';
}

export function SunpowerLogo({
  className = '',
  size = 'md',
  showTagline = false,
  theme = 'light',
}: SunpowerLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 34,
    lg: 42,
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const isLight = theme === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Solar Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:rotate-45"
        >
          {/* Subtle Outer Orbit Ring */}
          <circle cx="20" cy="20" r="18" stroke="#E4E5E9" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Solar Core */}
          <circle cx="20" cy="20" r="8" fill="#714B67" />
          
          {/* Geometric Solar Energy Rays */}
          <path d="M20 3V8" stroke="#FF747C" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M20 32V37" stroke="#06C6AE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M3 20H8" stroke="#06C6AE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 20H37" stroke="#FFB32C" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Diagonal Solar Flux Points */}
          <circle cx="8" cy="8" r="2.2" fill="#FFB32C" />
          <circle cx="32" cy="8" r="2.2" fill="#FF747C" />
          <circle cx="32" cy="32" r="2.2" fill="#06C6AE" />
          <circle cx="8" cy="32" r="2.2" fill="#36B9F6" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${textClasses[size]} ${isLight ? 'text-[#151A2B]' : 'text-white'}`}>
          <span>SunPower</span>
          <span className="text-[#714B67] dark:text-[#FF747C]">OS</span>
        </div>
        {showTagline && (
          <span className={`text-[10px] uppercase font-semibold tracking-wider mt-0.5 ${isLight ? 'text-[#737B8B]' : 'text-[#A0A8B8]'}`}>
            Solar EPC Operations
          </span>
        )}
      </div>
    </div>
  );
}

export function SunpowerMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="18" stroke="#E4E5E9" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="20" cy="20" r="8" fill="#714B67" />
      <path d="M20 3V8" stroke="#FF747C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 32V37" stroke="#06C6AE" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M3 20H8" stroke="#06C6AE" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 20H37" stroke="#FFB32C" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2.2" fill="#FFB32C" />
      <circle cx="32" cy="8" r="2.2" fill="#FF747C" />
      <circle cx="32" cy="32" r="2.2" fill="#06C6AE" />
      <circle cx="8" cy="32" r="2.2" fill="#36B9F6" />
    </svg>
  );
}
