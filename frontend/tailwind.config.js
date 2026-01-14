/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
         base: {
          100: "hsl(212, 20%, 92%)",
          200: "hsl(212, 18%, 88%)",
          300: "hsl(212, 20%, 76%)",
        },

        accent: {
          100: "hsl(208, 48%, 47%)",
          200: "hsl(208, 58%, 37%)",
          300: "hsl(208, 68%, 27%)",
        },

        text: {
          primary: "hsl(212, 20%, 12%)",
          secondary: "hsl(212, 20%, 32%)",
          tertiary: "hsl(212, 20%, 52%)",
        },

        border: {
          100: "hsl(212, 20%, 72%)",
          200: "hsl(212, 20%, 62%)",
          300: "hsl(212, 20%, 52%)",
        },

        status: {
          success: "hsl(145, 55%, 45%)",
          error: "hsl(0, 70%, 50%)",
          warning: "hsl(38, 90%, 55%)",
          info: "hsl(208, 48%, 47%)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}