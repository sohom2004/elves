"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/narrative/Reveal";
import Button from "@/components/ui/Button";
import { useNarrativeStore } from "@/lib/narrative-store";

const IDEAS = [
  "A voice agent that never sleeps.",
  "An internal dashboard people actually open.",
  "A copilot that already read the docs.",
  "The tool that replaces three spreadsheets.",
  "An automation that ends the 6pm handoff.",
  "A product we haven't thought of yet.",
];

type Status = "idle" | "sending" | "sent" | "error";

export default function FinalScene() {
  const [idea, setIdea] = useState("");
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const setGuideState = useNarrativeStore((s) => s.setGuideState);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const ctaRequestId = useNarrativeStore((s) => s.ctaRequestId);
  const ctaPrefill = useNarrativeStore((s) => s.ctaPrefill);

  const showingGhost = !focused && idea.trim().length === 0;

  useEffect(() => {
    if (!showingGhost || reducedMotion) return;
    const id = window.setInterval(() => {
      setIdeaIndex((i) => (i + 1) % IDEAS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [showingGhost, reducedMotion]);

  // Other CTA buttons across the site ("Summon the Elves", "Start a
  // project", ...) route here: bring the real form into view, drop in
  // whatever the visitor already typed, and hand them the cursor.
  useEffect(() => {
    if (ctaRequestId === 0) return;
    const prefill = ctaPrefill;
    const fillId = window.setTimeout(() => {
      if (prefill) setIdea(prefill);
    }, 0);
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });
    const focusId = window.setTimeout(() => inputRef.current?.focus(), 500);
    return () => {
      window.clearTimeout(fillId);
      window.clearTimeout(focusId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaRequestId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim() || status === "sending") return;
    setStatus("sending");
    setGuideState("excited");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setStatus("sent");
      window.setTimeout(() => setGuideState("idle"), 2400);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setGuideState("idle");
    }
  }

  return (
    <section id="about" className="relative overflow-hidden px-6 py-40 md:px-10" aria-label="Final call to action">
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8 text-center">
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-medium text-ink text-balance">
            Have something you want built?
          </h2>
          <p className="mt-4 text-lg text-ink-dim">Tell the Elves.</p>
        </Reveal>

        <Reveal delay={0.2} className="w-full">
          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-md border border-line bg-ground-raised px-8 py-10"
            >
              <span className="font-jp text-2xl text-gold">受</span>
              <p className="font-display text-xl text-gold">Consider it handled.</p>
              <p className="text-sm text-ink-dim">The Elves have it. Expect a reply soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="mx-auto flex max-w-xl flex-col items-center gap-4">
              <div
                onClick={(e) => {
                  // Let clicks that land on an actual form control (the
                  // email field, or the textarea itself) keep their own
                  // native focus — only clicks on the surrounding box
                  // (or the decorative ghost text) should hand focus to
                  // the idea textarea.
                  const target = e.target as HTMLElement;
                  if (target.closest("input, textarea")) return;
                  inputRef.current?.focus();
                }}
                className="relative w-full cursor-text overflow-hidden rounded-md border border-line bg-ground-raised px-6 py-8 transition-colors duration-[var(--dur-fast)] focus-within:border-gold-dim"
              >
                <span
                  aria-hidden="true"
                  className="font-jp pointer-events-none absolute -right-4 -top-6 select-none text-[110px] leading-none text-gold opacity-[0.05]"
                >
                  夢
                </span>

                <div className="relative z-[1] grid">
                  <textarea
                    ref={inputRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onFocus={() => {
                      setFocused(true);
                      setGuideState("curious");
                    }}
                    onBlur={() => {
                      setFocused(false);
                      setGuideState("idle");
                    }}
                    rows={1}
                    aria-label="What should the Elves build?"
                    placeholder={showingGhost ? "" : "What should we build?"}
                    className="col-start-1 row-start-1 min-h-[2.5rem] resize-none bg-transparent text-center font-display text-2xl leading-snug text-ink placeholder:text-ink-faint focus-visible:outline-none"
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                  />

                  {showingGhost && (
                    <div className="col-start-1 row-start-1 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <FlowingIdea key={ideaIndex} text={IDEAS[ideaIndex]} reducedMotion={reducedMotion} />
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {idea.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="relative z-[1] mt-5 flex justify-center overflow-hidden"
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email (so we can reply)"
                        aria-label="Your email"
                        className="w-full max-w-sm rounded-sm border border-line bg-ground px-4 py-2.5 text-center text-sm text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-gold"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button type="submit" variant="primary" excitesGuide disabled={status === "sending"}>
                {status === "sending" ? "Summoning…" : "Summon the Elves"}
              </Button>

              {status === "error" && (
                <p role="alert" className="font-mono text-xs text-danger">
                  {errorMsg}
                </p>
              )}
            </form>
          )}
        </Reveal>

        <Reveal delay={0.3}>
          <a
            href="#work"
            data-cursor="cta"
            className="font-mono text-[13px] uppercase tracking-[0.06em] text-ink-dim underline decoration-line underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-ink hover:decoration-gold"
          >
            See our work
          </a>
        </Reveal>
      </div>

      <footer className="mx-auto mt-32 flex max-w-[1400px] flex-col items-center gap-4 border-t border-line pt-10 font-mono text-xs text-ink-faint md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} Elves</span>
        <span>You focus. We build. You sleep. They work.</span>
      </footer>
    </section>
  );
}

function FlowingIdea({ text, reducedMotion }: { text: string; reducedMotion: boolean }) {
  const words = text.split(" ");

  if (reducedMotion) {
    return <span className="font-display text-2xl leading-snug text-ink-faint">{text}</span>;
  }

  return (
    <motion.span
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-wrap justify-center gap-x-2 px-2 font-display text-2xl leading-snug text-ink-faint"
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
            },
            exit: {
              opacity: 0,
              filter: "blur(6px)",
              transition: { duration: 0.35, delay: i * 0.02, ease: [0.4, 0, 1, 1] },
            },
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.span>
  );
}
