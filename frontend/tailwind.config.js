/**** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#C59D2A',
          black: '#1C1A16',
          cream: '#F3E7D8',
          brown: '#5A4631',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 10px 15px -3px rgba(28,26,22,0.2), 0 4px 6px -4px rgba(28,26,22,0.1)'
      }
    },
  },
  plugins: [],
};
