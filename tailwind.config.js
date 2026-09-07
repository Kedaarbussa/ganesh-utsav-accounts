/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ganesh: {
          50: '#FFF8F0',
          100: '#FEEDD9',
          200: '#FCD7B0',
          300: '#F9B77F',
          400: '#F48E49',
          500: '#EE691A',
          600: '#E65100', // Saffron Core
          700: '#C23C00',
          800: '#9B3006',
          900: '#7E2A0B',
          950: '#441203',
        },
        festive: {
          gold: '#D97706',
          amber: '#F59E0B',
          red: '#991B1B',
          maroon: '#7F1D1D',
          cream: '#FFFBEB',
          darkBg: '#0F172A',
          cardDark: '#1E293B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
