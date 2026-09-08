import { useState } from "react";
import { playlist } from "./data";
import { Reveal } from "./Reveal";

export function Playlist() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="playlist" className="bg-romance px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Five</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Songs that are ours</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Swap in the real titles — and link the playlist if you like.
            </p>
          </div>
        </Reveal>

        <ol className="shadow-lift mt-14 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {playlist.map((s, i) => {
            const isActive = active === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActive(isActive ? null : i)}
                  className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-secondary/60"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isActive ? "♪" : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-xl">{s.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">{s.artist}</span>
                    {isActive && (
                      <span className="animate-fade-in mt-2 block font-serif italic text-primary">
                        {s.why}
                      </span>
                    )}
                  </span>
                  <span aria-hidden className="flex shrink-0 items-end gap-[3px]">
                    {[0, 1, 2].map((b) => (
                      <span
                        key={b}
                        className="w-[3px] rounded-full bg-primary transition-all duration-500"
                        style={{
                          height: isActive ? `${8 + b * 6}px` : "4px",
                          opacity: isActive ? 1 : 0.3,
                          animation: isActive
                            ? `soft-pulse ${0.8 + b * 0.25}s ease-in-out infinite`
                            : undefined,
                        }}
                      />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
