import { useEffect, useState } from "react";

import heroBg from "@/assets/hero-bg.jpg";
import portrait1 from "@/assets/hero-portrait-1.jpg";
import portrait2 from "@/assets/hero-portrait-2.jpg";
import portrait3 from "@/assets/hero-portrait-3.jpg";
import { cn } from "@/lib/utils";
import { AGE, HER_FIRST, HER_NAME } from "./data";
import { useSparkle } from "./effects";

const portraits = [portrait1, portrait2, portrait3];

export function Hero() {
  const { burst, overlay } = useSparkle();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((current) => (current + 1) % portraits.length);
    }, 10_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-end overflow-hidden">
      {overlay}

      <div className="absolute inset-0 wide-hero:hidden" aria-hidden>
        {portraits.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            width={819}
            height={1024}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-[center_18%] transition-opacity duration-[1200ms] ease-in-out",
              index === slide
                ? "opacity-100 motion-safe:animate-hero-ken"
                : "opacity-0",
            )}
          />
        ))}
      </div>

      <img
        src={heroBg}
        alt=""
        width={1920}
        height={1200}
        className="absolute inset-0 hidden h-full w-full object-cover wide-hero:block"
      />

      <div
        className="absolute inset-0 wide-hero:hidden"
        style={{
          backgroundImage:
            "linear-gradient(180deg, oklch(0.22 0.045 175 / 0.22) 0%, oklch(0.22 0.045 175 / 0.32) 42%, oklch(0.16 0.04 175 / 0.78) 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 hidden wide-hero:block"
        style={{ backgroundImage: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-20 wide-hero:opacity-30"
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
              A quarter-century of {HER_NAME} — 25 Years, 100% Faith.
            </p>
          </div>
          <div
            className="animate-drift-up shrink-0 sm:items-end"
            style={{ animationDelay: "320ms" }}
          >
            <a
              href="#personality"
              onClick={burst}
              className="inline-flex items-center gap-2 bg-accent px-7 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-accent-foreground transition-transform duration-300 hover:-translate-y-1"
            >
              Meet her →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
