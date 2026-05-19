import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"]
      },
      colors: {
        btc: "#f7931a",
        musd: "#68e6b1",
        graphite: "#080907",
        ivory: "#f8f3e7"
      },
      boxShadow: {
        glass: "inset 0 1px 1px rgba(255,255,255,0.12), 0 20px 80px rgba(0,0,0,0.24)"
      }
    }
  },
  plugins: []
} satisfies Config;
