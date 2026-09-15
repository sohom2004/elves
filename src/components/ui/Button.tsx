"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { useMagnetic } from "@/lib/use-magnetic";
import { useNarrativeStore } from "@/lib/narrative-store";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  excitesGuide?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", excitesGuide = false, className = "", children, ...props },
  forwardedRef
) {
  const magneticRef = useMagnetic<HTMLButtonElement>(0.3, 12);
  const setGuideState = useNarrativeStore((s) => s.setGuideState);

  const base =
    "font-mono text-[13px] tracking-[0.06em] uppercase inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-gold disabled:pointer-events-none disabled:bg-ink-faint disabled:text-ground-deep disabled:border-transparent";
  const styles =
    variant === "primary"
      ? "bg-gold text-ground-deep hover:bg-gold-bright"
      : "bg-transparent text-ink border border-line hover:border-gold-dim";

  return (
    <button
      ref={(node) => {
        magneticRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      data-cursor="cta"
      className={`${base} ${styles} ${className}`}
      onPointerEnter={() => excitesGuide && setGuideState("excited")}
      onPointerLeave={() => excitesGuide && setGuideState("idle")}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
