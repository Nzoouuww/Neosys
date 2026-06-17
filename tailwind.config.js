/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#59a6ff",
          500: "#3385fb",
          600: "#1d66f0",
          700: "#1650dc",
          800: "#1842b2",
          900: "#1a3c8c",
          950: "#142555",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0bac9",
          400: "#8593a9",
          500: "#65748d",
          600: "#505d74",
          700: "#424c5e",
          800: "#3a4250",
          900: "#343a45",
          950: "#22262e",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1)",
        soft: "0 4px 16px rgba(16,24,40,.08)",
      },
    },
  },
  plugins: [],
};
