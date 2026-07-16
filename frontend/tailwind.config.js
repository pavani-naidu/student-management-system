/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12172B',        // near-black navy for dark surfaces / high-contrast text
        indigo: {
          DEFAULT: '#2B3470',
          50: '#EEF0F9',
          100: '#DCE0F2',
          400: '#4C58A6',
          500: '#2B3470',
          600: '#232A5C',
          700: '#1B2148',
        },
        amber: {
          DEFAULT: '#E3A008',
          50: '#FDF6E3',
          100: '#FBEBC2',
          400: '#F0B429',
          500: '#E3A008',
          600: '#B87E06',
        },
        paper: '#F7F5EF',
        slate: {
          850: '#1A2035',
          925: '#0F1324',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 23, 43, 0.04), 0 8px 24px rgba(18, 23, 43, 0.06)',
        'card-dark': '0 1px 2px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        badge: '0.9rem',
      },
    },
  },
  plugins: [],
};
