"use client";

import { useEffect, useRef } from "react";
import { subscribeCursor, type CursorSample } from "@/lib/cursor-field";
import { useNarrativeStore } from "@/lib/narrative-store";

interface Node {
  label: string;
  status: string;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  activePulse: number;
}

const NODES = [
  { label: "Idea", status: "received" },
  { label: "Architecture", status: "designed" },
  { label: "AI", status: "thinking" },
  { label: "Data", status: "connected" },
  { label: "Application", status: "assembled" },
  { label: "Deployment", status: "live" },
];

export default function WorkshopNetwork({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let cursor: CursorSample | null = null;
    let raf = 0;
    let t = 0;
    let dragging: Node | null = null;

    const unsub = subscribeCursor((s) => (cursor = s));

    function layout() {
      const rect = wrap!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = NODES.map((n, i) => {
        const hx = (w / (NODES.length + 1)) * (i + 1);
        const hy = h / 2 + Math.sin(i * 1.3) * (h * 0.14);
        return { ...n, homeX: hx, homeY: hy, x: hx, y: hy, vx: 0, vy: 0, active: false, activePulse: 0 };
      });
    }
    layout();
    window.addEventListener("resize", layout);

    function localPos(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function onDown(e: PointerEvent) {
      const p = localPos(e);
      for (const n of nodes) {
        if (Math.hypot(n.x - p.x, n.y - p.y) < 16) {
          dragging = n;
          return;
        }
      }
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      const p = localPos(e);
      dragging.x = p.x;
      dragging.y = p.y;
      dragging.vx = 0;
      dragging.vy = 0;
    }
    function onUp() {
      dragging = null;
    }
    function onClick(e: PointerEvent) {
      const p = localPos(e);
      for (const n of nodes) {
        if (Math.hypot(n.x - p.x, n.y - p.y) < 16) {
          n.active = !n.active;
          n.activePulse = 1;
        }
      }
    }

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("click", onClick);

    if (reducedMotion) {
      renderStatic();
      return () => {
        window.removeEventListener("resize", layout);
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("click", onClick);
        unsub();
      };
    }

    function renderStatic() {
      ctx!.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length - 1; i++) {
        drawEdge(nodes[i], nodes[i + 1], 0.5, false);
      }
      for (const n of nodes) drawNode(n, 0);
    }

    function drawEdge(a: Node, b: Node, dashOffset: number, glow: boolean) {
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.strokeStyle = "rgba(44,40,34,1)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.strokeStyle = glow ? "rgba(255,233,184,0.95)" : "rgba(201,162,74,0.85)";
      ctx!.lineWidth = glow ? 2.4 : 1.8;
      ctx!.setLineDash([7, 12]);
      ctx!.lineDashOffset = dashOffset;
      ctx!.stroke();
      ctx!.setLineDash([]);
    }

    function drawNode(n: Node, near: number) {
      n.activePulse *= 0.96;
      const pulse = 3 + Math.sin(t * 2 + n.homeX) * 1.5 + near * 4 + (n.active ? 3 : 0);
      const glowR = 18 + near * 14 + (n.active ? 10 : 0);
      const g = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
      const intensity = 0.32 + near * 0.3 + (n.active ? 0.25 : 0);
      g.addColorStop(0, `rgba(201,162,74,${intensity})`);
      g.addColorStop(1, "rgba(201,162,74,0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, glowR, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(n.x, n.y, 4 + pulse * 0.3, 0, Math.PI * 2);
      ctx!.fillStyle = n.active || near > 0.4 ? "#ffffff" : "#ffe9b8";
      ctx!.fill();

      if (n.active) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 10 + (1 - n.activePulse) * 14, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255,233,184,${n.activePulse * 0.5})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      }

      ctx!.font = "11px JetBrains Mono, monospace";
      ctx!.fillStyle = `rgba(242,236,224,${0.75 + near * 0.25})`;
      ctx!.textAlign = "center";
      ctx!.fillText(n.label, n.x, n.y + 26);
      ctx!.font = "10px JetBrains Mono, monospace";
      ctx!.fillStyle = n.active ? "rgba(201,162,74,0.9)" : "rgba(168,158,141,0.6)";
      ctx!.fillText(n.active ? "active" : n.status, n.x, n.y + 40);
    }

    function tick() {
      t += 0.016;
      ctx!.clearRect(0, 0, w, h);
      const rect = canvas!.getBoundingClientRect();

      for (const n of nodes) {
        if (n === dragging) continue;
        let tx = n.homeX;
        let ty = n.homeY;

        if (cursor && cursor.active) {
          const cx = cursor.x - rect.left;
          const cy = cursor.y - rect.top;
          const dx = n.x - cx;
          const dy = n.y - cy;
          const d = Math.hypot(dx, dy);
          if (d < 70 && d > 1) {
            const f = (70 - d) / 70;
            tx += (dx / d) * f * 26;
            ty += (dy / d) * f * 26;
          }
        }

        const ax = (tx - n.x) * 0.6 - n.vx * 1.4;
        const ay = (ty - n.y) * 0.6 - n.vy * 1.4;
        n.vx += ax * 0.016;
        n.vy += ay * 0.016;
        n.x += n.vx;
        n.y += n.vy;
      }

      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const glow = a.active || b.active;
        drawEdge(a, b, -t * 44 - i * 10, glow);
      }
      // cross-links for a mesh feel
      for (let i = 0; i < nodes.length - 2; i += 2) {
        const a = nodes[i];
        const b = nodes[i + 2];
        ctx!.save();
        ctx!.globalAlpha = 0.35;
        drawEdge(a, b, -t * 30, false);
        ctx!.restore();
      }

      for (const n of nodes) {
        let near = 0;
        if (cursor && cursor.active) {
          const cx = cursor.x - rect.left;
          const cy = cursor.y - rect.top;
          const d = Math.hypot(n.x - cx, n.y - cy);
          if (d < 60) near = 1 - d / 60;
        }
        drawNode(n, near);
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("click", onClick);
      unsub();
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className={`relative h-[300px] cursor-pointer ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
