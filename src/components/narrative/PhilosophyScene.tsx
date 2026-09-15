"use client";

import Reveal from "@/components/narrative/Reveal";

export default function PhilosophyScene() {
  return (
    <section className="relative px-6 py-40 md:px-10" aria-label="Philosophy">
      <div className="mx-auto flex max-w-[900px] flex-col gap-10 text-center">
        <Reveal>
          <p className="font-display text-2xl leading-relaxed text-ink-dim md:text-3xl">
            Technology should disappear into the background.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="font-display text-2xl leading-relaxed text-ink-dim md:text-3xl">
            The best software doesn&apos;t give you more things to manage.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="font-display text-3xl leading-relaxed text-ink md:text-4xl">
            It gives you fewer.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
            That&apos;s what we&apos;re building at Elves.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
