/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'] },
      colors: {
        // هوية Directory — أزرق محايد + أبيض (UI-UX.md)
        brand: { DEFAULT: '#1D4ED8', dark: '#1E3A8A', light: '#EFF6FF' },
      },
    },
  },
  plugins: [],
};
