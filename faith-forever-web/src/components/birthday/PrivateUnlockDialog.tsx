import { Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LetterPasswordForm } from "./LetterPasswordForm";

export function PrivateUnlockDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-marigold/40 sm:rounded-none">
        <DialogHeader className="space-y-3 text-center sm:text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center border border-marigold/50 bg-marigold/10 text-marigold">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <DialogTitle className="font-display text-2xl font-semibold">
            Private letter
          </DialogTitle>
          <DialogDescription className="font-serif text-base italic">
            Enter the password to open a page only she should see.
          </DialogDescription>
        </DialogHeader>
        <LetterPasswordForm
          submitLabel="Open the letter"
          onUnlocked={() => {
            onOpenChange(false);
            void navigate({ to: "/private" });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
