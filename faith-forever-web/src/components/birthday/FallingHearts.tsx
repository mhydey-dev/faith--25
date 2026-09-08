import { useMemo } from "react";

/** Gentle falling hearts / petals used as ambient hero decoration. */
export function FallingHearts({ count = 18 }: { count?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 97) % 100,
        size: 10 + ((i * 13) % 18),
        duration: 12 + ((i * 7) % 14),
        delay: -((i * 3.3) % 18),
        opacity: 0.25 + ((i * 11) % 40) / 100,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="animate-float-heart absolute top-0 text-primary"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}
