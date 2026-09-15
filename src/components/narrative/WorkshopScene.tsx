"use client";

import Reveal from "@/components/narrative/Reveal";
import WorkshopNetwork from "@/components/workshop/WorkshopNetwork";
import VerletRope from "@/components/effects/VerletRope";
import { useOrbAnchor } from "@/lib/use-orb-anchor";

export default function WorkshopScene() {
  const orbAnchor = useOrbAnchor("workshop");

  return (
    <section
      id="workshop"
      className="relative overflow-hidden bg-ground-deep px-6 py-32 md:px-10"
      aria-label="The workshop"
    >
      <VerletRope
        count={3}
        links={11}
        spacing={13}
        className="pointer-events-none absolute right-10 top-0 hidden h-40 w-32 opacity-70 md:block lg:right-24"
      />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <span
          ref={orbAnchor}
          className="pointer-events-none absolute right-[6%] top-10 hidden h-1 w-1 md:block"
          aria-hidden="true"
        />
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
            02 — Workshop
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.1] text-ink text-balance">
            An idea becomes a system.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-dim">
            Every project moves through the same workshop — idea, architecture,
            intelligence, data, application, deployment. Nothing ships until
            every piece is connected.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            drag a node, or click one to activate it
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-14 rounded-md border border-line bg-ground/40">
          <WorkshopNetwork />
        </Reveal>
      </div>
    </section>
  );
}
