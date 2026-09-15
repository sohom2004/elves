"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import FlowFieldBackground from "@/components/effects/FlowFieldBackground";
import CodeWindow from "@/components/effects/CodeWindow";
import Button from "@/components/ui/Button";
import { useOrbAnchor } from "@/lib/use-orb-anchor";
import { useNarrativeStore } from "@/lib/narrative-store";

export default function HeroScene() {
  const orbAnchor = useOrbAnchor("hero");
  const requestCta = useNarrativeStore((s) => s.requestCta);

  return (
    <section
      id="idea"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-28 md:px-10"
      aria-label="Opening"
    >
      <FlowFieldBackground density={0.7} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-3xl">
          <span ref={orbAnchor} className="block h-1 w-1" aria-hidden="true" />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs uppercase tracking-[0.16em] text-gold"
          >
            AI Software Studio &amp; SaaS Company
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mt-4 text-[clamp(2.75rem,6vw,4.5rem)] font-medium leading-[1.05] text-ink text-balance"
          >
            Your work.
            <br />
            Their workshop.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-dim"
          >
            AI-powered software, agents and systems built to keep your work
            moving. You focus on what matters. The Elves handle the rest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button variant="primary" excitesGuide onClick={() => requestCta()}>
              Summon the Elves
            </Button>
            <Link
              href="#work"
              data-cursor="cta"
              className="font-mono text-[13px] uppercase tracking-[0.06em] text-ink-dim underline decoration-line underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-ink hover:decoration-gold"
            >
              See what we&apos;re building
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: -1.5 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block"
        >
          <CodeWindow />
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ground to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
