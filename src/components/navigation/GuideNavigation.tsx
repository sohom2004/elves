"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CHAPTERS, useNarrativeStore } from "@/lib/narrative-store";
import Button from "@/components/ui/Button";

export default function GuideNavigation() {
  const currentChapter = useNarrativeStore((s) => s.currentChapter);
  const setChapter = useNarrativeStore((s) => s.setChapter);
  const requestCta = useNarrativeStore((s) => s.requestCta);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0) return;

    let raf = 0;
    let lastId = "";
    const NAV_OFFSET = 120;

    function update() {
      let activeId = sections[0].id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= NAV_OFFSET) {
          activeId = el.id;
        }
      }
      if (activeId !== lastId) {
        lastId = activeId;
        setChapter(activeId as (typeof CHAPTERS)[number]["id"]);
      }
      raf = requestAnimationFrame(update);
    }
    raf = requestAnimationFrame(update);

    return () => cancelAnimationFrame(raf);
  }, [setChapter]);

  const currentIndex = CHAPTERS.findIndex((c) => c.id === currentChapter);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-ground/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10"
        aria-label="Primary"
      >
        <a
          href="#idea"
          className="font-display text-lg tracking-wide text-ink"
          onClick={() => setChapter("idea")}
        >
          Elves
        </a>

        <ol className="hidden items-center gap-1 md:flex" role="list">
          {CHAPTERS.map((chapter, i) => {
            const active = chapter.id === currentChapter;
            return (
              <li key={chapter.id} className="relative">
                <a
                  href={`#${chapter.id}`}
                  aria-current={active ? "true" : undefined}
                  className={`group relative flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[11px] tracking-[0.08em] transition-colors duration-[var(--dur-fast)] ${
                    active ? "text-ink" : "text-ink-faint hover:text-ink-dim"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="guide-marker"
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      className="relative -ml-1 h-2 w-2 rounded-full bg-gold shadow-[var(--glow-sm)]"
                    />
                  )}
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <motion.span
                    initial={false}
                    animate={{ width: active ? "auto" : 0, opacity: active ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden whitespace-nowrap uppercase"
                  >
                    {chapter.label}
                  </motion.span>
                </a>
              </li>
            );
          })}
        </ol>

        <div className="hidden md:block">
          <Button variant="primary" excitesGuide onClick={() => requestCta()}>
            Summon the Elves
          </Button>
        </div>

        <button
          className="flex items-center gap-2 font-mono text-[11px] text-ink-dim md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          <span className="h-2 w-2 rounded-full bg-gold shadow-[var(--glow-sm)]" />
          {String(currentIndex + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
        </button>
      </nav>

      {mobileOpen && (
        <motion.ol
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mx-6 mb-4 flex flex-col gap-1 rounded-md border border-line bg-ground-raised p-3 md:hidden"
        >
          {CHAPTERS.map((chapter, i) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-sm px-2 py-2 font-mono text-xs uppercase tracking-[0.06em] ${
                  chapter.id === currentChapter ? "text-ink" : "text-ink-faint"
                }`}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {chapter.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              excitesGuide
              onClick={() => {
                setMobileOpen(false);
                requestCta();
              }}
            >
              Summon the Elves
            </Button>
          </li>
        </motion.ol>
      )}
    </header>
  );
}
