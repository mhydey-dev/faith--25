import { useCallback, useEffect, useRef, useState } from "react";

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  round: boolean;
};

const COLORS = [
  "var(--marigold)",
  "var(--sea)",
  "var(--primary)",
  "oklch(0.92 0.06 95)",
  "oklch(0.7 0.08 175)",
];

let seed = 0;

function makePieces(n: number): Piece[] {
  return Array.from({ length: n }, () => {
    seed += 1;
    const r = (m: number) => ((Math.sin(seed * m) + 1) / 2) as number;
    return {
      id: seed,
      left: r(12.9898) * 100,
      delay: r(78.233) * 0.9,
      duration: 2.4 + r(43.7) * 2.2,
      color: COLORS[Math.floor(r(93.1) * COLORS.length)] ?? "var(--marigold)",
      size: 7 + r(21.3) * 10,
      round: r(51.7) > 0.55,
    };
  });
}

export function useConfetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback((amount = 140) => {
    setPieces(makePieces(amount));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPieces([]), 5200);
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const overlay = pieces.length ? (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`absolute top-0 ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.round ? p.size : p.size * 1.6}px`,
            background: p.color,
            animation: `confetti-fall ${p.duration}s cubic-bezier(0.3,0.6,0.5,1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  ) : null;

  return { fire, overlay };
}

export function useSparkle() {
  const [bursts, setBursts] = useState<
    { id: number; x: number; y: number; parts: { dx: number; dy: number }[] }[]
  >([]);

  const burst = useCallback((e: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    const parts = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const dist = 34 + (i % 4) * 12;
      return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
    });
    setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY, parts }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 800);
  }, []);

  const overlay = bursts.length ? (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      {bursts.map((b) =>
        b.parts.map((p, i) => (
          <span
            key={`${b.id}-${i}`}
            className="absolute text-accent"
            style={
              {
                left: b.x,
                top: b.y,
                fontSize: i % 2 ? "12px" : "16px",
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                animation: "sparkle-pop 0.7s ease-out forwards",
              } as React.CSSProperties
            }
          >
            ✦
          </span>
        )),
      )}
    </div>
  ) : null;

  return { burst, overlay };
}
