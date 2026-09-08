import { AGE, HER_NAME } from "./data";
import { Reveal } from "./Reveal";

export function Footer({ onSecret }: { onSecret: () => void }) {
  return (
    <footer className="relative overflow-hidden bg-ink px-5 py-24 text-center text-primary-foreground sm:py-32">
      <Reveal>
        <p className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
          {AGE}
        </p>
        <p className="mt-4 font-serif text-2xl italic text-primary-foreground/80 sm:text-3xl">
          Happy birthday, {HER_NAME}.
        </p>
        <p className="mx-auto mt-6 max-w-md text-sm text-primary-foreground/60">
          Made for her quarter-century — with love, photos, and a little mischief.
        </p>
      </Reveal>

      <div className="mt-16">
        <button
          type="button"
          onClick={onSecret}
          aria-label="A little surprise"
          title="Go on, press it"
          className="group border border-primary-foreground/20 px-4 py-4 text-lg opacity-40 transition-all duration-500 hover:scale-110 hover:opacity-100"
        >
          <span className="inline-block text-marigold transition-transform duration-500 group-hover:rotate-12">
            ✦
          </span>
        </button>
        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-primary-foreground/40">
          psst — press for confetti
        </p>
      </div>
    </footer>
  );
}
