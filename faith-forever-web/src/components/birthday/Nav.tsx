import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { AGE, HER_FIRST, navItems, sections } from "./data";
import { PrivateUnlockDialog } from "./PrivateUnlockDialog";

function navTone(scrolled: boolean, active: boolean) {
  if (scrolled) {
    return active ? "text-primary" : "text-muted-foreground hover:text-foreground";
  }
  return active ? "text-accent" : "text-primary-foreground/75 hover:text-primary-foreground";
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [privateOpen, setPrivateOpen] = useState(false);

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

  const openPrivate = () => {
    setOpen(false);
    setPrivateOpen(true);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-background/85 shadow-soft backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:flex lg:justify-between">
        <a
          href="#hero"
          className={`min-w-0 truncate font-display text-lg font-bold tracking-tight transition-colors ${
            scrolled || open ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          {HER_FIRST.toUpperCase()}
          <span className="ml-2 text-marigold">{AGE}</span>
        </a>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) =>
            item.kind === "private" ? (
              <button
                key={item.id}
                type="button"
                onClick={openPrivate}
                className={`relative text-xs font-medium uppercase tracking-[0.12em] transition-colors ${navTone(
                  scrolled,
                  false,
                )}`}
              >
                {item.label}
                <Lock className="ml-1 inline h-3 w-3 align-[-2px] opacity-80" aria-hidden />
              </button>
            ) : (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative text-xs font-medium uppercase tracking-[0.12em] transition-colors ${navTone(
                  scrolled,
                  active === item.id,
                )}`}
              >
                {item.label}
                {active === item.id && (
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px w-full ${
                      scrolled ? "bg-primary" : "bg-accent"
                    }`}
                  />
                )}
              </a>
            ),
          )}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`shrink-0 border p-2.5 lg:hidden ${
            scrolled || open
              ? "border-border bg-card/70"
              : "border-primary-foreground/30 bg-ink/20"
          }`}
        >
          <span className="grid h-4 w-5 place-items-center">
            <span
              className={`block h-px w-5 transition-transform ${
                scrolled || open ? "bg-foreground" : "bg-primary-foreground"
              } ${open ? "translate-y-px rotate-45" : "-translate-y-1"}`}
            />
            <span
              className={`block h-px w-5 transition-transform ${
                scrolled || open ? "bg-foreground" : "bg-primary-foreground"
              } ${open ? "-translate-y-px -rotate-45" : "translate-y-1"}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav className="max-h-[70vh] overflow-y-auto border-t border-border bg-background/95 px-5 pb-5 pt-2 backdrop-blur-xl lg:hidden">
          {navItems.map((item) =>
            item.kind === "private" ? (
              <button
                key={item.id}
                type="button"
                onClick={openPrivate}
                className="block w-full border-b border-border/60 py-3 text-left font-display text-lg last:border-0"
              >
                {item.label}
                <Lock className="ml-1.5 inline h-3.5 w-3.5 align-[-2px] text-marigold" aria-hidden />
              </button>
            ) : (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="block border-b border-border/60 py-3 font-display text-lg last:border-0"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
      )}

      <PrivateUnlockDialog open={privateOpen} onOpenChange={setPrivateOpen} />
    </header>
  );
}
