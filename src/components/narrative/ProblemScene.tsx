"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/narrative/Reveal";
import { useNarrativeStore } from "@/lib/narrative-store";
import { useOrbAnchor } from "@/lib/use-orb-anchor";

interface Problem {
  jp: string;
  theme: string;
  title: string;
  body: string;
  icon: string;
}

const PROBLEMS: Problem[] = [
  {
    jp: "知",
    theme: "AI",
    title: "AI isn't the bottleneck.",
    body: "Turning it into something people can actually use is.",
    icon: "M16 4a6 6 0 016 6c0 2-1 3-1 5v3a2 2 0 01-2 2h-6a2 2 0 01-2-2v-3c0-2-1-3-1-5a6 6 0 016-6z M12 26h8 M14 22v4 M18 22v4",
  },
  {
    jp: "結",
    theme: "Systems",
    title: "Your business runs on software.",
    body: "Why does it still run on people?",
    icon: "M8 8a3 3 0 100-6 3 3 0 000 6z M24 8a3 3 0 100-6 3 3 0 000 6z M8 28a3 3 0 100-6 3 3 0 000 6z M24 28a3 3 0 100-6 3 3 0 000 6z M8 8v14 M24 8v14 M8 22h16 M8 8h16",
  },
  {
    jp: "声",
    theme: "Customers",
    title: "Someone is always waiting.",
    body: "For a reply. A call. An answer.",
    icon: "M8 4c-2 0-4 2-4 4 0 12 12 24 24 24 2 0 4-2 4-4l-2-6-6 2c-3-2-6-5-8-8l2-6z",
  },
  {
    jp: "造",
    theme: "Tools",
    title: "Off-the-shelf stops where your problems get interesting.",
    body: "",
    icon: "M20 4l8 8-4 4-3-3-10 10a3 3 0 01-4-4l10-10-3-3z M6 26l-2 2",
  },
  {
    jp: "増",
    theme: "Scale",
    title: "More customers shouldn't mean more people.",
    body: "",
    icon: "M6 24l6-8 6 4 8-12 4 5 M4 28h24",
  },
  {
    jp: "夢",
    theme: "Ideas",
    title: "The distance between “we should build this” and “it’s live” is enormous.",
    body: "",
    icon: "M16 5v4 M16 23v4 M5 16h4 M23 16h4 M8 8l3 3 M24 8l-3 3 M8 24l3-3 M24 24l-3-3 M16 12a4 4 0 100 8 4 4 0 000-8z",
  },
  {
    jp: "技",
    theme: "Production AI",
    title: "Making AI work once is easy.",
    body: "Making it work every time is engineering.",
    icon: "M6 8h20a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2z M4 12h24 M10 6v4 M22 6v4",
  },
  {
    jp: "働",
    theme: "Always-on",
    title: "The work doesn't stop at 6 PM.",
    body: "Why should your software?",
    icon: "M16 6v10l7 4 M16 2a14 14 0 100 28 14 14 0 000-28z",
  },
];

export default function ProblemScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const orbAnchor = useOrbAnchor("problem");

  useEffect(() => {
    function measure() {
      if (!rowRef.current || !trackRef.current) return;
      const diff = rowRef.current.scrollWidth - trackRef.current.clientWidth;
      setMaxScroll(Math.max(0, diff));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxScroll]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: reducedMotion ? "auto" : "420vh" }}
      aria-label="The problem"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-6 py-16 md:px-10">
        <Reveal className="relative z-10 mx-auto w-full max-w-[1400px]">
          <span
            ref={orbAnchor}
            className="pointer-events-none absolute right-[8%] top-1/2 hidden h-1 w-1 -translate-y-1/2 md:block"
            aria-hidden="true"
          />
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
            The problem
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.1] text-ink text-balance">
            There is always more work.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-dim md:text-lg">
            Building software shouldn&apos;t become another thing you have to
            manage.
          </p>
        </Reveal>

        <div
          ref={trackRef}
          className="relative z-10 mx-auto mt-10 w-full max-w-[1400px] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)",
          }}
        >
          <motion.div ref={rowRef} className="flex gap-5" style={{ x: reducedMotion ? 0 : x }}>
            {PROBLEMS.map((p, i) => (
              <ProblemCard key={p.theme} problem={p} index={i} />
            ))}
          </motion.div>
        </div>

        <p className="mx-auto mt-6 w-full max-w-[1400px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          keep scrolling —&gt;
        </p>
      </div>
    </section>
  );
}

function ProblemCard({ problem, index }: { problem: Problem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      el!.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    }
    function onLeave() {
      el!.style.transform = "";
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="problem-card relative flex h-[clamp(260px,40vh,340px)] w-[min(72vw,320px)] flex-none flex-col gap-4 overflow-hidden rounded-[2px] border border-line bg-ground-raised p-6"
      style={{ transformStyle: "preserve-3d", transition: "transform 0.3s cubic-bezier(.16,1,.3,1), border-color 0.3s" }}
    >
      <span className="pointer-events-none absolute -top-3 -left-3 h-6 w-6 border-l border-t border-[#b6493a]/60" />
      <span className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-[#b6493a]/60" />
      <span className="font-jp pointer-events-none absolute -top-5 right-0 select-none text-[170px] leading-none text-[#b6493a] opacity-[0.07]">
        {problem.jp}
      </span>

      <div className="relative z-[1] flex items-center justify-between">
        <span className="font-mono text-xs text-ink-faint">0{index + 1}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
          {problem.theme}
        </span>
      </div>

      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="#b6493a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-[1] h-9 w-9"
      >
        <path d={problem.icon} />
      </svg>

      <div className="relative z-[1] mt-auto flex flex-col gap-2.5">
        <h3 className="flex items-baseline gap-2 font-display text-[1.3rem] font-medium leading-[1.16] text-ink text-balance">
          <span className="font-jp text-base font-normal text-[#b6493a]">{problem.jp}</span>
          {problem.title}
        </h3>
        {problem.body && (
          <p className="text-[13px] leading-relaxed text-ink-dim">{problem.body}</p>
        )}
      </div>
    </div>
  );
}
