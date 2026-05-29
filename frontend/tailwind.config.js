/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B3DF5",
          hover: "#472bd4",
          light: "#EEECFE"
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7"
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7"
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2"
        },
        neutral: {
          dark: "#0F172A",
          gray: "#64748B",
          light: "#F8FAFC"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
