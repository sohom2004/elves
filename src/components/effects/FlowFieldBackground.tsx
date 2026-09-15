"use client";

import { useEffect, useRef } from "react";
import { noise2D } from "@/lib/simplex-noise";
import { subscribeCursor, type CursorSample } from "@/lib/cursor-field";
import { useNarrativeStore } from "@/lib/narrative-store";

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  age: number;
  maxAge: number;
}

export default function FlowFieldBackground({
  className = "",
  density = 1,
}: {
  className?: string;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const deviceCapability = useNarrativeStore((s) => s.deviceCapability);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    const cellSize = 24;
    let field: Float32Array = new Float32Array(0);
    let particles: Particle[] = [];
    let cursor: CursorSample | null = null;
    let raf = 0;
    let z = 0;

    const baseCount = deviceCapability === "low" ? 90 : 220;
    const count = Math.round(baseCount * density);

    const unsub = subscribeCursor((s) => (cursor = s));

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.fillStyle = "#0c0b0a";
      ctx!.fillRect(0, 0, w, h);
      cols = Math.ceil(w / cellSize);
      rows = Math.ceil(h / cellSize);
      field = new Float32Array(cols * rows);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        px: 0,
        py: 0,
        age: Math.random() * 200,
        maxAge: 160 + Math.random() * 160,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    function updateField() {
      z += 0.0022;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          field[y * cols + x] = noise2D(x * 0.08 + z, y * 0.08 + z) * Math.PI * 2;
        }
      }
    }

    function tick() {
      updateField();
      ctx!.fillStyle = "rgba(12,11,10,0.05)";
      ctx!.fillRect(0, 0, w, h);

      const rect = canvas!.getBoundingClientRect();

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;
        const col = Math.max(0, Math.min(cols - 1, Math.floor(p.x / cellSize)));
        const row = Math.max(0, Math.min(rows - 1, Math.floor(p.y / cellSize)));
        const angle = field[row * cols + col];
        let vx = Math.cos(angle) * 0.55;
        let vy = Math.sin(angle) * 0.55;

        if (cursor && cursor.active) {
          const localX = cursor.x - rect.left;
          const localY = cursor.y - rect.top;
          const dx = p.x - localX;
          const dy = p.y - localY;
          const d = Math.hypot(dx, dy);
          if (d < 110 && d > 1) {
            const f = (110 - d) / 110;
            vx += (dx / d) * f * 1.3;
            vy += (dy / d) * f * 1.3;
          }
        }

        p.x += vx;
        p.y += vy;
        p.age++;

        if (p.age > p.maxAge || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.px = p.x;
          p.py = p.y;
          p.age = 0;
        } else {
          ctx!.beginPath();
          ctx!.moveTo(p.px, p.py);
          ctx!.lineTo(p.x, p.y);
          ctx!.strokeStyle = "rgba(201,162,74,0.32)";
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      unsub();
    };
  }, [reducedMotion, deviceCapability, density]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
}
