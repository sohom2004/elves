"use client";

import { useEffect, useRef } from "react";
import { subscribeCursor } from "@/lib/cursor-field";
import { useNarrativeStore } from "@/lib/narrative-store";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const haloPos = useRef({ x: 0, y: 0 });
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.body.classList.add("cursor-none-desktop");

    let frame: number;
    const loop = () => {
      const s = subscribeCursorLatest();
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%)`;
      }
      haloPos.current.x += (s.x - haloPos.current.x) * 0.18;
      haloPos.current.y += (s.y - haloPos.current.y) * 0.18;
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloPos.current.x}px, ${haloPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (rootRef.current) {
        rootRef.current.style.opacity = s.active ? "1" : "0";
      }
      frame = requestAnimationFrame(loop);
    };

    let latest = { x: 0, y: 0, active: false };
    const unsub = subscribeCursor((sample) => {
      latest = sample;
    });
    const subscribeCursorLatest = () => latest;

    frame = requestAnimationFrame(loop);

    const interactiveSelector = "a, button, [data-cursor='cta'], input, textarea";
    const onOver = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelector)) {
        haloRef.current?.classList.add("cursor-halo--active");
      }
    };
    const onOut = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelector)) {
        haloRef.current?.classList.remove("cursor-halo--active");
      }
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      cancelAnimationFrame(frame);
      unsub();
      document.body.classList.remove("cursor-none-desktop");
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[100] hidden opacity-0 transition-opacity duration-300 md:block"
      aria-hidden="true"
    >
      <div
        ref={haloRef}
        className="cursor-halo fixed left-0 top-0 h-8 w-8 rounded-full border border-gold/40 transition-[width,height,border-color] duration-200 ease-out"
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-gold"
      />
    </div>
  );
}
