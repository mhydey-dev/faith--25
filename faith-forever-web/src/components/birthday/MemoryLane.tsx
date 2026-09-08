import { memories } from "./data";
import { Reveal } from "./Reveal";

export function MemoryLane() {
  return (
    <section id="memories" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Three</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Memory lane</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Placeholder photos — swap them for ours.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-16">
          <span className="absolute left-4 top-0 hidden h-full w-px bg-border sm:block" />
          <div className="space-y-12">
            {memories.map((m, i) => (
              <Reveal key={m.title} delay={i * 80}>
                <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10">
                  <div className="hidden pt-6 sm:block">
                    <span className="block h-2.5 w-2.5 translate-x-[10px] rounded-full bg-primary ring-4 ring-background" />
                  </div>
                  <figure className="group shadow-soft hover:shadow-lift relative overflow-hidden rounded-3xl border border-border bg-card transition-shadow duration-500">
                    <img
                      src={m.image}
                      alt={m.title}
                      loading="lazy"
                      width={900}
                      height={1100}
                      className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-80"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-foreground/85 to-transparent p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="text-xs uppercase tracking-[0.25em] text-background/80">
                        {m.date}
                      </p>
                      <p className="mt-1 font-serif text-2xl text-background">{m.title}</p>
                      <p className="mt-1 text-sm text-background/85">{m.caption}</p>
                    </figcaption>
                  </figure>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
