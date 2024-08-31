/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '#000 0.3rem 0.3rem 0',
      },
    },
  },
  plugins: [],
}
