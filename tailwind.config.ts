import type { Config } from "tailwindcss";
const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"), card: v("card"), fg: v("fg"), muted: v("muted"), line: v("line"),
        accent: v("accent"), accentsoft: v("accentsoft"), ok: v("ok"), warn: v("warn"), bad: v("bad"),
      },
      fontFamily: { sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
