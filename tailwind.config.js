/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          // Primary Light Palette (Marketing & App Shell)
          bg: '#F6F6F3',
          'bg-secondary': '#FAFAF8',
          card: '#FFFFFF',
          'card-muted': '#F4F4F0',
          border: '#E5E5E2',
          'border-subtle': '#EFEFEA',
          'border-hover': '#D4D4CE',
          
          // Typography
          text: {
            primary: '#111318',
            secondary: '#626873',
            muted: '#8B919B',
          },
          
          // Primary Accents (used with restraint)
          accent: {
            DEFAULT: '#6D4AFF',
            hover: '#5B3CE8',
            subtle: 'rgba(109, 74, 255, 0.08)',
            border: 'rgba(109, 74, 255, 0.25)',
          },
          blue: {
            DEFAULT: '#3B82F6',
            subtle: 'rgba(59, 130, 246, 0.08)',
          },
          cyan: {
            DEFAULT: '#22C7E8',
            subtle: 'rgba(34, 199, 232, 0.08)',
          },
          emerald: {
            DEFAULT: '#10B981',
            subtle: 'rgba(16, 185, 129, 0.08)',
          },
          amber: {
            DEFAULT: '#F59E0B',
            subtle: 'rgba(245, 158, 11, 0.08)',
          },

          // Strategic Dark Palette (Technical Canvases, Execution Monitors, Graph Views)
          dark: {
            bg: '#111318',
            surface: '#15171C',
            elevated: '#1C1F26',
            card: '#181A21',
            border: 'rgba(255, 255, 255, 0.08)',
            'border-subtle': 'rgba(255, 255, 255, 0.04)',
            'border-hover': 'rgba(255, 255, 255, 0.16)',
            text: '#F5F7FA',
            'text-secondary': '#9BA3AF',
            'text-muted': '#626A78',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'button-primary': '0 2px 8px rgba(109, 74, 255, 0.25)',
        'dark-card': '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'flow-line': 'flowLine 3s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        flowLine: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
