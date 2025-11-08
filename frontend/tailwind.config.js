/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1F2937',
          secondary: '#4B5563',
          accent: '#2563EB',
          muted: '#9CA3AF',
          surface: '#F9FAFB',
        },
      },
    },
  },
  plugins: [],
}

