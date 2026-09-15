"use client";

import { useEffect, useRef, useState } from "react";
import { useNarrativeStore } from "@/lib/narrative-store";

interface Line {
  text: string;
  indent?: boolean;
  key?: boolean;
  cls?: "dim" | "ink" | "green";
}

const DEFAULT_LINES: Line[] = [
  { text: 'import { summon } from "@elves/workshop"', cls: "dim" },
  { text: "" },
  { text: "const agent = await summon({", cls: "ink" },
  { text: '  task: "customer support",', indent: true, key: true },
  { text: '  model: "elves-large",', indent: true, key: true },
  { text: "  voice: true,", indent: true, key: true },
  { text: "})", cls: "ink" },
  { text: "" },
  { text: "agent.deploy() // consider it handled", cls: "green" },
];

export default function CodeWindow({
  title = "workshop / agent.ts",
  lines = DEFAULT_LINES,
  className = "",
}: {
  title?: string;
  lines?: Line[];
  className?: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const [staticRendered] = useState(false);

  useEffect(() => {
    const win = winRef.current;
    if (!win) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    function onMove(e: PointerEvent) {
      const r = win!.getBoundingClientRect();
      win!.style.setProperty("--gx", `${e.clientX - r.left}px`);
      win!.style.setProperty("--gy", `${e.clientY - r.top}px`);
      win!.style.setProperty("--gop", "1");
    }
    function onLeave() {
      win!.style.setProperty("--gop", "0");
    }
    win.addEventListener("pointermove", onMove);
    win.addEventListener("pointerleave", onLeave);
    return () => {
      win.removeEventListener("pointermove", onMove);
      win.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    if (reducedMotion) {
      body.innerHTML = lines.map(renderLine).join("");
      return;
    }

    let cancelled = false;

    async function typeLoop() {
      while (!cancelled) {
        body!.innerHTML = "";
        for (const l of lines) {
          if (cancelled) return;
          const div = document.createElement("div");
          body!.appendChild(div);
          const plain = l.text;
          for (let i = 0; i <= plain.length; i++) {
            if (cancelled) return;
            const shown = plain.slice(0, i);
            const colorCls = l.cls ? `c-${l.cls}` : l.key ? "c-gold" : "c-ink";
            div.innerHTML =
              (l.indent ? "&nbsp;&nbsp;" : "") +
              `<span class="${colorCls}">${escapeHtml(shown)}</span>` +
              '<span class="orb-caret"></span>';
            await sleep(14 + Math.random() * 18);
          }
          div.innerHTML = renderLine(l);
        }
        const caretDiv = document.createElement("div");
        caretDiv.innerHTML = '<span class="orb-caret"></span>';
        body!.appendChild(caretDiv);
        await sleep(2200);
      }
    }
    typeLoop();

    return () => {
      cancelled = true;
    };
  }, [lines, reducedMotion, staticRendered]);

  return (
    <div
      ref={winRef}
      className={`code-window relative overflow-hidden rounded-md border border-line bg-[#0f0d0c] shadow-[var(--elevation-1)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-ground-raised px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9564a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold" />
        <span className="h-2.5 w-2.5 rounded-full bg-green" />
        <span className="ml-2 font-mono text-[11px] text-ink-faint">{title}</span>
      </div>
      <div ref={bodyRef} className="min-h-[150px] px-5 py-4 font-mono text-[12.5px] leading-[1.8]" />
    </div>
  );
}

function renderLine(l: Line): string {
  const indent = l.indent ? "&nbsp;&nbsp;" : "";
  if (l.key) {
    const [k, ...rest] = l.text.split(":");
    const v = rest.join(":");
    return `${indent}<span class="c-gold">${escapeHtml(k)}</span><span class="c-ink">:</span><span class="c-str">${escapeHtml(v)}</span>`;
  }
  const cls = l.cls ? `c-${l.cls}` : "c-ink";
  return `${indent}<span class="${cls}">${escapeHtml(l.text)}</span>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
