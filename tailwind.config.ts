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
        panel: "0 1px 2px rgb(var(--ink) / 0.06), 0 4px 10px -4px rgb(var(--ink) / 0.10), 0 22px 44px -22px rgb(var(--ink) / 0.38)",
        "panel-sm": "0 1px 2px rgb(var(--ink) / 0.10), 0 8px 18px -10px rgb(var(--ink) / 0.40)",
        lift: "0 18px 40px -16px rgb(var(--ink) / 0.45)",
      },
      keyframes: {
        "page-in": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "badge-in": { from: { opacity: "0", transform: "translateY(60%)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
      },
      animation: {
        "page-in": "page-in .6s cubic-bezier(.16,1,.3,1) backwards",
        "fade-in": "fade-in .35s ease-out both",
        "badge-in": "badge-in .45s cubic-bezier(.16,1,.3,1) backwards",
        shimmer: "shimmer 1.6s linear infinite",
      },
      transitionTimingFunction: { out: "cubic-bezier(.16,1,.3,1)" },
      borderRadius: { panel: "16px" },
    },
  },
  plugins: [],
} satisfies Config;
