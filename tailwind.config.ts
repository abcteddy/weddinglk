import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          950: '#1a0010',
          900: '#3d0020',
          800: '#6b1a36',
          700: '#8B1A4A',
          600: '#b0365e',
          500: '#c9516f',
          400: '#e07a8a',
          300: '#f0a8b5',
          200: '#f8d0d8',
          100: '#fdf0f3',
        },
        gold: {
          900: '#3d2a00',
          800: '#6b4a00',
          700: '#8B6914',
          600: '#b8860b',
          500: '#d4a017',
          400: '#e8c040',
          300: '#f0d870',
          200: '#f8ecb0',
          100: '#fdf8e0',
        },
        parchment: {
          900: '#5a3a20',
          800: '#8a5a30',
          700: '#b07840',
          600: '#c89060',
          500: '#d4a87a',
          400: '#e0c09a',
          300: '#ead8b8',
          200: '#f2ecd8',
          100: '#fdf8f0',
          50: '#fffcf7',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      },
      boxShadow: {
        'rose-glow': '0 0 30px rgba(139, 26, 74, 0.4)',
        'gold-glow': '0 0 30px rgba(184, 134, 11, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
