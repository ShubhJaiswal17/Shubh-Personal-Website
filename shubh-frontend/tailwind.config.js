/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],

  // 'class' strategy — Tailwind checks for .dark / .light on <html>
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // ── Dark mode (default) ──────────────────────────────────────────
        bg:             '#0A0A0A',
        card:           '#151515',
        'card-hover':   '#1A1A1A',
        border:         '#222222',
        'border-light': '#2E2E2E',
        accent:         '#8B0000',
        'accent-light': '#A50000',
        'accent-dim':   '#3D0000',
        text:           '#FFFFFF',
        muted:          '#B3B3B3',
        faint:          '#666666',
        success:        '#22C55E',
        warning:        '#EAB308',
        error:          '#EF4444',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      animation: {
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'flicker':      'flicker 3s linear infinite',
        'fade-in':      'fadeIn 0.4s ease forwards',
        'shimmer':      'shimmer 1.5s infinite',
      },
      keyframes: {
        flicker: {
          '0%,100%': { opacity: '1' },
          '92%':     { opacity: '1' },
          '93%':     { opacity: '0.4' },
          '94%':     { opacity: '1' },
          '96%':     { opacity: '0.6' },
          '97%':     { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 40px rgba(139, 0, 0, 0.15)',
        'glow-sm':     '0 0 20px rgba(139, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
