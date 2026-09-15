"use client";

import Reveal from "@/components/narrative/Reveal";
import { projects } from "@/lib/projects";

export default function WorkScene() {
  return (
    <section id="work" className="relative px-6 py-32 md:px-10" aria-label="Work">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
            05 — Work
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.1] text-ink text-balance">
            While you were away, they built this.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal
              key={project.title}
              delay={0.08 * i}
              className="group flex flex-col justify-between rounded-md border border-line bg-ground-raised p-8 transition-shadow duration-[var(--dur-normal)] hover:shadow-[var(--glow-sm)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold">
                    {project.category}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">
                    Case study
                  </span>
                </div>
                <h3 className="font-display mt-4 text-xl font-medium text-ink">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] text-ink-faint"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-4 font-mono text-xs text-ink-dim">
                → {project.outcome}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
