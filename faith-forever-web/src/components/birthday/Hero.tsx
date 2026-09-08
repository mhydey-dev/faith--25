import heroBg from "@/assets/hero-bg.jpg";
import { AGE, HER_FIRST, HER_NAME } from "./data";
import { useSparkle } from "./effects";

export function Hero() {
  const { burst, overlay } = useSparkle();

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-end overflow-hidden">
      {overlay}
      <img
        src={heroBg}
        alt=""
        width={1920}
        height={1200}
        className="absolute inset-0 h-full w-full scale-105 object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(0.78 0.14 85 / 0.35), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.55 0.08 195 / 0.3), transparent 35%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:pb-24">
        <p
          className="animate-drift-up font-display text-[clamp(4.5rem,18vw,11rem)] leading-[0.85] tracking-[-0.04em] text-primary-foreground"
          style={{ fontWeight: 800 }}
        >
          {HER_FIRST.toUpperCase()}
        </p>
        <div className="mt-4 flex flex-col gap-6 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h1 className="animate-drift-up font-display text-3xl font-semibold text-primary-foreground sm:text-5xl" style={{ animationDelay: "120ms" }}>
              Turning {AGE}
            </h1>
            <p
              className="animate-drift-up mt-3 max-w-md font-serif text-lg italic text-primary-foreground/80 sm:text-xl"
              style={{ animationDelay: "220ms" }}
            >
              A quarter-century of {HER_NAME} — personality, pictures, and the people who love her.
            </p>
          </div>
          <div
            className="animate-drift-up flex shrink-0 flex-col gap-3 sm:items-end"
            style={{ animationDelay: "320ms" }}
          >
            <a
              href="#personality"
              onClick={burst}
              className="inline-flex items-center gap-2 bg-accent px-7 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-accent-foreground transition-transform duration-300 hover:-translate-y-1"
            >
              Meet her →
            </a>
            <a
              href="#letter"
              className="inline-flex items-center justify-center border border-primary-foreground/40 px-7 py-3 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/90 transition-colors hover:border-marigold hover:text-marigold"
            >
              Private letter 🔒
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
