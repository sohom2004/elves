"use client";

import { useEffect, useRef } from "react";
import { subscribeCursor, type CursorSample } from "@/lib/cursor-field";
import { useNarrativeStore } from "@/lib/narrative-store";
import { getOrbAnchors } from "@/lib/orb-anchors";
import { createOrbSketch, drawGuideOrb } from "@/lib/orb-sketch";

// Large enough to contain the outer glow at full excitement (scale up to
// ~58, glow radius up to scale*2.6 ≈ 151px) with room to fully fade out
// before the canvas edge — otherwise the soft glow gets hard-clipped into
// a visible square.
const SIZE = 420;

function computeAnchorTarget(): { x: number; y: number } | null {
  const anchors = getOrbAnchors();
  if (anchors.length === 0) return null;
  const trigger = window.innerHeight * 0.42;
  const rects = anchors.map((a) => a.el.getBoundingClientRect());

  let passed = -1;
  for (let i = 0; i < rects.length; i++) {
    if (rects[i].top <= trigger) passed = i;
  }

  if (passed === -1) {
    const r = rects[0];
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  if (passed === rects.length - 1) {
    const r = rects[passed];
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  const a = rects[passed];
  const b = rects[passed + 1];
  const denom = b.top - a.top || 1;
  const localT = Math.min(1, Math.max(0, (trigger - a.top) / denom));
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  return { x: ax + (bx - ax) * localT, y: ay + (by - ay) * localT };
}

export default function GuideOrbLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const guideState = useNarrativeStore((s) => s.guideState);
  const guideStateRef = useRef(guideState);

  useEffect(() => {
    guideStateRef.current = guideState;
  }, [guideState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sketch = createOrbSketch(11);
    let px = window.innerWidth / 2;
    let py = window.innerHeight * 0.4;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let cursor: CursorSample | null = null;
    let visible = true;

    const unsub = subscribeCursor((s) => (cursor = s));

    if (reducedMotion) {
      const target = computeAnchorTarget();
      if (target) {
        px = target.x;
        py = target.y;
      }
      wrap.style.transform = `translate3d(${px - SIZE / 2}px, ${py - SIZE / 2}px, 0)`;
      drawGuideOrb(ctx, sketch, SIZE / 2, SIZE / 2, { scale: 52, t: 0, excite: 0, dirX: 0, dirY: -1 });
      return () => unsub();
    }

    let t = 0;
    function tick() {
      t += 0.016;
      const anchorTarget = computeAnchorTarget();
      let tx = anchorTarget?.x ?? px;
      let ty = anchorTarget?.y ?? py;

      let excite = guideStateRef.current !== "idle" ? 1 : 0;
      let dirX = 0;
      let dirY = -1;

      if (cursor && cursor.active) {
        const dx = cursor.x - px;
        const dy = cursor.y - py;
        const d = Math.hypot(dx, dy);
        if (d < 220) {
          const pull = (1 - d / 220) * 0.6;
          tx = tx + (cursor.x - tx) * pull;
          ty = ty + (cursor.y - ty) * pull;
          excite = Math.max(excite, (1 - d / 220) * 0.7);
          if (d > 1) {
            dirX = dx / d;
            dirY = dy / d;
          }

          // Keep a clearance ring around the cursor — attraction should
          // feel magnetic, not land the orb exactly on top of whatever
          // the visitor is pointing at or reading.
          const MIN_CLEARANCE = 130;
          const tdx = tx - cursor.x;
          const tdy = ty - cursor.y;
          const td = Math.hypot(tdx, tdy);
          if (td < MIN_CLEARANCE) {
            if (td > 1) {
              const s = MIN_CLEARANCE / td;
              tx = cursor.x + tdx * s;
              ty = cursor.y + tdy * s;
            } else {
              tx = cursor.x + MIN_CLEARANCE;
            }
          }
        }
      }

      const stiffness = 5.5;
      const damping = 3.4;
      const ax = (tx - px) * stiffness - vx * damping;
      const ay = (ty - py) * stiffness - vy * damping;
      vx += ax * 0.016;
      vy += ay * 0.016;
      px += vx * 0.016;
      py += vy * 0.016;

      // Skip drawing entirely off-screen (perf) but keep physics running.
      visible = px > -SIZE && px < window.innerWidth + SIZE && py > -SIZE && py < window.innerHeight + SIZE;
      wrap!.style.opacity = visible ? "1" : "0";
      wrap!.style.transform = `translate3d(${px - SIZE / 2}px, ${py - SIZE / 2}px, 0)`;

      if (visible) {
        ctx!.clearRect(0, 0, SIZE, SIZE);
        drawGuideOrb(ctx!, sketch, SIZE / 2, SIZE / 2, { scale: 52 + excite * 6, t, excite, dirX, dirY });
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      unsub();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed left-0 top-0 z-0 mix-blend-screen will-change-transform"
      style={{ width: SIZE, height: SIZE }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
