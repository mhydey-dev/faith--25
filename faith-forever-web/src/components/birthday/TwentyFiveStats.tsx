import { AGE, HER_FIRST, twentyFiveStats } from "./data";
import { Reveal } from "./Reveal";

export function TwentyFiveStats() {
  return (
    <section id="stats" className="relative overflow-hidden px-5 py-24 sm:py-32">
      <div
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-marigold/20 blur-3xl animate-float-soft"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-sea/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">By the numbers</p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-6xl">
              {AGE} years of amazing
            </h2>
            <p className="mt-4 font-serif text-lg italic text-muted-foreground">
            Quarter-century metrics. Not just data—the kind of stats that feel true to anyone who knows {HER_FIRST}.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {twentyFiveStats.map((stat, i) => (
            <Reveal key={stat.unit} delay={i * 80}>
              <div className="border-t border-border pt-6">
                <p className="animate-number-glow font-display text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.22em] text-sea">
                  {stat.unit}
                </p>
                <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
                  {stat.metaphor}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
