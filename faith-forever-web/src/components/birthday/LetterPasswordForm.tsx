import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { unlockLoveLetter, type UnlockedLetter } from "@/lib/api";
import { storeLetterPassword } from "@/lib/letter";

export function LetterPasswordForm({
  onUnlocked,
  submitLabel = "Unlock",
  autoFocus = true,
}: {
  onUnlocked: (letter: UnlockedLetter, password: string) => void;
  submitLabel?: string;
  autoFocus?: boolean;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const secret = password.trim();
      const unlocked = await unlockLoveLetter(secret);
      storeLetterPassword(secret);
      setPassword("");
      onUnlocked(unlocked, secret);
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
    <form onSubmit={onSubmit} className="space-y-4">
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
            autoFocus={autoFocus}
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
        {loading ? "Checking…" : submitLabel}
      </button>
    </form>
  );
}
