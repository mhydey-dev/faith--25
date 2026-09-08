import { useEffect, useState } from "react";
import { TOGETHER_SINCE } from "./data";
import { Reveal } from "./Reveal";

function diff() {
  const start = new Date(TOGETHER_SINCE).getTime();
  const now = Date.now();
  const ms = Math.max(0, now - start);
  const secs = Math.floor(ms / 1000);
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor(secs / 3600),
    minutes: Math.floor(secs / 60),
    seconds: secs,
  };
}

export function TogetherTicker() {
  const [t, setT] = useState(diff);
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(true);
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const stats = [
    { label: "Days of us", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds, and counting", value: t.seconds },
  ];

  return (
    <section className="border-y border-border/60 px-5 py-16">
      <Reveal>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Since {new Date(TOGETHER_SINCE).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="font-serif text-3xl tabular-nums text-gradient-rose sm:text-4xl"
                  suppressHydrationWarning
                >
                  {live ? s.value.toLocaleString() : "—"}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
