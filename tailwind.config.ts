import type {Config} from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {center: true, padding: {DEFAULT: '1.25rem', md: '2.5rem'}},
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#050507',
          900: '#08080b',
          800: '#0e0e13',
          700: '#16161d',
          600: '#22222c',
        },
        bone: '#ededf0',
        mist: '#8b8b96',
        acid: {DEFAULT: '#c8ff3d', dim: '#9ccc2a'},
        violet: {DEFAULT: '#9d5cff', deep: '#5b2bd6'},
      },
      fontSize: {
        mega: ['clamp(2.2rem, 9.2vw, 10.5rem)', {lineHeight: '0.88', letterSpacing: '-0.045em'}],
        giga: ['clamp(1.9rem, 6.4vw, 7rem)', {lineHeight: '0.92', letterSpacing: '-0.04em'}],
        huge: ['clamp(1.9rem, 4.2vw, 4.2rem)', {lineHeight: '0.98', letterSpacing: '-0.03em'}],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      keyframes: {
        marquee: {to: {transform: 'translateX(-50%)'}},
        grain: {
          '0%,100%': {transform: 'translate(0,0)'},
          '20%': {transform: 'translate(-3%,2%)'},
          '40%': {transform: 'translate(2%,-3%)'},
          '60%': {transform: 'translate(-2%,-1%)'},
          '80%': {transform: 'translate(3%,3%)'},
        },
        drift: {
          '0%,100%': {transform: 'translate3d(0,0,0) scale(1)'},
          '50%': {transform: 'translate3d(4%,-6%,0) scale(1.08)'},
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        grain: 'grain 0.9s steps(5) infinite',
        drift: 'drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
