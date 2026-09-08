import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

import { unlockLoveLetter, type LetterImage, type UnlockedLetter } from "@/lib/api";
import { splitLetterParagraphs } from "@/lib/letter";
import { PrivateMusic } from "./PrivateMusic";
import { Reveal } from "./Reveal";

const UNLOCK_PW_KEY = "faith-25-letter-pw";

function readStoredPassword(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(UNLOCK_PW_KEY) || "";
  } catch {
    return "";
  }
}

function storePassword(password: string) {
  try {
    sessionStorage.setItem(UNLOCK_PW_KEY, password);
  } catch {
    /* ignore */
  }
}

function letterFingerprint(letter: UnlockedLetter) {
  return JSON.stringify({
    title: letter.title,
    body: letter.body,
    musicUrl: letter.musicUrl || "",
    musicTitle: letter.musicTitle || "",
    images: (letter.images ?? []).map((image) => `${image._id}:${image.imageUrl}`),
  });
}

export function LockedLetter({
  title,
}: {
  enabled?: boolean;
  title: string;
}) {
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [letter, setLetter] = useState<UnlockedLetter | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionPassword, setSessionPassword] = useState(() => readStoredPassword());
  const fingerprintRef = useRef("");

  const applyLetter = (unlocked: UnlockedLetter) => {
    const next = letterFingerprint(unlocked);
    if (next === fingerprintRef.current) return false;
    fingerprintRef.current = next;
    setLetter(unlocked);
    return true;
  };

  useEffect(() => {
    if (!sessionPassword) return;

    let cancelled = false;

    const pull = async () => {
      try {
        const unlocked = await unlockLoveLetter(sessionPassword);
        if (!cancelled) applyLetter(unlocked);
      } catch {
        if (!cancelled) {
          fingerprintRef.current = "";
          setLetter(null);
          setSessionPassword("");
          try {
            sessionStorage.removeItem(UNLOCK_PW_KEY);
          } catch {
            /* ignore */
          }
        }
      }
    };

    void pull();
    const timer = window.setInterval(() => void pull(), 4000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void pull();
    };
    window.addEventListener("focus", pull);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", pull);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // applyLetter is stable enough via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPassword]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const secret = password.trim();
      const unlocked = await unlockLoveLetter(secret);
      storePassword(secret);
      setSessionPassword(secret);
      fingerprintRef.current = "";
      applyLetter(unlocked);
      setPassword("");
      toast.success(
        unlocked.musicUrl
          ? "Unlocked — her song is for you while you read."
          : "Unlocked — just for you two.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wrong password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="letter" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">Private</p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              {letter?.title || title || "A letter for Faith"}
            </h2>
            <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-muted-foreground">
              Locked on purpose — only she (and you) should open this.
            </p>
          </div>
        </Reveal>

        {!letter ? (
          <Reveal delay={80}>
            {!asking ? (
              <button
                type="button"
                onClick={() => setAsking(true)}
                className="group mt-12 w-full border border-marigold/60 bg-card px-6 py-14 text-center shadow-soft transition-transform hover:-translate-y-1"
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center border border-marigold/50 bg-marigold/10 text-marigold transition-transform group-hover:scale-110">
                  <Lock className="h-7 w-7" aria-hidden />
                </span>
                <span className="mt-6 block font-display text-2xl font-semibold">
                  A sealed letter
                </span>
                <span className="mt-2 block font-serif text-lg italic text-muted-foreground">
                  Tap here to enter the password
                </span>
                <span className="mt-6 inline-block bg-primary px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground">
                  Unlock
                </span>
              </button>
            ) : (
              <form onSubmit={onSubmit} className="mt-12 space-y-4 border-t border-border pt-10">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Password
                  </span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="off"
                      autoFocus
                      placeholder="The word only you two know"
                      className="flex h-11 w-full border border-input bg-background px-4 pr-11 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? "Checking…" : "Unlock the letter"}
                </button>
                <button
                  type="button"
                  onClick={() => setAsking(false)}
                  className="w-full text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </form>
            )}
          </Reveal>
        ) : (
          <Reveal delay={80}>
            <article className="relative mt-12 border-t border-marigold/50 pt-10">
              {letter.musicUrl ? (
                <PrivateMusic
                  key={letter.musicUrl}
                  url={letter.musicUrl}
                  title={letter.musicTitle ?? ""}
                />
              ) : null}
              <h3 className="font-display text-3xl font-semibold">{letter.title}</h3>
              <LetterBody body={letter.body} images={letter.images ?? []} />
            </article>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function LetterBody({ body, images }: { body: string; images: LetterImage[] }) {
  const paragraphs = splitLetterParagraphs(body);
  const count = Math.max(paragraphs.length, images.length);

  return (
    <div className="mt-8 space-y-10 font-serif text-lg leading-relaxed text-foreground/90">
      {Array.from({ length: count }, (_, index) => (
        <div key={`${paragraphs[index] ?? ""}-${images[index]?._id ?? index}`} className="space-y-4">
          {paragraphs[index] ? (
            <p className="whitespace-pre-wrap">{paragraphs[index]}</p>
          ) : null}
          {(() => {
            const image = images[index];
            if (!image) return null;
            return (
              <figure>
                <img
                  src={image.imageUrl}
                  alt={image.caption || ""}
                  className="w-full object-cover"
                />
                {image.caption ? (
                  <figcaption className="mt-2 text-center text-sm italic text-muted-foreground">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
