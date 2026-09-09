import { useRef, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getMessages,
  messageQueryKey,
  postMessage,
  type BirthdayMessage,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { HER_FIRST } from "./data";
import { Reveal } from "./Reveal";

type WishField = "author" | "content";

function FieldPrompt({ id, message }: { id: string; message: string }) {
  return (
    <div
      id={id}
      role="alert"
      className="absolute bottom-[calc(100%+12px)] left-1/2 z-20 w-max max-w-[min(20rem,calc(100%-0.5rem))] -translate-x-1/2 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1 duration-200"
    >
      <div className="relative z-10 flex items-center gap-2 rounded-md border border-sea/30 bg-card px-3 py-2 text-sm text-foreground shadow-soft">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-marigold text-accent-foreground">
          <Heart className="h-3 w-3 fill-current" />
        </span>
        {message}
      </div>
      <span
        aria-hidden
        className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-sea/30 bg-card"
      />
    </div>
  );
}

function formatPostedAt(value: string) {
  try {
    return format(new Date(value), "MMMM d, yyyy");
  } catch {
    return "";
  }
}

export function WishWall({ initialMessages }: { initialMessages: BirthdayMessage[] }) {
  const queryClient = useQueryClient();
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [emptyField, setEmptyField] = useState<WishField | null>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = initialMessages } = useQuery({
    queryKey: messageQueryKey,
    queryFn: getMessages,
    initialData: initialMessages,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: postMessage,
    onSuccess: (created) => {
      queryClient.setQueryData<BirthdayMessage[]>(messageQueryKey, (current) => {
        const next = current ?? [];
        return [created, ...next];
      });
      setAuthor("");
      setContent("");
      toast.success("Your birthday wish is up.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not send your wish.");
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;
    const nextAuthor = author.trim();
    const nextContent = content.trim();
    if (!nextAuthor) {
      setEmptyField("author");
      authorRef.current?.focus();
      return;
    }
    if (!nextContent) {
      setEmptyField("content");
      contentRef.current?.focus();
      return;
    }
    setEmptyField(null);
    mutation.mutate({ author: nextAuthor, content: nextContent });
  };

  return (
    <section id="wishes" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">Guestbook</p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Happy birthday wishes
            </h2>
            <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-muted-foreground">
              Leave {HER_FIRST} a note she can read on her day — funny, soft, or gloriously over the top.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <form noValidate onSubmit={onSubmit} className="mt-12 space-y-4 border-t border-border pt-10">
            <label className="block text-left">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Your name
              </span>
              <span className="relative mt-2 block">
                {emptyField === "author" ? (
                  <FieldPrompt id="wish-author-hint" message="Please fill in this field." />
                ) : null}
                <input
                  ref={authorRef}
                  value={author}
                  onChange={(e) => {
                    setAuthor(e.target.value);
                    if (emptyField === "author") setEmptyField(null);
                  }}
                  maxLength={80}
                  required
                  aria-invalid={emptyField === "author"}
                  aria-describedby={emptyField === "author" ? "wish-author-hint" : undefined}
                  placeholder="How should we sign it?"
                  className={cn(
                    "flex h-11 w-full border bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-1",
                    emptyField === "author"
                      ? "border-marigold ring-1 ring-marigold/70"
                      : "border-input focus-visible:ring-ring",
                  )}
                />
              </span>
            </label>

            <label className="block text-left">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Your wish
              </span>
              <span className="relative mt-2 block">
                {emptyField === "content" ? (
                  <FieldPrompt id="wish-content-hint" message="Please fill in this field." />
                ) : null}
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (emptyField === "content") setEmptyField(null);
                  }}
                  maxLength={1000}
                  required
                  rows={4}
                  aria-invalid={emptyField === "content"}
                  aria-describedby={emptyField === "content" ? "wish-content-hint" : undefined}
                  placeholder={`Happy 25th, ${HER_FIRST}…`}
                  className={cn(
                    "w-full border bg-background px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-1",
                    emptyField === "content"
                      ? "border-marigold ring-1 ring-marigold/70"
                      : "border-input focus-visible:ring-ring",
                  )}
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-accent px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-accent-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {mutation.isPending ? "Sending…" : "Leave a wish"}
            </button>
          </form>
        </Reveal>

        <ul className="mt-14 space-y-8">
          {messages.length === 0 ? (
            <li className="border border-dashed border-border px-5 py-10 text-center text-muted-foreground">
              No wishes yet — be the first to say happy birthday.
            </li>
          ) : (
            messages.map((message, i) => (
              <Reveal key={message._id} delay={Math.min(i, 8) * 40}>
                <li className="border-l-2 border-marigold pl-5">
                  <p className="font-serif text-xl leading-relaxed">{message.content}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    — {message.author}
                    {message.createdAt ? (
                      <span className="ml-2 text-xs uppercase tracking-[0.18em]">
                        {formatPostedAt(message.createdAt)}
                      </span>
                    ) : null}
                  </p>
                </li>
              </Reveal>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
