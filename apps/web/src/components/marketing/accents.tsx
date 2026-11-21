import React from 'react';

/**
 * Hand-drawn teal underline SVG
 */
export function AccentUnderline({ className = '', color = '#06C6AE' }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 250 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block w-full overflow-visible ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M3 13C45 5 110 4 247 11C180 16 75 18 12 17"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hand-drawn sketch circle SVG around words
 */
export function AccentCircle({ className = '', color = '#FF747C' }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 160 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 -m-3 pointer-events-none w-[calc(100%+24px)] h-[calc(100%+24px)] overflow-visible ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M14 35C14 16 48 8 95 8C142 8 152 23 152 38C152 55 125 64 78 64C28 64 8 52 8 35C8 22 25 14 55 11"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hand-drawn curved sketch arrow SVG
 */
export function SketchArrow({ className = '', color = '#FFB32C' }: { className?: string; color?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 38C14 26 24 16 38 12M38 12L28 10M38 12L36 22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hand-drawn coral sparkle / energy ray
 */
export function CoralSpark({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2V6M12 18V22M2 12H6M18 12H22M5 5L8 8M16 16L19 19M5 19L8 16M16 8L19 5"
        stroke="#FF747C"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
