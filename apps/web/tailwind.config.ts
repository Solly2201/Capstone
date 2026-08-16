import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#211d1b",
        coal: "#302a27",
        clay: "#795a45",
        parchment: "#f7f3ed",
        sandstone: "#e9ddd0",
        sage: "#45695f"
      },
      boxShadow: {
        soft: "0 20px 50px rgba(33, 29, 27, 0.10)"
      }
    }
  },
  plugins: []
} satisfies Config;
