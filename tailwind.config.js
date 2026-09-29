/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', './App.tsx', './index.tsx', './api.ts', './types.ts', './constants.tsx',
    './components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}', './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: { boxShadow: { '3xl': '0 35px 80px -20px rgba(0,0,0,.35)' } } },
  plugins: [],
};
