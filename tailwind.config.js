/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'node_modules/daisyui/dist/**/*.{js,jsx,ts,tsx}', 'node_modules/react-daisyui/dist/**/*.{js,jsx,ts,tsx}',
    "./src/**/*.{js,jsx,ts,tsx}",
],
  plugins: [require('daisyui')],
  theme: {
    extend: {},
  },
}
