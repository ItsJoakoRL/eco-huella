/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#296654",
        "primary-container": "#acead3",
        "on-primary": "#c5ffe9",
        "on-primary-container": "#195847",
        "secondary": "#1a4314",
        "secondary-container": "#d8f2c4",
        "secondary-fixed-dim": "#b9dda0",
        "on-secondary-container": "#10330c",
        "surface": "#f8f6f2",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f1ec",
        "surface-container": "#e9e8e4",
        "surface-container-high": "#e4e2de",
        "surface-container-highest": "#deddd8",
        "on-surface": "#2e2f2d",
        "on-surface-variant": "#5b5c59",
        "tertiary": "#7b5400",
        "tertiary-container": "#feb300",
        "on-tertiary-fixed": "#382400",
        "outline": "#8f918d",
        "outline-variant": "#aeadaa",
      },
      borderRadius: {
        "lg": "2rem",
        "xl": "3rem",
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
