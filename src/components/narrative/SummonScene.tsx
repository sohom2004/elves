"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/narrative/Reveal";
import FlowFieldBackground from "@/components/effects/FlowFieldBackground";
import { useNarrativeStore } from "@/lib/narrative-store";
import { useOrbAnchor } from "@/lib/use-orb-anchor";

const EXAMPLES = [
  "Build an AI support agent",
  "Build my SaaS MVP",
  "Automate our sales workflow",
  "Give our customers a voice assistant",
  "Build an internal dashboard",
];

export default function SummonScene() {
  const [value, setValue] = useState("");
  const [summoned, setSummoned] = useState(false);
  const setGuideState = useNarrativeStore((s) => s.setGuideState);
  const requestCta = useNarrativeStore((s) => s.requestCta);
  const orbAnchor = useOrbAnchor("summon");

  function summon(e?: React.FormEvent) {
    e?.preventDefault();
    if (!value.trim()) return;
    setSummoned(true);
    setGuideState("excited");
    window.setTimeout(() => setGuideState("idle"), 2400);
    window.setTimeout(() => requestCta(value.trim()), 900);
  }

  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-10" aria-label="Summon the Elves">
      <FlowFieldBackground density={0.4} className="opacity-60" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1100px] items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <span ref={orbAnchor} className="block h-1 w-1" aria-hidden="true" />
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">Summon</p>
          <h2 className="font-display mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.1] text-ink text-balance">
            What do you need?
          </h2>
          <p className="mt-5 max-w-sm text-ink-dim leading-relaxed">
            Describe the problem in plain language. The workshop takes it from
            there — architecture, AI, data, deployment.
          </p>

          <div className="mt-8 flex flex-col gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setValue(ex)}
                data-cursor="cta"
                className="group flex items-center gap-2 text-left font-mono text-[13px] text-ink-faint transition-colors duration-[var(--dur-fast)] hover:text-ink"
              >
                <span className="text-ink-faint transition-colors group-hover:text-gold">→</span>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="overflow-hidden rounded-md border border-line bg-[#0f0d0c] shadow-[var(--elevation-1)]">
            <div className="flex items-center gap-2 border-b border-line bg-ground-raised px-3.5 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9564a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              <span className="h-2.5 w-2.5 rounded-full bg-green" />
              <span className="ml-2 font-mono text-[11px] text-ink-faint">summon.sh</span>
            </div>
            <form onSubmit={summon} className="px-5 py-6">
              <label htmlFor="summon-input" className="sr-only">
                What do you need the Elves to build?
              </label>
              <div className="flex items-center gap-2 font-mono text-sm text-ink">
                <span className="text-gold">elves&gt;</span>
                <input
                  id="summon-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={() => setGuideState("curious")}
                  onBlur={() => setGuideState("idle")}
                  placeholder="build me an ai customer support platform"
                  aria-label="What do you need the Elves to build?"
                  className="flex-1 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none"
                />
                <span className="orb-caret" aria-hidden="true" />
              </div>

              <button
                type="submit"
                data-cursor="cta"
                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ground-deep transition-colors duration-[var(--dur-fast)] hover:bg-gold-bright"
              >
                Summon the Elves
              </button>

              <AnimatePresence>
                {summoned && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    role="status"
                    className="mt-4 font-mono text-[13px] text-gold"
                  >
                    ✓ workshop activating — the Elves are on it.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
