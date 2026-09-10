/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: '#030712',
          surface: '#0284c7',
          abyss: '#041226',
        }
      }
    },
  },
  plugins: [],
}
