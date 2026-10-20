import type { Config } from "tailwindcss";
const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"), card: v("card"), fg: v("fg"), muted: v("muted"), line: v("line"), ink: v("ink"),
        accent: v("accent"), accentsoft: v("accentsoft"), paper: v("paper"), ok: v("ok"), warn: v("warn"), bad: v("bad"),
      },
      fontFamily: {
        sans: ["'Hanken Grotesk Variable'", "system-ui", "-apple-system", "'Segoe UI'", "Roboto", "'Noto Sans'", "sans-serif"],
        display: ["'Dela Gothic One'", "'Hanken Grotesk Variable'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "4px 4px 0 0 rgb(var(--ink))",
        "panel-sm": "2px 2px 0 0 rgb(var(--ink))",
        lift: "0 10px 30px -12px rgb(var(--ink) / 0.35)",
      },
      borderRadius: { panel: "14px" },
    },
  },
  plugins: [],
} satisfies Config;
