"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/narrative/Reveal";
import { useNarrativeStore } from "@/lib/narrative-store";
import { useOrbAnchor } from "@/lib/use-orb-anchor";

interface Capability {
  jp: string;
  tag: string;
  headline: string;
  body: string;
  icon: string;
}

const CAPABILITIES: Capability[] = [
  {
    jp: "脳",
    tag: "AI",
    headline: "Give your software a brain.",
    body: "AI applications, RAG, knowledge systems, copilots, intelligent workflows, agentic systems.",
    icon: "M16 4a6 6 0 016 6c0 2-1 3-1 5v3a2 2 0 01-2 2h-6a2 2 0 01-2-2v-3c0-2-1-3-1-5a6 6 0 016-6z M12 26h8 M14 22v4 M18 22v4",
  },
  {
    jp: "組",
    tag: "SaaS",
    headline: "Turn an idea into a product.",
    body: "SaaS MVPs, dashboards, customer portals, internal applications, complete web products.",
    icon: "M4 8a2 2 0 012-2h20a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V8z M4 12h24 M8 9.5h.01 M11 9.5h.01",
  },
  {
    jp: "声",
    tag: "Voice",
    headline: "Give your business a voice.",
    body: "Voice agents, conversational systems, support agents, phone workflows, voice-driven operations.",
    icon: "M8 16V12a8 8 0 0116 0v4 M6 16v3a2 2 0 002 2h1v-7H8a2 2 0 00-2 2z M24 16v3a2 2 0 01-2 2h-1v-7h1a2 2 0 012 2z M15 26h2",
  },
  {
    jp: "結",
    tag: "Systems",
    headline: "Connect everything behind the scenes.",
    body: "Databases, APIs, integrations, automation, internal tools, operational infrastructure.",
    icon: "M8 8a3 3 0 100-6 3 3 0 000 6z M24 8a3 3 0 100-6 3 3 0 000 6z M8 28a3 3 0 100-6 3 3 0 000 6z M24 28a3 3 0 100-6 3 3 0 000 6z M8 8v14 M24 8v14 M8 22h16 M8 8h16",
  },
];

const N = CAPABILITIES.length;

export default function CapabilitiesScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const orbAnchor = useOrbAnchor("build");
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(N - 1, Math.floor(v * N)));
  });

  const beadTop = useTransform(scrollYProgress, [0, 1], ["4%", "96%"]);

  if (reducedMotion) {
    return (
      <section id="build" className="relative px-6 py-32 md:px-10" aria-label="What we build">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">03 — Build</p>
            <h2 className="font-display mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.1] text-ink text-balance">
              What can the Elves build?
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
            {CAPABILITIES.map((cap) => (
              <div key={cap.tag} className="bg-ground-raised p-8">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-gold">{cap.tag}</span>
                <h3 className="font-display mt-4 text-2xl font-medium text-ink">{cap.headline}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="build"
      ref={sectionRef}
      className="relative"
      style={{ height: `${N * 100}vh` }}
      aria-label="What we build"
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-6 py-24 md:px-10">
        <Reveal className="relative z-10 mx-auto w-full max-w-[1400px]">
          <span
            ref={orbAnchor}
            className="pointer-events-none absolute right-[6%] top-4 hidden h-1 w-1 md:block"
            aria-hidden="true"
          />
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
            03 — Build
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.1] text-ink text-balance">
            What can the Elves build?
          </h2>
        </Reveal>

        <div className="relative z-10 mx-auto mt-10 flex min-h-0 w-full max-w-[1400px] flex-1 gap-6 md:gap-12">
          {/* flowing spine */}
          <div className="relative w-[56px] shrink-0 md:w-[80px]">
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 10 100"
              aria-hidden="true"
            >
              <path
                d="M5 0 L5 100"
                stroke="var(--color-line)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M5 0 L5 100"
                stroke="var(--color-gold)"
                strokeWidth="1.4"
                fill="none"
                strokeDasharray="3 5"
                className="animate-[spine-flow_2.4s_linear_infinite]"
                opacity={0.55}
              />
            </svg>
            <motion.div
              className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-bright shadow-[var(--glow-md)]"
              style={{ top: beadTop }}
            />
            {CAPABILITIES.map((cap, i) => (
              <div
                key={cap.tag}
                className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{ top: `${((i + 0.5) / N) * 100}%` }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border transition-all duration-[var(--dur-normal)]"
                  style={{
                    borderColor: active === i ? "var(--color-gold)" : "var(--color-line)",
                    background: active === i ? "var(--color-gold)" : "var(--color-ground-raised)",
                    boxShadow: active === i ? "var(--glow-sm)" : "none",
                  }}
                />
                <span className="font-jp hidden text-xs text-ink-faint md:block">{cap.jp}</span>
              </div>
            ))}
          </div>

          {/* flowing card stack */}
          <div className="relative min-h-0 flex-1">
            {CAPABILITIES.map((cap, i) => (
              <CapabilityPanel key={cap.tag} cap={cap} index={i} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>

        <p className="relative z-10 mx-auto mt-6 w-full max-w-[1400px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          keep scrolling ↓
        </p>
      </div>
    </section>
  );
}

function CapabilityPanel({
  cap,
  index,
  scrollYProgress,
}: {
  cap: Capability;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / N;
  const end = (index + 1) / N;
  const mid = (start + end) / 2;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.08, end - 0.08, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [start, mid, end], [64, 0, -64]);
  const blur = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [8, 0, 0, 8]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className="pointer-events-none absolute inset-0 flex items-center"
    >
      <div className="relative w-full overflow-hidden rounded-md border border-line bg-ground-raised p-8 md:p-12">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-gold opacity-[0.06]"
        >
          <path d={cap.icon} />
        </svg>

        <motion.svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="#b6493a"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-[1] h-10 w-10"
        >
          <motion.path
            d={cap.icon}
            style={{ pathLength: useTransform(opacity, [0, 1], [0, 1]) }}
          />
        </motion.svg>

        <div className="relative z-[1] mt-6">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
            {cap.tag}
          </span>
          <h3 className="font-display mt-4 max-w-lg text-2xl font-medium text-ink text-balance md:text-3xl">
            {cap.headline}
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-dim">
            {cap.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
