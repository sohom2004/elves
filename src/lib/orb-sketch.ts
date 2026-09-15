import { noise2D } from "@/lib/simplex-noise";

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fibonacciSphere(n: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = ga * i;
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return pts;
}

function rotateY(p: [number, number, number], a: number): [number, number, number] {
  const [x, y, z] = p;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}
function rotateX(p: [number, number, number], a: number): [number, number, number] {
  const [x, y, z] = p;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

interface Projected {
  x: number;
  y: number;
  z: number;
}
function project(p: [number, number, number], cx: number, cy: number, R: number, focal: number): Projected {
  const scale = focal / (focal + p[2] * R * 0.9);
  return { x: cx + p[0] * R * scale, y: cy + p[1] * R * scale, z: p[2] };
}

interface DustMote {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  drift: number;
}

export interface OrbSketch {
  shellPts: [number, number, number][];
  edges: [number, number][];
  dust: DustMote[];
}

export function createOrbSketch(seedNum = 11): OrbSketch {
  const rand = mulberry32(seedNum);
  const shellPts = fibonacciSphere(30);

  const edges: [number, number][] = [];
  for (let i = 0; i < shellPts.length; i++) {
    const dists = shellPts.map((p, j) =>
      j === i
        ? Infinity
        : Math.hypot(p[0] - shellPts[i][0], p[1] - shellPts[i][1], p[2] - shellPts[i][2])
    );
    const order = dists
      .map((d, j) => [d, j] as [number, number])
      .sort((a, b) => a[0] - b[0])
      .slice(0, 2);
    for (const [, j] of order) {
      if (!edges.some((e) => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) {
        edges.push([i, j]);
      }
    }
  }

  const dust: DustMote[] = Array.from({ length: 26 }, () => ({
    angle: rand() * Math.PI * 2,
    radius: 1.6 + rand() * 1.1,
    speed: 0.05 + rand() * 0.1,
    size: 0.5 + rand() * 1.2,
    drift: rand() * Math.PI * 2,
  }));

  return { shellPts, edges, dust };
}

export interface OrbPalette {
  ink: string;
  mid: string;
  bright: string;
  glow: string;
}

export const DEFAULT_ORB_PALETTE: OrbPalette = {
  ink: "201,162,74",
  mid: "201,162,74",
  bright: "255,233,184",
  glow: "201,162,74",
};

interface DrawOpts {
  scale: number;
  t: number;
  excite: number;
  dirX: number;
  dirY: number;
  palette?: OrbPalette;
}

export function drawGuideOrb(
  ctx: CanvasRenderingContext2D,
  sketch: OrbSketch,
  cx: number,
  cy: number,
  opts: DrawOpts
) {
  const { scale, t, excite } = opts;
  const palette = opts.palette ?? DEFAULT_ORB_PALETTE;

  ctx.save();
  ctx.translate(cx, cy);

  // ambient flow-field dust drifting around the orb
  for (const d of sketch.dust) {
    const a = d.angle + t * d.speed * (1 + excite * 0.6);
    const wob = noise2D(Math.cos(d.drift) * 0.6 + t * 0.06, Math.sin(d.drift) * 0.6) * 0.4;
    const r = (d.radius + wob) * scale;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.86;
    ctx.beginPath();
    ctx.arc(x, y, d.size * (1 + excite * 0.3), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${palette.ink},${0.14 + excite * 0.1})`;
    ctx.fill();
  }

  // outer atmosphere
  const glowR = scale * (2.0 + excite * 0.6);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
  glow.addColorStop(0, `rgba(${palette.glow},${0.18 + excite * 0.16})`);
  glow.addColorStop(1, `rgba(${palette.glow},0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();

  // pulse rings (sonar), staggered
  const pulseSpeed = 0.55 + excite * 0.5;
  for (const offset of [0, 0.33, 0.66]) {
    const phase = (t * pulseSpeed * 0.35 + offset) % 1;
    const r = phase * scale * (1.9 + excite * 0.3);
    const alpha = (1 - phase) * (0.32 + excite * 0.15);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${palette.ink},${alpha})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  // constellation shell — rotating particle swarm with nearest-neighbor links
  const rotY = t * 0.22;
  const rotX = 0.3 + Math.sin(t * 0.1) * 0.08;
  const R = scale * 0.86;
  const focal = scale * 4.2;
  const projected = sketch.shellPts.map((p0) => {
    const p = rotateX(rotateY(p0, rotY), rotX);
    return project(p, 0, 0, R * (1 + excite * 0.06), focal);
  });

  for (const [i, j] of sketch.edges) {
    const a = projected[i];
    const b = projected[j];
    const depth = ((a.z + b.z) / 2 + 1) / 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(${palette.ink},${0.12 + depth * 0.32 + excite * 0.15})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const sortedShell = [...projected].sort((a, b) => a.z - b.z);
  for (const sp of sortedShell) {
    const depth = (sp.z + 1) / 2;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 1 + depth * 1.8 + excite * 0.6, 0, Math.PI * 2);
    ctx.fillStyle =
      depth > 0.68
        ? `rgba(${palette.bright},${0.55 + depth * 0.4})`
        : `rgba(${palette.mid},${0.28 + depth * 0.4})`;
    ctx.fill();
  }

  // liquid core
  const coreR = scale * (0.34 + excite * 0.05) + Math.sin(t * 1.4) * scale * 0.02;
  ctx.beginPath();
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const n = noise2D(Math.cos(a) * 0.9 + t * 0.15, Math.sin(a) * 0.9 + t * 0.15);
    const r = coreR + n * scale * 0.03;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const coreGrad = ctx.createRadialGradient(-coreR * 0.3, -coreR * 0.35, coreR * 0.1, 0, 0, coreR * 1.1);
  coreGrad.addColorStop(0, `rgba(${palette.bright},1)`);
  coreGrad.addColorStop(0.55, `rgba(${palette.mid},0.9)`);
  coreGrad.addColorStop(1, `rgba(${palette.ink},0.55)`);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  ctx.restore();
}
