/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gpc: {
          bg: '#070a12',
          surface: '#0f172a',
          soft: '#111827',
        },
      },
    },
  },
  plugins: [],
}
