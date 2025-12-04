import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#E50914",
          secondary: "#808080",
          dark: "#1F1F1F",
          medium: "#2F2F2F",
          black: "#141414",
          light: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
