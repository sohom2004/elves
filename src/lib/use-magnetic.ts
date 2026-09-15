"use client";

import { useEffect, useRef } from "react";
import { useNarrativeStore } from "@/lib/narrative-store";

export function useMagnetic<T extends HTMLElement>(strength = 0.35, max = 14) {
  const ref = useRef<T>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    function loop() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      el!.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      tx = Math.max(-max, Math.min(max, relX * strength));
      ty = Math.max(-max, Math.min(max, relY * strength));
    }

    function onLeave() {
      tx = 0;
      ty = 0;
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, max, reducedMotion]);

  return ref;
}
