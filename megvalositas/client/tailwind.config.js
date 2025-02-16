/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      'brush': ["BrushScript"],
      
    },
    extend: {
      dropShadow: {
        '3xl': '0 25px 25px rgb(0 0 0 / 0.95)'
      }
    },
  },
  plugins: [],
}

