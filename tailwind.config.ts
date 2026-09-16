import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        "ink-2": "#121212",
        "ink-3": "#1a1a1a",
        signal: "#FC4C01",
        "signal-dim": "#e04300",
        paper: "#ededed",
        muted: "#a3a3a3",
        faint: "#525252",
        line: "rgba(255, 255, 255, 0.08)",
        "line-bright": "rgba(255, 255, 255, 0.15)",
        brand: {
          50: "oklch(0.958 0.023 48.5)",
          100: "oklch(0.9266 0.0397 43.4)",
          200: "oklch(0.887 0.0626 41.8)",
          300: "oklch(0.8165 0.1069 39.2)",
          400: "oklch(0.7246 0.1749 38.1)",
          500: "oklch(0.6617 0.2215 36.9)",
          600: "#FC4C01",
          700: "oklch(0.4228 0.1677 30.4)",
          800: "oklch(0.3248 0.1333 29.2)",
          900: "oklch(0.2285 0.0938 29.2)",
          950: "oklch(0.1422 0.0584 29.2)"
        }
      },
      fontFamily: {
        arabic: ["var(--font-momtad)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"]
      },
      boxShadow: {
        glow: "0 0 32px -4px rgba(252, 76, 1, 0.35)",
        "glow-sm": "0 0 16px -2px rgba(252, 76, 1, 0.25)",
        apple: "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px rgba(255,255,255,0.12), inset 0 -1px rgba(0,0,0,0.5)"
      }
    }
  },
  plugins: []
};
export default config;
