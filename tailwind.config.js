/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./app/**/*.{js,vue,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ===== CLAUDE.AI COMPLETE PALETTE =====

        // Brand Colors
        'claude-primary': '#CC785C',
        'claude-hover': '#B86849',
        'claude-active': '#A65738',
        'claude-focus': '#E8B4A0',
        'claude-light': '#F5E6E0',
        'claude-subtle': 'rgba(204, 120, 92, 0.08)',

        // Backgrounds
        'claude-bg': '#FFFFFF',
        'claude-bg-secondary': '#F5F5F5',
        'claude-bg-tertiary': '#FAFAFA',
        'claude-bg-hover': '#F8F8F8',
        'claude-bg-sidebar': '#FAFAFA',
        'claude-bg-input': '#FFFFFF',
        'claude-bg-disabled': '#F5F5F5',

        // Text Colors
        'claude-text': '#2C2C2C',
        'claude-text-secondary': '#6B6B6B',
        'claude-text-tertiary': '#999999',
        'claude-text-placeholder': '#B0B0B0',
        'claude-text-disabled': '#CCCCCC',
        'claude-text-link': '#CC785C',

        // Borders
        'claude-border': '#E5E5E5',
        'claude-border-secondary': '#D4D4D4',
        'claude-border-input': '#CCCCCC',
        'claude-border-hover': '#999999',

        // Messages
        'claude-message-user': '#F5F5F5',
        'claude-message-assistant': '#FFFFFF',

        // Orange/Terracotta (substitui azul no tema claro)
        'orange-primary': '#ca643f',
        'orange-hover': '#b85635',
        'orange-light': '#f0e8e1',

        // Primary verde (tema escuro original)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        // Dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'claude-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'claude-md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'claude-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'claude-xl': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      borderRadius: {
        'claude-sm': '6px',
        'claude-md': '8px',
        'claude-lg': '12px',
        'claude-xl': '16px',
      },
    },
  },
  plugins: [],
}

