import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0EA5E9" } // optional brand color
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      },
      boxShadow: {
        // custom shadow utility you can reference as `shadow-card`
        card: "0 10px 30px -12px rgba(2,6,23,.35)"
      }
    }
  },
  plugins: []
} satisfies Config;
