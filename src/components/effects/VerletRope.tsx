"use client";

import { useEffect, useRef } from "react";
import { useNarrativeStore } from "@/lib/narrative-store";

interface Point {
  x: number;
  y: number;
  px: number;
  py: number;
  pinned: boolean;
}

class Rope {
  points: Point[];
  anchor: { x: number; y: number };
  spacing: number;
  dragging: Point | null = null;

  constructor(anchorX: number, anchorY: number, links: number, spacing: number) {
    this.anchor = { x: anchorX, y: anchorY };
    this.spacing = spacing;
    this.points = Array.from({ length: links }, (_, i) => ({
      x: anchorX,
      y: anchorY + i * spacing,
      px: anchorX,
      py: anchorY + i * spacing,
      pinned: i === 0,
    }));
  }

  update(hover: { x: number; y: number; active: boolean } | null) {
    const g = 0.45;
    for (const p of this.points) {
      if (p.pinned || p === this.dragging) continue;
      let vx = (p.x - p.px) * 0.98;
      let vy = (p.y - p.py) * 0.98;
      p.px = p.x;
      p.py = p.y;
      if (hover && hover.active) {
        const dx = hover.x - p.x;
        const dy = hover.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 50 && d > 1) {
          const f = ((50 - d) / 50) * 0.5;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }
      }
      p.x += vx;
      p.y += vy + g;
    }
    for (let iter = 0; iter < 6; iter++) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const a = this.points[i];
        const b = this.points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const diff = (dist - this.spacing) / dist;
        const aFree = !(a.pinned || a === this.dragging);
        const bFree = !(b.pinned || b === this.dragging);
        const aw = aFree ? 0.5 : 0;
        const bw = bFree ? 0.5 : 0;
        const sum = aw + bw || 1;
        if (aFree) {
          a.x += dx * diff * (aw / sum);
          a.y += dy * diff * (aw / sum);
        }
        if (bFree) {
          b.x -= dx * diff * (bw / sum);
          b.y -= dy * diff * (bw / sum);
        }
      }
      this.points[0].x = this.anchor.x;
      this.points[0].y = this.anchor.y;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) ctx.lineTo(this.points[i].x, this.points[i].y);
    ctx.strokeStyle = "rgba(201,162,74,0.55)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.stroke();
    const last = this.points[this.points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 4.5);
    g.addColorStop(0, "#ffe9b8");
    g.addColorStop(1, "#c9a24a");
    ctx.fillStyle = g;
    ctx.fill();
  }

  hitTest(x: number, y: number): Point | null {
    const last = this.points[this.points.length - 1];
    return Math.hypot(last.x - x, last.y - y) < 14 ? last : null;
  }
}

export default function VerletRope({
  count = 2,
  links = 13,
  spacing = 15,
  className = "",
}: {
  count?: number;
  links?: number;
  spacing?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let ropes: Rope[] = [];
    let raf = 0;
    let activeRope: Rope | null = null;
    let hover: { x: number; y: number; active: boolean } = { x: -9999, y: -9999, active: false };

    function resize() {
      const rect = wrap!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ropes = Array.from({ length: count }, (_, i) => {
        const x = w * ((i + 1) / (count + 1));
        return new Rope(x, 0, links, spacing);
      });
    }
    resize();
    window.addEventListener("resize", resize);

    function localPos(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function onDown(e: PointerEvent) {
      const p = localPos(e);
      for (const rope of ropes) {
        const hit = rope.hitTest(p.x, p.y);
        if (hit) {
          rope.dragging = hit;
          activeRope = rope;
          break;
        }
      }
    }
    function onMove(e: PointerEvent) {
      const p = localPos(e);
      hover = { x: p.x, y: p.y, active: true };
      if (activeRope && activeRope.dragging) {
        activeRope.dragging.x = p.x;
        activeRope.dragging.y = p.y;
      }
    }
    function onUp() {
      if (activeRope) {
        activeRope.dragging = null;
        activeRope = null;
      }
    }
    function onLeave() {
      hover.active = false;
    }

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    function tick() {
      ctx!.clearRect(0, 0, w, h);
      for (const rope of ropes) {
        rope.update(hover);
        rope.render(ctx!);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [count, links, spacing, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div ref={wrapRef} className={`pointer-events-auto ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
