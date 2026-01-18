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
          100: "hsl(var(--h-base) 20% 92% / <alpha-value>)",
          200: "hsl(var(--h-base) 18% 88% / <alpha-value>)",
          300: "hsl(var(--h-base) 20% 76% / <alpha-value>)",
        },

        accent: {
          100: "hsl(var(--h-accent) 48% 47% / <alpha-value>)",
          200: "hsl(var(--h-accent) 58% 37% / <alpha-value>)",
          300: "hsl(var(--h-accent) 68% 27% / <alpha-value>)",
        },

        text: {
          primary: "hsl(var(--h-base) 20% 12% / <alpha-value>)",
          secondary: "hsl(var(--h-base) 20% 32% / <alpha-value>)",
          tertiary: "hsl(var(--h-base) 20% 52% / <alpha-value>)",
        },

        border: {
          100: "hsl(var(--h-base) 20% 72% / <alpha-value>)",
          200: "hsl(var(--h-base) 20% 62% / <alpha-value>)",
          300: "hsl(var(--h-base) 20% 52% / <alpha-value>)",
        },

        status: {
          success: "hsl(145 55% 45% / <alpha-value>)",
          error: "hsl(0 70% 50% / <alpha-value>)",
          warning: "hsl(38 90% 55% / <alpha-value>)",
          info: "hsl(var(--h-accent) 48% 47% / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}