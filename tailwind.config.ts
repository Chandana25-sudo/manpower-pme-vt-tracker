import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#cde2fb',
          100: '#b7d3f6',
          200: '#9ec5f4',
          300: '#6da7ec',
          400: '#3987e5',
          500: '#2a78d6',
          600: '#256abf',
          700: '#1c5cab',
          800: '#184f95',
          900: '#0d366b',
        },
        teal: {
          500: '#1baf7a',
          600: '#178f63',
          700: '#12734f',
        },
        status: {
          good: '#0ca30c',
          warning: '#fab219',
          serious: '#ec835a',
          critical: '#d03b3b',
        },
        surface: '#fcfcfb',
        page: '#f9f9f7',
        ink: {
          DEFAULT: '#0b0b0b',
          secondary: '#52514e',
          muted: '#898781',
        },
        hairline: '#e1e0d9',
      },
      boxShadow: {
        tile: '0 1px 2px 0 rgba(11, 11, 11, 0.06)',
        'tile-hover': '0 4px 12px 0 rgba(11, 11, 11, 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config
