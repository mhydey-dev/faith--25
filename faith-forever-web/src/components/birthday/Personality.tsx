import { HER_FIRST, personalityTraits } from "./data";
import { Reveal } from "./Reveal";

export function Personality() {
  return (
    <section id="personality" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">Who she is</p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-6xl">
              The personality of {HER_FIRST}
            </h2>
            <p className="mt-5 font-serif text-lg italic text-muted-foreground sm:text-xl">
            A quiet confidence and a loud sense of self — this is the feeling of knowing her
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {personalityTraits.map((trait, i) => (
            <Reveal key={trait.title} delay={i * 70}>
              <article>
                <p className="font-display text-5xl font-bold text-marigold/80 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold">{trait.title}</h3>
                <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
                  {trait.line}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
