import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        solaros: {
          primary: '#2563EB',    // Royal Blue
          success: '#14B8A6',    // Teal / Mint
          analytics: '#8B5CF6',  // Purple / Violet
          warning: '#F59E0B',    // Amber
          danger: '#F43F5E',     // Rose / Red
          background: '#F7F9FC', // Soft Cool Gray
          surface: '#FFFFFF',    // Pure White
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
