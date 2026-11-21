/**
 * SolarOS Enterprise Design Tokens
 * Strictly following Phase 0 specification palette.
 */
export const SOLAROS_TOKENS = {
  colors: {
    primary: '#2563EB',    // Royal Blue
    success: '#14B8A6',    // Teal / Mint
    analytics: '#8B5CF6',  // Purple / Violet
    warning: '#F59E0B',    // Amber
    danger: '#F43F5E',     // Rose / Red
    background: '#F7F9FC', // Soft Cool Gray
    surface: '#FFFFFF',    // Pure White
  },
  typography: {
    fontFamilySans: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'JetBrains Mono, monospace',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  }
} as const;
