import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { LetterPasswordForm } from "@/components/birthday/LetterPasswordForm";
import { PrivateLetterView } from "@/components/birthday/PrivateLetterView";
import { unlockLoveLetter, type UnlockedLetter } from "@/lib/api";
import {
  clearStoredLetterPassword,
  readStoredLetterPassword,
} from "@/lib/letter";

export const Route = createFileRoute("/private")({
  head: () => ({
    meta: [
      { title: "Private — Faith at 25" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PrivatePage,
});

function letterFingerprint(letter: UnlockedLetter) {
  return JSON.stringify({
    title: letter.title,
    body: letter.body,
    musicUrl: letter.musicUrl || "",
    musicTitle: letter.musicTitle || "",
    images: (letter.images ?? []).map((image) => `${image._id}:${image.kind ?? "image"}:${image.imageUrl}`),
  });
}

function PrivatePage() {
  const [letter, setLetter] = useState<UnlockedLetter | null>(null);
  const [sessionPassword, setSessionPassword] = useState(() => readStoredLetterPassword());
  const [checking, setChecking] = useState(() => Boolean(readStoredLetterPassword()));
  const fingerprintRef = useRef("");

  const applyLetter = (unlocked: UnlockedLetter) => {
    const next = letterFingerprint(unlocked);
    if (next === fingerprintRef.current) return false;
    fingerprintRef.current = next;
    setLetter(unlocked);
    return true;
  };

  useEffect(() => {
    if (!sessionPassword) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const pull = async () => {
      try {
        const unlocked = await unlockLoveLetter(sessionPassword);
        if (!cancelled) {
          applyLetter(unlocked);
          setChecking(false);
        }
      } catch {
        if (!cancelled) {
          fingerprintRef.current = "";
          setLetter(null);
          setSessionPassword("");
          clearStoredLetterPassword();
          setChecking(false);
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← Back to the celebration
        </Link>

        {checking && !letter ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">Opening the letter…</p>
        ) : letter ? (
          <div className="mt-12 border-t border-marigold/50 pt-10">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">Private</p>
            <div className="mt-6">
              <PrivateLetterView letter={letter} />
            </div>
          </div>
        ) : (
          <div className="mt-16 space-y-6 border border-marigold/50 bg-card px-6 py-10 shadow-soft">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">Private</p>
              <h1 className="mt-4 font-display text-3xl font-semibold">A letter for Faith</h1>
              <p className="mx-auto mt-3 max-w-md font-serif text-lg italic text-muted-foreground">
                This page stays hidden until the password is right.
              </p>
            </div>
            <LetterPasswordForm
              submitLabel="Unlock the letter"
              onUnlocked={(unlocked, password) => {
                fingerprintRef.current = "";
                applyLetter(unlocked);
                setSessionPassword(password);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
