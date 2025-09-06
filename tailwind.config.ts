/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#2563eb',
        'brand-dark': '#1e40af',
        mpesa: '#2bb741',
        'mpesa-dark': '#1f8b31',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(2,6,23,0.15)',
        xlsoft: '0 24px 60px -12px rgba(2,6,23,0.45)',
      },
    },
  },
  plugins: [],
};
