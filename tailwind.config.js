/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#3D11B6',
          dark: '#2a0b85',
          light: '#5d32d1'
        }
      },
    },
  },
  plugins: [],
}
