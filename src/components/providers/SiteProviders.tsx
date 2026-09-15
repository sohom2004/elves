"use client";

import { useEffect } from "react";
import { startCursorField } from "@/lib/cursor-field";
import { useNarrativeStore } from "@/lib/narrative-store";
import CustomCursor from "@/components/effects/CustomCursor";

export default function SiteProviders({ children }: { children: React.ReactNode }) {
  const setReducedMotion = useNarrativeStore((s) => s.setReducedMotion);
  const setDeviceCapability = useNarrativeStore((s) => s.setDeviceCapability);

  useEffect(() => {
    startCursorField();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setReducedMotion(motionQuery.matches);
    applyMotion();
    motionQuery.addEventListener("change", applyMotion);

    const cores = navigator.hardwareConcurrency ?? 4;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    setDeviceCapability(cores < 4 || memory < 4 || coarse ? "low" : "high");

    return () => motionQuery.removeEventListener("change", applyMotion);
  }, [setReducedMotion, setDeviceCapability]);

  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
