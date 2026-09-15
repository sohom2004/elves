"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";
import { noise2D } from "@/lib/simplex-noise";
import { subscribeCursor, type CursorSample } from "@/lib/cursor-field";
import { useNarrativeStore } from "@/lib/narrative-store";

interface Stage {
  id: string;
  label: string;
  jp: string;
  status: string;
  center: number;
  station: [number, number]; // fraction of viewport width/height
}

const STAGES: Stage[] = [
  { id: "database", label: "Database", jp: "庫", status: "connecting", center: 0.08, station: [0.28, 0.55] },
  { id: "ai", label: "AI", jp: "脳", status: "thinking", center: 0.3, station: [0.5, 0.42] },
  { id: "voice", label: "Voice", jp: "声", status: "activating", center: 0.52, station: [0.58, 0.62] },
  { id: "application", label: "Application", jp: "組", status: "assembling", center: 0.74, station: [0.42, 0.48] },
  { id: "deployment", label: "Deployment", jp: "完", status: "done", center: 0.94, station: [0.72, 0.5] },
];
const WIDTH = 0.15;

function gaussian(progress: number, center: number, width: number) {
  const d = (progress - center) / width;
  return Math.exp(-d * d);
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// keep scene content clear of the centered label
function pushFromCenter(px: number, py: number, w: number, h: number, minDist: number): [number, number] {
  const cx = w / 2;
  const cy = h / 2;
  const dx = px - cx;
  const dy = py - cy;
  const d = Math.hypot(dx, dy);
  if (d >= minDist) return [px, py];
  if (d < 0.001) return [cx + minDist, cy];
  const s = minDist / d;
  return [cx + dx * s, cy + dy * s];
}

// ─── layouts: same particle index traces a coherent path in every stage,
// so blending between stages reads as one object physically morphing ───
function databaseLayout(i: number, n: number, w: number, h: number, t: number, cx: number, cy: number) {
  const ring = Math.floor((i / n) * 4);
  const perRing = n / 4;
  const idxInRing = i - ring * perRing;
  const angle = (idxInRing / perRing) * Math.PI * 2 + t * 0.06 * (ring + 1);
  const baseR = Math.min(w, h) * 0.24;
  const radius = baseR * (0.45 + ring * 0.24);
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.82] as const;
}
function aiLayout(i: number, n: number, w: number, h: number, t: number, cx: number, cy: number) {
  const layers = 5;
  const layer = Math.floor((i / n) * layers);
  const perLayer = n / layers;
  const idxInLayer = i - layer * perLayer;
  const x = cx + (layer / (layers - 1) - 0.5) * w * 0.36;
  const spacing = Math.min(w, h) * 0.075;
  const y = cy + (idxInLayer - perLayer / 2) * spacing;
  const jitter = noise2D(i * 0.3, t * 0.25) * 7;
  return [x + jitter, y + jitter] as const;
}
function voiceLayout(i: number, n: number, w: number, h: number, t: number, cx: number, cy: number) {
  const x = cx - w * 0.36 + (i / n) * w * 0.72;
  const freq = 0.02;
  const amp = Math.min(w, h) * 0.16;
  const envelope = Math.sin((i / n) * Math.PI);
  const y = cy + Math.sin(x * freq + t * 2.4) * amp * envelope;
  return [x, y] as const;
}
function applicationLayout(i: number, n: number, w: number, h: number, cx: number, cy: number) {
  const pw = w * 0.48;
  const ph = h * 0.42;
  const x0 = cx - pw / 2;
  const y0 = cy - ph / 2;
  const total = 2 * (pw + ph);
  const d = (i / n) * total;
  if (d < pw) return [x0 + d, y0] as const;
  if (d < pw + ph) return [x0 + pw, y0 + (d - pw)] as const;
  if (d < pw + ph + pw) return [x0 + pw - (d - pw - ph), y0 + ph] as const;
  return [x0, y0 + ph - (d - pw - ph - pw)] as const;
}
function deploymentLayout(i: number, n: number, w: number, h: number, t: number, cx: number, cy: number) {
  const frac = i / n;
  const angle = frac * Math.PI * 9 + t * 0.5;
  const radius = (1 - frac) * Math.min(w, h) * 0.26;
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.78] as const;
}

interface Particle {
  px: number;
  py: number;
  vx: number;
  vy: number;
}

export default function NightWorkshopScene() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const kanjiRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const labelWrapRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const deviceCapability = useNarrativeStore((s) => s.deviceCapability);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const N = deviceCapability === "low" ? 90 : 220;
    let cursor: CursorSample | null = null;
    let raf = 0;
    let t = 0;
    let elfX = 0;
    let elfY = 0;
    let elfVX = 0;
    let elfVY = 0;

    const unsub = subscribeCursor((s) => (cursor = s));

    function resize() {
      const rect = sticky!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: N }, () => ({ px: w / 2, py: h / 2, vx: 0, vy: 0 }));
      elfX = w * 0.28;
      elfY = h * 0.55;
    }
    resize();
    window.addEventListener("resize", resize);

    function layoutFor(stageId: string, i: number, cx: number, cy: number): readonly [number, number] {
      switch (stageId) {
        case "database":
          return databaseLayout(i, N, w, h, t, cx, cy);
        case "ai":
          return aiLayout(i, N, w, h, t, cx, cy);
        case "voice":
          return voiceLayout(i, N, w, h, t, cx, cy);
        case "application":
          return applicationLayout(i, N, w, h, cx, cy);
        default:
          return deploymentLayout(i, N, w, h, t, cx, cy);
      }
    }

    function tick() {
      t += 0.016;
      const progress = scrollYProgress.get();

      const weights = STAGES.map((s) => gaussian(progress, s.center, WIDTH));
      const wsum = weights.reduce((a, b) => a + b, 0) || 1;
      const norm = weights.map((wt) => wt / wsum);

      let maxW = 0;
      let maxIdx = 0;
      norm.forEach((v, i) => {
        if (v > maxW) {
          maxW = v;
          maxIdx = i;
        }
      });

      const stage = STAGES[maxIdx];
      if (labelRef.current) labelRef.current.textContent = stage.label.toUpperCase();
      if (kanjiRef.current) kanjiRef.current.textContent = stage.jp;
      if (statusRef.current) statusRef.current.textContent = stage.status.toUpperCase();
      if (labelWrapRef.current) {
        const opacity = Math.min(1, maxW * 1.8);
        const fadeForFinal = 1 - smoothstep(0.86, 0.92, progress);
        labelWrapRef.current.style.opacity = String(opacity * smoothstep(0.02, 0.06, progress) * fadeForFinal);
      }

      // background warmth for morning
      const morning = smoothstep(0.87, 1, progress);
      sticky!.style.background = `linear-gradient(180deg, rgb(${12 + morning * 10},${11 + morning * 9},${10 + morning * 6}), rgb(${12 + morning * 14},${11 + morning * 11},${10 + morning * 6}))`;

      if (finalRef.current) {
        finalRef.current.style.opacity = String(smoothstep(0.93, 1, progress));
      }

      const opening = smoothstep(0, 0.04, progress) * (1 - smoothstep(0.9, 0.97, progress));

      ctx!.clearRect(0, 0, w, h);

      // station centers, pushed clear of the centered label text
      const minDist = Math.min(w, h) * 0.24;
      const stationPx: [number, number][] = STAGES.map((s) =>
        pushFromCenter(s.station[0] * w, s.station[1] * h, w, h, minDist)
      );

      // weighted workstation centroid (drives the Elf)
      let cx = 0;
      let cy = 0;
      for (let s = 0; s < STAGES.length; s++) {
        cx += stationPx[s][0] * norm[s];
        cy += stationPx[s][1] * norm[s];
      }
      [cx, cy] = pushFromCenter(cx, cy, w, h, minDist * 0.85);

      const rect = canvas!.getBoundingClientRect();
      const cursorLocal =
        cursor && cursor.active ? { x: cursor.x - rect.left, y: cursor.y - rect.top } : null;

      const lineDash = norm[3] > 0.35;
      const maxConfidence = maxW;

      ctx!.beginPath();
      let prevX = 0;
      let prevY = 0;
      for (let i = 0; i < N; i++) {
        let tx = 0;
        let ty = 0;
        for (let s = 0; s < STAGES.length; s++) {
          if (norm[s] < 0.004) continue;
          const [lx, ly] = layoutFor(STAGES[s].id, i, stationPx[s][0], stationPx[s][1]);
          tx += lx * norm[s];
          ty += ly * norm[s];
        }

        if (cursorLocal) {
          const dx = tx - cursorLocal.x;
          const dy = ty - cursorLocal.y;
          const d = Math.hypot(dx, dy);
          if (d < 90 && d > 1) {
            const f = (90 - d) / 90;
            tx += (dx / d) * f * 20;
            ty += (dy / d) * f * 20;
          }
        }

        const p = particles[i];
        const ax = (tx - p.px) * 3.2 - p.vx * 3.4;
        const ay = (ty - p.py) * 3.2 - p.vy * 3.4;
        p.vx += ax * 0.016;
        p.vy += ay * 0.016;
        p.px += p.vx * 0.016;
        p.py += p.vy * 0.016;

        if (i > 0) {
          ctx!.moveTo(prevX, prevY);
          ctx!.lineTo(p.px, p.py);
        }
        prevX = p.px;
        prevY = p.py;
      }
      ctx!.strokeStyle = `rgba(201,162,74,${(0.14 + maxConfidence * 0.36) * opening})`;
      ctx!.lineWidth = 1.6;
      if (lineDash) ctx!.setLineDash([6, 6]);
      ctx!.stroke();
      ctx!.setLineDash([]);

      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.px, p.py, 2.2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,233,184,${(0.4 + maxConfidence * 0.4) * opening})`;
        ctx!.fill();
      }

      // elf: spring-follow the weighted workstation centroid
      const eax = (cx - elfX) * 2.6 - elfVX * 3.2;
      const eay = (cy - elfY) * 2.6 - elfVY * 3.2;
      elfVX += eax * 0.016;
      elfVY += eay * 0.016;
      elfX += elfVX * 0.016;
      elfY += elfVY * 0.016;
      const speed = Math.hypot(elfVX, elfVY);

      drawElf(ctx!, elfX, elfY, t, speed, opening, maxConfidence);

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      unsub();
    };
  }, [reducedMotion, deviceCapability, scrollYProgress]);

  if (reducedMotion) {
    return (
      <section id="night" className="relative bg-ground-deep px-6 py-32 md:px-10" aria-label="The workshop works through the night">
        <div className="mx-auto max-w-[700px] text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-faint">You go home.</p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.5vw,3rem)] font-medium text-ink text-balance">
            The workshop keeps working.
          </h2>
          <div className="mt-12 space-y-4">
            {STAGES.map((s) => (
              <p key={s.id} className="font-mono text-sm text-ink-dim">
                <span className="text-ink">{s.label}</span> <span className="text-gold">{s.status}</span>
              </p>
            ))}
          </div>
          <p className="font-display mt-12 text-2xl text-ink">You slept. They worked.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative bg-ground-deep" style={{ height: "600vh" }} aria-label="The workshop works through the night">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden bg-ground-deep">
        <canvas ref={canvasRef} className="absolute inset-0" />

        <div
          ref={labelWrapRef}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-mono"
          style={{ opacity: 0 }}
        >
          <span ref={kanjiRef} className="font-jp block text-2xl text-[#b6493a]" />
          <span ref={labelRef} className="mt-1 block text-4xl font-medium tracking-[0.04em] text-ink md:text-5xl" />
          <span ref={statusRef} className="mt-2 block text-xs uppercase tracking-[0.24em] text-gold" />
        </div>

        <div
          ref={finalRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ground-deep text-center"
          style={{ opacity: 0 }}
        >
          <p className="font-display text-2xl text-ink md:text-3xl">You slept. They worked.</p>
          <p className="font-mono text-sm text-gold">Good morning.</p>
        </div>
      </div>
    </section>
  );
}

// ─── Elf — a small hooded ninja-craftsman silhouette ────────────────────
function drawElf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  speed: number,
  opening: number,
  confidence: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(2.4, 2.4);
  ctx.globalAlpha = opening;

  const walk = Math.min(1, speed * 0.02);
  const legSwing = Math.sin(t * 9) * (2 + walk * 3);
  const bob = Math.abs(Math.sin(t * 9)) * walk * 1.1;
  const lean = Math.sin(t * 9) * walk * 0.06;

  ctx.beginPath();
  ctx.ellipse(0, 15, 6.5, 1.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fill();

  ctx.translate(0, -bob);
  ctx.rotate(lean);

  // trailing scarf — flutters with speed
  const flutter = Math.sin(t * 5) * (1 + walk * 3);
  ctx.beginPath();
  ctx.moveTo(-3, -2);
  ctx.quadraticCurveTo(-8 - walk * 3, 2 + flutter, -7 - walk * 4, 8 + flutter * 0.6);
  ctx.strokeStyle = "rgba(182,73,58,0.85)";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.stroke();

  // legs
  ctx.strokeStyle = "#1c1712";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-1.5, 7);
  ctx.lineTo(-1.5 - legSwing * 0.4, 14);
  ctx.moveTo(1.5, 7);
  ctx.lineTo(1.5 + legSwing * 0.4, 14);
  ctx.stroke();

  // narrow angular body
  ctx.beginPath();
  ctx.moveTo(-4, 7);
  ctx.lineTo(-3, -4);
  ctx.lineTo(3, -4);
  ctx.lineTo(4, 7);
  ctx.closePath();
  const bodyGrad = ctx.createLinearGradient(0, -4, 0, 7);
  bodyGrad.addColorStop(0, "#332617");
  bodyGrad.addColorStop(1, "#1c150c");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // sash
  ctx.beginPath();
  ctx.moveTo(-3.5, 2);
  ctx.lineTo(3.5, 1);
  ctx.strokeStyle = "rgba(201,162,74,0.55)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // blade on back
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.lineTo(-6, -11);
  ctx.strokeStyle = "rgba(242,236,224,0.5)";
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // reaching arm — periodic gentle reach toward the work
  const reach = confidence > 0.4 ? (Math.sin(t * 1.3) * 0.5 + 0.5) * 6 : 1.5;
  ctx.beginPath();
  ctx.moveTo(3.5, -1);
  ctx.lineTo(7 + reach, -2 + Math.sin(t * 1.3) * 2);
  ctx.strokeStyle = "#1c1712";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(7 + reach, -2 + Math.sin(t * 1.3) * 2, 1, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,233,184,0.95)";
  ctx.fill();

  // pointed hood
  ctx.beginPath();
  ctx.moveTo(-3.4, -4);
  ctx.quadraticCurveTo(-2, -13, 0.5, -16);
  ctx.quadraticCurveTo(2.6, -12, 3.4, -4);
  ctx.closePath();
  const hoodGrad = ctx.createLinearGradient(0, -16, 0, -4);
  hoodGrad.addColorStop(0, "#3d2d1a");
  hoodGrad.addColorStop(1, "#1c150c");
  ctx.fillStyle = hoodGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(201,162,74,0.4)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // twin glowing eyes — the only visible face detail
  ctx.beginPath();
  ctx.arc(-1, -7.5, 0.6, 0, Math.PI * 2);
  ctx.arc(1, -7.5, 0.6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,233,184,0.95)";
  ctx.fill();

  ctx.restore();
}
