import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const CANDLES = [0, 1, 2, 3, 4];

/**
 * Interactive cake: tap candles out, or blow into the mic to extinguish them all.
 * When the last one goes out we fire confetti via the callback.
 */
export function CandleCake({ onAllOut }: { onAllOut: () => void }) {
  const [out, setOut] = useState<number[]>([]);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const allOut = out.length === CANDLES.length;

  useEffect(() => {
    if (allOut) {
      onAllOut();
      cleanup.current?.();
      setListening(false);
    }
  }, [allOut, onAllOut]);

  useEffect(() => () => cleanup.current?.(), []);

  const blowOut = (i: number) => setOut((o) => (o.includes(i) ? o : [...o, i]));

  const startMic = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
        if (peak > 32) setOut(CANDLES.slice());
        raf = requestAnimationFrame(tick);
      };
      tick();
      setListening(true);

      cleanup.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        cleanup.current = null;
      };
    } catch {
      setMicError("No microphone here — just tap the candles instead.");
    }
  };

  return (
    <section id="cake" className="bg-romance px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">First things first</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Make a wish</h2>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Blow into your mic, or tap each candle out the old fashioned way.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 select-none">
            <div className="flex items-end justify-center gap-4">
              {CANDLES.map((i) => {
                const isOut = out.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => blowOut(i)}
                    aria-label={`Candle ${i + 1}${isOut ? " (out)" : ""}`}
                    className="group flex flex-col items-center"
                  >
                    <span
                      className={`mb-1 h-4 w-3 rounded-full transition-all duration-500 ${
                        isOut
                          ? "translate-y-1 scale-50 bg-muted-foreground/40 blur-[2px]"
                          : "animate-soft-pulse bg-gradient-to-t from-primary to-accent shadow-soft"
                      }`}
                      style={isOut ? undefined : { boxShadow: "0 0 18px 4px var(--blush)" }}
                    />
                    <span className="h-14 w-2.5 rounded-t-sm bg-card ring-1 ring-border" />
                  </button>
                );
              })}
            </div>

            <div className="shadow-lift mx-auto -mt-1 h-24 w-full max-w-sm rounded-2xl border border-border bg-card" />
            <div className="shadow-soft mx-auto h-16 w-full max-w-md rounded-b-3xl rounded-t-md border border-border bg-secondary" />

            <div className="mt-10 min-h-[4.5rem]">
              {allOut ? (
                <p className="animate-fade-in font-serif text-2xl italic text-primary">
                  Wish made. I hope it's a selfish one this time.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startMic}
                    disabled={listening}
                    className="rounded-full border border-primary/40 px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
                  >
                    {listening ? "Listening… now blow" : "Use my microphone"}
                  </button>
                  {micError && (
                    <p className="mt-3 text-xs text-muted-foreground">{micError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
