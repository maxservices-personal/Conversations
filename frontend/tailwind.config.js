/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          "token-base-100": 'var(--token-base-100)',
          "token-base-200": 'var(--token-base-200)',
          "token-base-200-blured": 'var(--token-base-200-blured)',
          "token-base-300": 'var(--token-base-300)',
          "token-border-light": 'var(--token-border-light)',
          "token-border-medium": 'var(--token-border-medium)',
          "token-border-dark": 'var(--token-border-dark)',
          "token-primary": "var(--token-primary)",
          "token-secondary": "var(--token-secondary)",
          "gradient-blured": "var(--bg-gradient-blured)",
      },
    },
  },
  plugins: [],
}