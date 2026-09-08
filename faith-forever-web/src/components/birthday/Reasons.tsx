import { useState } from "react";
import { reasons } from "./data";
import { Reveal } from "./Reveal";

export function Reasons() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <section id="reasons" className="relative bg-romance px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Two</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Reasons why I love you</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Eight of a very long list. Tap any card.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => {
            const isOpen = flipped === i;
            return (
              <Reveal key={r.title} delay={i * 60}>
                <button
                  type="button"
                  onClick={() => setFlipped(isOpen ? null : i)}
                  className={`shadow-soft hover:shadow-lift flex h-56 w-full flex-col justify-between rounded-3xl border border-border p-6 text-left transition-all duration-500 ${
                    isOpen ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  {isOpen ? (
                    <p className="animate-fade-in text-sm leading-relaxed">{r.note}</p>
                  ) : (
                    <span className="font-serif text-2xl">{r.title}</span>
                  )}
                  <span
                    className={`text-[10px] uppercase tracking-[0.25em] ${isOpen ? "opacity-70" : "text-muted-foreground"}`}
                  >
                    {isOpen ? r.title : "Tap to read"}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
