/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        candle: {
          amber: '#FFB347',
          orange: '#FF8C00',
          glow: '#FFFACD',
        },
        dark: {
          bg: '#0a0a0f',
          surface: '#1a1a2e',
        },
        forest: {
          dark: '#2d5a27',
          sage: '#4a7c59',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
};
