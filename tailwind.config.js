/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4B2EFF',
          dark: '#3A22CC',
          light: '#6B4FFF',
        },
        accent: {
          DEFAULT: '#9C5BFF',
          light: '#B682FF',
        },
        bg: {
          DEFAULT: '#080808',
          soft: '#0F0F12',
        },
        card: {
          DEFAULT: '#121212',
          hover: '#181818',
          border: '#232323',
        },
        ink: {
          DEFAULT: '#FFFFFF',
          muted: '#A0A0A0',
          faint: '#6B6B6F',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'vein-gradient': 'linear-gradient(135deg, #4B2EFF 0%, #9C5BFF 100%)',
        'vein-radial': 'radial-gradient(circle at 20% 20%, rgba(75,46,255,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(156,91,255,0.18), transparent 40%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(75,46,255,0.35)',
        'glow-accent': '0 0 40px rgba(156,91,255,0.3)',
        card: '0 8px 30px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
