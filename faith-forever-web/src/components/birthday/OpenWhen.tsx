import { useState } from "react";
import { openWhenNotes } from "./data";
import { Reveal } from "./Reveal";

export function OpenWhen() {
  const [opened, setOpened] = useState<number[]>([]);

  return (
    <section id="openwhen" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Four</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Open when…</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Little sealed notes for the days you need one. Only open what you need.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 space-y-4">
          {openWhenNotes.map((n, i) => {
            const isOpen = opened.includes(i);
            return (
              <Reveal key={n.label} delay={i * 50}>
                <div
                  className={`shadow-soft overflow-hidden rounded-2xl border transition-colors duration-500 ${
                    isOpen ? "border-primary/40 bg-card" : "border-border bg-card/70"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpened((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))
                    }
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 text-left"
                  >
                    <span className="shrink-0 text-lg">{isOpen ? "💌" : "✉️"}</span>
                    <span className="min-w-0 font-serif text-lg sm:text-xl">{n.label}</span>
                    <span
                      className={`shrink-0 text-xs uppercase tracking-[0.2em] transition-transform duration-500 ${
                        isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      ⌄
                    </span>
                  </button>
                  {isOpen && (
                    <p className="animate-fade-in border-t border-border/60 px-6 py-6 font-serif text-lg italic leading-relaxed text-foreground/85">
                      {n.note}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
