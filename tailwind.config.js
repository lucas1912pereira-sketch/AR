/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tertiary": "#ffc08e",
        "surface-container-low": "#141416",
        "surface-container-lowest": "#0c0c0e",
        "surface-container": "#18181b",
        "surface-container-high": "#222226",
        "surface-container-highest": "#2e2e33",
        "surface": "#0c0c0e",
        "background": "#0c0c0e",
        "amber-gold": "#f59e0b",
        "amber-glow": "#fbbf24",
        "chef-red": "#e11d48",
        "chef-red-dark": "#be123c",
        "on-surface": "#f4f4f5",
        "on-surface-variant": "#a1a1aa",
        "outline-variant": "rgba(255, 255, 255, 0.1)",
        "primary-container": "#f59e0b"
      },
      borderRadius: {
        "DEFAULT": "0.35rem",
        "lg": "0.6rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline-sm": ["Syne", "sans-serif"],
        "headline-md": ["Syne", "sans-serif"],
        "headline-lg": ["Syne", "sans-serif"],
        "display": ["Syne", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "label-sm": ["Space Grotesk", "sans-serif"],
        "label-md": ["Space Grotesk", "sans-serif"],
        "label-lg": ["Space Grotesk", "sans-serif"]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ]
};
