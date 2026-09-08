import heroBg from "@/assets/hero-bg.jpg";
import { HER_NAME } from "./data";
import { FallingHearts } from "./FallingHearts";
import { useSparkle } from "./effects";

export function Hero() {
  const { burst, overlay } = useSparkle();

  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden px-5">
      {overlay}
      <img
        src={heroBg}
        alt=""
        width={1920}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
      <FallingHearts />

      <div className="relative mx-auto max-w-3xl pt-24 text-center">
        <p className="animate-fade-in text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Today, we celebrate you
        </p>
        <h1 className="animate-fade-in mt-6 font-serif text-5xl leading-[1.05] sm:text-7xl">
          Happy Birthday,
          <span className="mt-2 block text-gradient-rose">{HER_NAME} ❤️</span>
        </h1>
        <p className="animate-fade-in mx-auto mt-6 max-w-md font-serif text-xl italic text-muted-foreground">
          A digital love letter for my favorite person.
        </p>
        <a
          href="#letter"
          onClick={burst}
          className="shadow-lift mt-12 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
        >
          Begin the journey ↓
        </a>
      </div>
    </section>
  );
}
