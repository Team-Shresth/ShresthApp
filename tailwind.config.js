/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#FAFAF9',
        'surface': '#FFFFFF',
        'text': '#0A0A0A',
        'secondary-text': '#6B6E6C',
        'borders': '#E7E5E0',
        'green': '#1F7A44',
        'amber': '#A8660A',
        'red': '#B23223',
      },
    },
  },
  plugins: [],
}
