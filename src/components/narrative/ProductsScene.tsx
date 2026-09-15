"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/narrative/Reveal";
import Button from "@/components/ui/Button";
import { useNarrativeStore } from "@/lib/narrative-store";
import { useOrbAnchor } from "@/lib/use-orb-anchor";
import { products } from "@/lib/products";

const N = products.length;

export default function ProductsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useNarrativeStore((s) => s.reducedMotion);
  const orbAnchor = useOrbAnchor("products");
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(N - 1, Math.floor(v * N));
    setActive(idx);
  });

  if (reducedMotion) {
    return (
      <section id="products" className="relative bg-ground-deep px-6 py-32 md:px-10" aria-label="Elves Products">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">05 — Products</p>
            <h2 className="font-display mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.1] text-ink text-balance">
              We build things for ourselves, too.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {products.map((p) => (
              <div key={p.name} className="rounded-md border border-line bg-ground-raised p-8">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-gold">{p.status}</span>
                <h3 className="font-display mt-3 text-xl text-ink">{p.name}</h3>
                <p className="mt-2 text-sm text-ink-dim">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative bg-ground-deep"
      style={{ height: `${N * 100}vh` }}
      aria-label="Elves Products"
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-6 py-24 md:px-10">
        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          <span
            ref={orbAnchor}
            className="pointer-events-none absolute right-[6%] top-6 hidden h-1 w-1 md:block"
            aria-hidden="true"
          />
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
            05 — Products
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.1] text-ink text-balance">
            We build things for ourselves, too.
          </h2>
        </div>

        <div className="relative flex-1">
          {products.map((product, i) => (
            <ProductPanel
              key={product.name}
              product={product}
              index={i}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between">
          <Button variant="secondary" className="w-fit">
            Explore products
          </Button>
          <div className="flex items-center gap-2" role="tablist" aria-label="Product">
            {products.map((p, i) => (
              <span
                key={p.name}
                role="tab"
                aria-selected={active === i}
                aria-label={p.name}
                className="h-1.5 rounded-full transition-all duration-[var(--dur-normal)]"
                style={{
                  width: active === i ? "28px" : "8px",
                  background: active === i ? "var(--color-gold)" : "var(--color-line)",
                }}
              />
            ))}
          </div>
        </div>

        <p className="relative z-10 mx-auto mt-4 w-full max-w-[1400px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          keep scrolling ↓
        </p>
      </div>
    </section>
  );
}

function ProductPanel({
  product,
  index,
  scrollYProgress,
}: {
  product: (typeof products)[number];
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / N;
  const end = (index + 1) / N;
  const mid = (start + end) / 2;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.06, end - 0.06, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [start, mid, end], [48, 0, -48]);
  const scale = useTransform(scrollYProgress, [start, mid, end], [0.96, 1, 0.96]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="relative grid w-full max-w-[1100px] items-center gap-10 overflow-hidden rounded-md border border-line bg-ground-raised px-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-14 md:py-14">
        <span
          aria-hidden="true"
          className="font-jp pointer-events-none absolute -right-4 -top-10 select-none text-[220px] leading-none text-gold opacity-[0.06]"
        >
          {product.jp}
        </span>

        <div className="relative z-[1]">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
            0{index + 1} — {product.status}
          </span>
          <h3 className="font-display mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.05] text-ink text-balance">
            {product.name}
          </h3>
          <p className="mt-3 max-w-sm text-lg leading-snug text-ink-dim">
            {product.tagline}
          </p>
        </div>

        <div className="relative z-[1] flex flex-col gap-6">
          <p className="max-w-md text-sm leading-relaxed text-ink-dim">
            {product.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
