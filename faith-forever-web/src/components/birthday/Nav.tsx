import { useEffect, useState } from "react";
import { sections } from "./data";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      let current = "hero";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 shadow-soft backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:flex lg:justify-between">
        <a href="#hero" className="min-w-0 truncate font-serif text-lg tracking-tight">

          <span className="text-gradient-rose">Faith&apos;s Day</span>
        </a>

        <nav className="hidden items-center gap-5 lg:flex">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`relative text-xs uppercase tracking-[0.12em] transition-colors ${
                active === s.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
              {active === s.id && (
                <span className="absolute -bottom-1.5 left-0 h-px w-full bg-primary" />
              )}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full border border-border bg-card/70 p-2.5 lg:hidden"
        >
          <span className="grid h-4 w-5 place-items-center">
            <span
              className={`block h-px w-5 bg-foreground transition-transform ${open ? "translate-y-px rotate-45" : "-translate-y-1"}`}
            />
            <span
              className={`block h-px w-5 bg-foreground transition-transform ${open ? "-translate-y-px -rotate-45" : "translate-y-1"}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav className="animate-fade-in max-h-[70vh] overflow-y-auto border-t border-border bg-background/95 px-5 pb-5 pt-2 backdrop-blur-xl lg:hidden">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setOpen(false)}
              className="block border-b border-border/60 py-3 font-serif text-lg last:border-0"
            >
              {s.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
