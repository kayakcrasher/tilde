// Celtic artwork drawn in SVG: a landscape header, Ogham script, a knotwork
// divider and a triskele progress mark. No image files — works offline.

/** Ogham letters: [group, strokes]. B = below the stem, H = above, M = across, A = notches on it. */
const OGHAM: Record<string, ["B" | "H" | "M" | "A", number]> = {
  b: ["B", 1], l: ["B", 2], f: ["B", 3], v: ["B", 3], w: ["B", 3], s: ["B", 4], n: ["B", 5],
  h: ["H", 1], d: ["H", 2], t: ["H", 3], c: ["H", 4], k: ["H", 4], q: ["H", 5],
  m: ["M", 1], g: ["M", 2], z: ["M", 4], r: ["M", 5],
  a: ["A", 1], o: ["A", 2], u: ["A", 3], e: ["A", 4], i: ["A", 5], y: ["A", 5],
  p: ["B", 1],
};

/** Write a word in Ogham along a horizontal stem line. */
export function Ogham({ text, className = "" }: { text: string; className?: string }) {
  const plain = text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const glyphs: { g: string; n: number }[] = [];
  for (let i = 0; i < plain.length; i += 1) {
    const ch = plain[i];
    if (ch === "n" && plain[i + 1] === "g") {
      glyphs.push({ g: "M", n: 3 });
      i += 1;
      continue;
    }
    const m = OGHAM[ch];
    if (m) glyphs.push({ g: m[0], n: m[1] });
    else if (ch === " ") glyphs.push({ g: " ", n: 0 });
  }
  const STEP = 4;
  const GAP = 7;
  const lines: string[] = [];
  let x = 14;
  for (const { g, n } of glyphs) {
    if (g === " ") {
      x += GAP * 1.5;
      continue;
    }
    for (let k = 0; k < n; k += 1) {
      const px = x + k * STEP;
      if (g === "B") lines.push(`M${px} 20 V31`);
      else if (g === "H") lines.push(`M${px} 9 V20`);
      else if (g === "M") lines.push(`M${px - 3} 30 L${px + 3} 10`);
      else lines.push(`M${px} 17 V23`);
    }
    x += n * STEP + GAP;
  }
  const width = x + 8;
  return (
    <svg viewBox={`0 0 ${width} 40`} className={className} style={{ width: Math.min(width, 320), height: 28 }} aria-hidden="true">
      <path d={`M4 20 H${width - 4}`} className="stroke-accent/50" strokeWidth="1.5" />
      <path d="M4 20 l6 -6 M4 20 l6 6" className="stroke-accent/50" strokeWidth="1.5" fill="none" />
      <path d={lines.join(" ")} className="stroke-accent" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Dusk over the west of Ireland: hills, sea cliffs, a round tower and a stone wall. */
export function CelticLandscape() {
  return (
    <svg
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 top-0 h-64 w-full opacity-90"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1a24" />
          <stop offset="0.65" stopColor="#1d3b3a" />
          <stop offset="1" stopColor="#3c5a3f" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="var(--color-bg)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--color-bg)" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sky)" />
      {/* stars and moon */}
      {[
        [30, 22], [72, 40], [118, 16], [160, 34], [212, 12], [262, 30], [300, 18], [348, 42], [380, 14], [96, 60], [240, 52],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill="#f4efe6" opacity={0.5 + (i % 4) * 0.12} />
      ))}
      <path d="M318 58 a16 16 0 1 0 14 -26 a12 12 0 1 1 -14 26z" fill="#f3e3b3" opacity="0.85" />
      {/* sea */}
      <rect x="0" y="132" width="400" height="30" fill="#24484f" />
      <path d="M0 140 q20 -3 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#4f7f86" strokeWidth="1" fill="none" opacity="0.6" />
      {/* cliffs on the right */}
      <path d="M262 132 L300 104 L340 98 L400 92 L400 165 L262 165 Z" fill="#2b3f33" />
      <path d="M262 132 L268 165" stroke="#1c2b23" strokeWidth="3" />
      {/* far hills */}
      <path d="M0 150 C 60 118, 120 124, 180 140 C 220 150, 250 146, 270 150 L270 220 L0 220 Z" fill="#2f4a36" />
      {/* round tower on the hill */}
      <g transform="translate(96 104)">
        <rect x="0" y="6" width="9" height="30" fill="#1b2a22" />
        <path d="M-1 7 L4.5 -4 L10 7 Z" fill="#1b2a22" />
        <rect x="3" y="12" width="2.5" height="4" fill="#f3e3b3" opacity="0.7" />
      </g>
      {/* near hills */}
      <path d="M0 176 C 80 150, 170 160, 240 172 C 300 182, 350 168, 400 160 L400 220 L0 220 Z" fill="#203528" />
      {/* drystone wall */}
      <path d="M10 186 C 90 170, 190 176, 260 186 C 310 193, 360 184, 396 178" stroke="#93a69c" strokeWidth="2.2" strokeDasharray="3 2.5" fill="none" opacity="0.55" />
      <rect width="400" height="220" fill="url(#fade)" />
    </svg>
  );
}

/** A simple interlaced knotwork band. */
export function KnotDivider({ className = "" }: { className?: string }) {
  const loops = Array.from({ length: 8 }, (_, i) => i * 24);
  return (
    <svg viewBox="0 0 192 24" className={`mx-auto h-5 w-48 ${className}`} aria-hidden="true">
      {loops.map((x) => (
        <g key={x} fill="none" strokeLinecap="round">
          <path d={`M${x} 12 C ${x + 6} 0, ${x + 18} 0, ${x + 24} 12`} className="stroke-accent" strokeWidth="2.2" />
          <path d={`M${x} 12 C ${x + 6} 24, ${x + 18} 24, ${x + 24} 12`} className="stroke-accent/60" strokeWidth="2.2" />
        </g>
      ))}
    </svg>
  );
}

/** Triskele (triple spiral); `progress` 0–1 draws in the arms. */
export function Triskele({ progress, className = "" }: { progress: number; className?: string }) {
  const arm = "M50 50 C 50 30, 70 22, 78 34 C 86 46, 72 58, 62 50 C 56 45, 60 38, 66 40";
  const len = 120;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {[0, 120, 240].map((rot, i) => {
        const p = Math.min(1, Math.max(0, progress * 3 - i));
        return (
          <g key={rot} transform={`rotate(${rot} 50 50)`} fill="none" strokeLinecap="round" strokeWidth="5">
            <path d={arm} className="stroke-line" />
            <path d={arm} className="stroke-accent" strokeDasharray={len} strokeDashoffset={len * (1 - p)} style={{ transition: "stroke-dashoffset 0.8s" }} />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="4" className="fill-accent" />
    </svg>
  );
}
