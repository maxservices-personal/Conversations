/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          100: "hsl(var(--h-base) 20% var(--l-base-100) / <alpha-value>)",
          200: "hsl(var(--h-base) 18% var(--l-base-200) / <alpha-value>)",
          300: "hsl(var(--h-base) 20% var(--l-base-300) / <alpha-value>)",
        },

        accent: {
          100: "hsl(var(--h-accent) var(--s-accent-100) var(--l-accent-100) / <alpha-value>)",
          200: "hsl(var(--h-accent) var(--s-accent-200) var(--l-accent-200) / <alpha-value>)",
          300: "hsl(var(--h-accent) var(--s-accent-300) var(--l-accent-300) / <alpha-value>)",
        },

        text: {
          primary: "hsl(var(--h-base) 20% var(--l-text-primary) / <alpha-value>)",
          secondary: "hsl(var(--h-base) 20% var(--l-text-secondary) / <alpha-value>)",
          tertiary: "hsl(var(--h-base) 20% var(--l-text-tertiary) / <alpha-value>)",
        },

        border: {
          100: "hsl(var(--h-base) 20% var(--l-border-100) / <alpha-value>)",
          200: "hsl(var(--h-base) 20% var(--l-border-200) / <alpha-value>)",
          300: "hsl(var(--h-base) 20% var(--l-border-300) / <alpha-value>)",
        },

        status: {
          success: "hsl(145 55% 45% / <alpha-value>)",
          error: "hsl(0 70% 50% / <alpha-value>)",
          warning: "hsl(38 90% 55% / <alpha-value>)",
          info: "hsl(var(--h-accent) 48% var(--l-accent-100) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}