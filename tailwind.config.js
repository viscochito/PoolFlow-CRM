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
        'asana-dark': {
          'bg': '#1d1d1d',
          'sidebar': '#252525',
          'card': '#2d2d2d',
          'border': '#3d3d3d',
          'hover': '#353535',
        },
        'primary': {
          '50': '#f5f0ff',
          '100': '#ede5ff',
          '200': '#dccfff',
          '300': '#c4a8ff',
          '400': '#a875ff',
          '500': '#8b3fff',
          '600': '#7a1fff',
          '700': '#6a0fff',
          '800': '#5a0ae6',
          '900': '#4a08bf',
          '950': '#2b0071',
        }
      }
    },
  },
  plugins: [],
}

