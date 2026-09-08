import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getMessages,
  messageQueryKey,
  postMessage,
  type BirthdayMessage,
} from "@/lib/api";
import { HER_FIRST } from "./data";
import { Reveal } from "./Reveal";

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
    if (!nextAuthor || !nextContent) return;
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
          <form onSubmit={onSubmit} className="mt-12 space-y-4 border-t border-border pt-10">
            <label className="block text-left">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Your name
              </span>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={80}
                required
                placeholder="How should we sign it?"
                className="mt-2 flex h-11 w-full border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>

            <label className="block text-left">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Your wish
              </span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={1000}
                required
                rows={4}
                placeholder={`Happy 25th, ${HER_FIRST}…`}
                className="mt-2 w-full border border-input bg-background px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
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
