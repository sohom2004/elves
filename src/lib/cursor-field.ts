export interface CursorSample {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  active: boolean;
  fine: boolean;
}

type Listener = (sample: CursorSample) => void;

const sample: CursorSample = {
  x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
  y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  vx: 0,
  vy: 0,
  speed: 0,
  active: false,
  fine: false,
};

const listeners = new Set<Listener>();
let lastX = sample.x;
let lastY = sample.y;
let lastT = 0;
let rafId: number | null = null;
let started = false;

function tick(t: number) {
  const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0.016;
  lastT = t;

  const dx = sample.x - lastX;
  const dy = sample.y - lastY;
  sample.vx = dt > 0 ? dx / dt : 0;
  sample.vy = dt > 0 ? dy / dt : 0;
  sample.speed = Math.hypot(sample.vx, sample.vy);
  lastX = sample.x;
  lastY = sample.y;

  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--cursor-x", `${sample.x}px`);
    document.documentElement.style.setProperty("--cursor-y", `${sample.y}px`);
  }

  listeners.forEach((fn) => fn(sample));
  rafId = requestAnimationFrame(tick);
}

export function startCursorField() {
  if (started || typeof window === "undefined") return;
  started = true;
  sample.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  window.addEventListener(
    "pointermove",
    (e) => {
      sample.x = e.clientX;
      sample.y = e.clientY;
      sample.active = true;
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerleave",
    () => {
      sample.active = false;
    },
    { passive: true }
  );

  rafId = requestAnimationFrame(tick);
}

export function stopCursorField() {
  if (rafId) cancelAnimationFrame(rafId);
  started = false;
  rafId = null;
}

export function subscribeCursor(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCursorSample() {
  return sample;
}
