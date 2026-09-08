import { useState } from "react";
import { wishes } from "./data";
import { Reveal } from "./Reveal";
import { useSparkle } from "./effects";

export function WishList() {
  const [done, setDone] = useState<number[]>([]);
  const { burst, overlay } = useSparkle();

  const toggle = (i: number, e: React.MouseEvent) => {
    if (!done.includes(i)) burst(e);
    setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
  };

  return (
    <section id="wishes" className="bg-romance px-5 py-24 sm:py-32">
      {overlay}
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Four</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Our year ahead</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              A little list to tick off together.
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 space-y-3">
          {wishes.map((w, i) => {
            const checked = done.includes(i);
            return (
              <Reveal key={w} delay={i * 50}>
                <li>
                  <button
                    type="button"
                    onClick={(e) => toggle(i, e)}
                    className={`shadow-soft flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      checked ? "opacity-70" : ""
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs transition-colors ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={`min-w-0 font-serif text-xl ${checked ? "line-through decoration-primary/60" : ""}`}
                    >
                      {w}
                    </span>
                  </button>
                </li>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {done.length} of {wishes.length} planned
        </p>
      </div>
    </section>
  );
}
