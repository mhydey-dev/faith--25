import { useState } from "react";
import { letterParagraphs, letterQuotes, MY_NAME } from "./data";
import { Reveal } from "./Reveal";

export function LoveLetter() {
  const [open, setOpen] = useState(false);

  return (
    <section id="letter" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
            One
          </p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">A letter for you</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Tap the envelope. It has been waiting all year.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12">
            {!open ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group animate-soft-pulse relative mx-auto block w-full max-w-md"
                aria-label="Open the love letter"
              >
                <div className="shadow-lift relative overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-[3/2] w-full bg-romance" />
                  <div
                    className="absolute inset-x-0 top-0 h-1/2"
                    style={{
                      background: "var(--gradient-rosegold)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      opacity: 0.85,
                    }}
                  />
                  <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-primary shadow-soft transition-transform duration-500 group-hover:scale-110">
                    ❤
                  </div>
                </div>
                <span className="mt-5 inline-block font-serif text-lg italic text-muted-foreground">
                  Click to open
                </span>
              </button>
            ) : (
              <article className="animate-fade-in shadow-lift mx-auto max-w-2xl rounded-3xl border border-border bg-card px-6 py-10 text-left sm:px-12 sm:py-14">
                <p className="font-serif text-2xl text-primary">My dearest Faith,</p>
                {letterParagraphs.map((p, i) => (
                  <div key={i}>
                    <p className="mt-5 leading-relaxed text-foreground/85">{p}</p>
                    {letterQuotes[i] && (
                      <blockquote className="my-7 border-l-2 border-primary/60 pl-5 font-serif text-xl italic leading-snug text-primary">
                        {letterQuotes[i]}
                      </blockquote>
                    )}
                  </div>
                ))}
                <p className="mt-8 font-serif text-xl italic">All my love, {MY_NAME}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-primary"
                >
                  Fold it back
                </button>
              </article>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
