"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/narrative/Reveal";
import Button from "@/components/ui/Button";
import { useOrbAnchor } from "@/lib/use-orb-anchor";
import { useNarrativeStore } from "@/lib/narrative-store";

// An orbital forge — concentric rings assembling on scroll, each carrying a
// satellite node and spinning at its own speed once formed. Construction +
// work vocabulary, without the static blueprint-grid look.
const RINGS = [
  { r: 20, dash: "1.2 3", duration: "26s", reverse: false },
  { r: 31, dash: "0.6 4.5", duration: "38s", reverse: true },
  { r: 42, dash: "2 2", duration: "52s", reverse: false },
];

const SPOKES = Array.from({ length: 8 }, (_, i) => (i / 8) * 360);

const ringVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 0.5,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const nodeVariants = {
  hidden: { opacity: 0, scale: 0 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const spokeVariants = {
  hidden: { opacity: 0 },
  show: (i: number) => ({
    opacity: [0, 0.4, 0.15],
    transition: { duration: 1.2, delay: 0.9 + i * 0.05, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function StudioScene() {
  const orbAnchor = useOrbAnchor("studio");
  const requestCta = useNarrativeStore((s) => s.requestCta);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);

  return (
    <section
      id="studio"
      className="relative overflow-hidden bg-ground-deep px-6 py-32 md:px-10"
      aria-label="Elves Studio"
    >
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-16 md:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <span
            ref={orbAnchor}
            className="pointer-events-none absolute -left-[4%] top-1/3 hidden h-1 w-1 md:block"
            aria-hidden="true"
          />
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-green">
            04 — Elves Studio
          </p>
          <h2 className="font-display mt-4 max-w-xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.1] text-ink text-balance">
            Sometimes you need someone to build the whole thing.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-dim">
            SaaS products, AI applications, voice systems, internal tools and
            automation infrastructure — scoped, built, and shipped by the
            workshop. You bring the problem. We bring the crew.
          </p>
          <div className="mt-10">
            <Button variant="primary" excitesGuide className="w-fit" onClick={() => requestCta()}>
              Start a project
            </Button>
          </div>
        </Reveal>

        <div className="relative aspect-square w-full max-w-[440px] justify-self-center md:justify-self-end">
          <motion.svg
            viewBox="0 0 100 100"
            fill="none"
            className="relative z-[1] h-full w-full overflow-visible"
            aria-hidden="true"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          >
            <defs>
              <radialGradient id="studio-core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
              </radialGradient>
            </defs>

            <motion.circle
              cx={50}
              cy={50}
              r={26}
              fill="url(#studio-core-glow)"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1 } } }}
            />

            {SPOKES.map((angle, i) => (
              <motion.line
                key={angle}
                custom={i}
                variants={spokeVariants}
                x1={50 + Math.cos((angle * Math.PI) / 180) * 12}
                y1={50 + Math.sin((angle * Math.PI) / 180) * 12}
                x2={50 + Math.cos((angle * Math.PI) / 180) * 19}
                y2={50 + Math.sin((angle * Math.PI) / 180) * 19}
                stroke="var(--color-gold)"
                strokeWidth={0.6}
                strokeLinecap="round"
              />
            ))}

            {RINGS.map((ring, i) => (
              <g
                key={ring.r}
                className={reducedMotion ? "" : "studio-ring-spin"}
                style={
                  reducedMotion
                    ? { transformOrigin: "50px 50px" }
                    : ({
                        transformOrigin: "50px 50px",
                        animationDuration: ring.duration,
                        animationDirection: ring.reverse ? "reverse" : "normal",
                      } as React.CSSProperties)
                }
              >
                <motion.circle
                  custom={i}
                  variants={ringVariants}
                  cx={50}
                  cy={50}
                  r={ring.r}
                  stroke="var(--color-green)"
                  strokeWidth={0.5}
                  strokeDasharray={ring.dash}
                />
                <motion.circle
                  custom={i}
                  variants={nodeVariants}
                  cx={50 + ring.r}
                  cy={50}
                  r={1.9}
                  fill="var(--color-gold-bright)"
                  className="drop-shadow-[0_0_4px_rgba(255,233,184,0.7)]"
                />
              </g>
            ))}

            <motion.circle
              cx={50}
              cy={50}
              r={8}
              fill="var(--color-ground-deep)"
              stroke="var(--color-gold)"
              strokeWidth={0.6}
              variants={{ hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.4 } } }}
              style={{ transformOrigin: "50px 50px" }}
            />
          </motion.svg>

          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
            <span aria-hidden="true" className="font-jp select-none text-2xl text-gold">
              匠
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
