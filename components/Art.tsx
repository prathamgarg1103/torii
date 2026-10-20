// Generated placeholder artwork. No copyrighted covers, pages or character images are used.
export function Cover({ title, color, sub, size = "md", dim = false }: { title: string; color: string; sub?: string; size?: "sm" | "md" | "lg"; dim?: boolean }) {
  const text = size === "sm" ? "text-[10px]" : size === "lg" ? "text-xl" : "text-sm";
  return (
    <div
      className={`relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-sm ${dim ? "opacity-40 grayscale" : ""}`}
      style={{ background: `linear-gradient(155deg, ${color} 0%, ${shade(color, -35)} 100%)` }}
    >
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.35) 0 2px, transparent 2px 12px)" }} />
      <div className="absolute left-0 top-0 h-full w-[7%] bg-black/25" />
      <div className={`absolute inset-x-[12%] top-[10%] font-extrabold leading-tight text-white drop-shadow ${text}`}>{title}</div>
      {sub && <div className={`absolute bottom-[8%] left-[12%] rounded bg-white/90 px-1.5 py-0.5 font-bold text-black ${size === "sm" ? "text-[9px]" : "text-[11px]"}`}>{sub}</div>}
    </div>
  );
}

export function FigureArt({ color, label, variant = 0, className = "" }: { color: string; label?: string; variant?: number; className?: string }) {
  const bg = variant === 2 ? "#f3efe6" : shade(color, 70);
  return (
    <svg viewBox="0 0 200 200" className={`w-full rounded-xl ${className}`} role="img" aria-label={label || "Figure placeholder"}>
      <rect width="200" height="200" fill={bg} />
      {variant === 2 ? (
        <g>
          <rect x="45" y="30" width="110" height="150" rx="6" fill={color} />
          <rect x="58" y="48" width="84" height="100" rx="4" fill="#fff" opacity=".85" />
          <path d="M100 62 a10 10 0 1 1 0.1 0Z M84 140 v-34 l-8 -14 l14 -16 h20 l14 16 l-8 14 v34Z" fill={color} opacity=".8" />
          <text x="100" y="168" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">OFFICIAL</text>
        </g>
      ) : (
        <g transform={variant === 1 ? "translate(100 0) scale(-1 1) translate(-100 0)" : undefined}>
          <ellipse cx="100" cy="178" rx="52" ry="9" fill="#000" opacity=".15" />
          <rect x="60" y="166" width="80" height="12" rx="6" fill={shade(color, -40)} />
          <circle cx="100" cy="46" r="20" fill={color} />
          <path d="M76 166 v-46 l-14 -22 l22 -26 h32 l22 26 l-14 22 v46 h-14 v-36 h-20 v36Z" fill={color} />
          <path d="M84 72 l-34 -10 l-6 8 l36 14Z" fill={shade(color, -20)} />
          <path d="M116 72 l30 -28 l8 6 l-30 34Z" fill={shade(color, -20)} />
        </g>
      )}
      {label && <text x="10" y="18" fontSize="10" fontWeight="700" fill="#000" opacity=".45">{label}</text>}
    </svg>
  );
}

export function shade(hex: string, pct: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(pct < 0 ? c * (1 + pct / 100) : c + (255 - c) * (pct / 100))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
