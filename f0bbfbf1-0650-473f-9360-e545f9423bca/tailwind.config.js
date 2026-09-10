export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f1f5fa',
          100: '#e0e8f4',
          200: '#c2d1e6',
          300: '#95afd2',
          400: '#6184b6',
          500: '#41649b',
          600: '#324e7d',
          700: '#2a3f65',
          800: '#213251',
          900: '#0e2242',
          950: '#07152b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Telugu',
          'Noto Sans Devanagari',
          'Noto Sans Tamil',
          'Noto Sans Kannada',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
}
