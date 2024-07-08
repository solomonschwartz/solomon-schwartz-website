/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  darkMode:false,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
      require('@tailwindcss/forms'),
  ],
}