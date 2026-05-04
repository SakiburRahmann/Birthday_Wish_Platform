/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        luxe: {
          gold: "#c5a059",
          "gold-soft": "rgba(197, 160, 89, 0.1)",
          bg: "#fdfdfd",
          text: "#1d1d1f",
        },
      },
      boxShadow: {
        luxe: "0 20px 50px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
}
