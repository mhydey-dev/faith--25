import { HER_NAME, MY_NAME } from "./data";
import { Reveal } from "./Reveal";

export function Footer({ onSecret }: { onSecret: (e: React.MouseEvent) => void }) {
  return (
    <footer className="relative overflow-hidden px-5 py-24 text-center sm:py-32">
      <Reveal>
        <p className="font-serif text-3xl italic sm:text-4xl">Forever and always yours,</p>
        <p className="mt-3 font-serif text-4xl text-gradient-rose sm:text-5xl">{MY_NAME}</p>
        <p className="mx-auto mt-8 max-w-md text-muted-foreground">
          Made slowly, on purpose, for {HER_NAME}.
        </p>
      </Reveal>

      <div className="mt-16">
        <button
          type="button"
          onClick={onSecret}
          aria-label="A little surprise"
          title="Go on, press it"
          className="group rounded-full border border-border/60 px-4 py-4 text-lg opacity-25 transition-all duration-500 hover:scale-110 hover:opacity-100 hover:shadow-soft"
        >
          <span className="transition-transform duration-500 group-hover:rotate-12">🎉</span>
        </button>
        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
          psst — press the tiny thing
        </p>
      </div>
    </footer>
  );
}
