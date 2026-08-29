/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EF",
        blush: "#F7E4E0",
        rose: "#E7A6A0",
        brown: "#5C4433",
        clay: "#8A5A44",
      },
      fontFamily: {
        serif: ["Georgia", "'Playfair Display'", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};
