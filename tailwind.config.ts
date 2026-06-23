import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#667085",
        line: "#DDE3EA",
        canvas: "#F7F9FC",
        brand: {
          50: "#EAF8F0",
          100: "#D3F0DF",
          500: "#1B7F4A",
          600: "#14683C",
          900: "#0C3B23"
        },
        saffron: {
          50: "#FFF7E8",
          500: "#D97706"
        },
        lagoon: {
          50: "#EAF5FF",
          500: "#2563EB"
        },
        coral: {
          50: "#FFF0ED",
          500: "#E5484D"
        }
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 24, 39, 0.08)",
        line: "0 0 0 1px rgba(221, 227, 234, 0.9)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
