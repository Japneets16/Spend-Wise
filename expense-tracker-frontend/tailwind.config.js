/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#66BB6A',
        secondary: '#263238',
        accent: '#324148',
      }
    },
  },
  plugins: [],
}