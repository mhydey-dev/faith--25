import { useState } from "react";
import { Play } from "lucide-react";

import { splitLetterParagraphs } from "@/lib/letter";
import {
  driveFileId,
  drivePreviewSrc,
  isLetterVideo,
  letterVideoPoster,
} from "@/lib/letter-media";
import { youtubeEmbedSrc, youtubeVideoId } from "@/lib/music";
import type { LetterImage, UnlockedLetter } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrivateMusic } from "./PrivateMusic";

const polaroidTilts = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "rotate-[1.5deg]",
  "-rotate-[1.5deg]",
];

export function PrivateLetterView({ letter }: { letter: UnlockedLetter }) {
  const media = letter.images ?? [];
  const hasVideo = media.some(isLetterVideo);
  const hasImage = media.some((item) => !isLetterVideo(item));

  return (
    <article className="relative">
      <div className="mx-auto max-w-2xl">
        {letter.musicUrl ? (
          <PrivateMusic
            key={letter.musicUrl}
            url={letter.musicUrl}
            title={letter.musicTitle ?? ""}
          />
        ) : null}

        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{letter.title}</h1>
        {media.length > 0 ? (
          <p className="mt-3 font-serif italic text-muted-foreground">
            Read first. The {keepsakeHint(hasImage, hasVideo)} wait underneath.
          </p>
        ) : null}

        <LetterPaper body={letter.body} />
      </div>
      {media.length > 0 ? <LetterKeepsakes items={media} /> : null}
    </article>
  );
}

function keepsakeHint(hasImage: boolean, hasVideo: boolean) {
  if (hasImage && hasVideo) return "pictures and clips";
  if (hasVideo) return "videos";
  return "pictures";
}

function LetterPaper({ body }: { body: string }) {
  const paragraphs = splitLetterParagraphs(body);

  return (
    <div className="relative mt-8 overflow-hidden border border-marigold/40 bg-card px-6 py-10 shadow-soft sm:px-12 sm:py-14">
      <span
        className="pointer-events-none absolute inset-y-0 left-9 hidden w-px bg-marigold/35 sm:block"
        aria-hidden
      />
      <div className="space-y-6 font-serif text-lg leading-[1.85] text-foreground/90 sm:pl-6">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 24)}`}
            className={
              index === 0
                ? "whitespace-pre-wrap first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-sea"
                : "whitespace-pre-wrap"
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function LetterKeepsakes({ items }: { items: LetterImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const opened = active !== null ? items[active] : null;
  const openedIsVideo = opened ? isLetterVideo(opened) : false;

  return (
    <section className="mt-16">
      <div className="border-t border-marigold/40 pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">Kept with this letter</p>
        <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">For you</h2>
        <p className="mt-2 max-w-md font-serif italic text-muted-foreground">
          An album after the words — tap a photo to look closer, or a clip to play.
        </p>
      </div>

      <ul className="mt-10 grid gap-8 px-2 sm:grid-cols-2 sm:px-4">
        {items.map((item, index) => {
          const video = isLetterVideo(item);
          const poster = video ? letterVideoPoster(item.imageUrl) : null;
          return (
            <li key={item._id} className="flex justify-center">
              <button
                type="button"
                onClick={() => setActive(index)}
                className={`w-full max-w-sm origin-center bg-card p-3 pb-10 text-left shadow-lift transition-transform duration-500 hover:z-10 hover:rotate-0 ${polaroidTilts[index % polaroidTilts.length]}`}
              >
                <span className="relative block overflow-hidden">
                  {video && !poster ? (
                    <video
                      src={item.imageUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <img
                      src={poster || item.imageUrl}
                      alt={item.caption || (video ? `Video ${index + 1}` : `Photograph ${index + 1}`)}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  )}
                  {video ? (
                    <span className="absolute inset-0 grid place-items-center bg-ink/25">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-card/90 text-foreground">
                        <Play className="h-5 w-5 translate-x-0.5" aria-hidden />
                      </span>
                    </span>
                  ) : null}
                </span>
                {item.caption ? (
                  <span className="mt-3 block text-center font-serif text-sm italic text-muted-foreground">
                    {item.caption}
                  </span>
                ) : (
                  <span className="mt-3 block text-center font-serif text-sm italic text-muted-foreground/70">
                    {video ? "Video" : "Photo"} · {index + 1} of {items.length}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl border-marigold/40 bg-card p-3 sm:p-4">
          <DialogTitle className="sr-only">
            {opened?.caption || (openedIsVideo ? "Video" : "Photograph")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {openedIsVideo
              ? "A video kept with the letter."
              : "A larger view of a photo kept with the letter."}
          </DialogDescription>
          {opened ? (
            <figure>
              {openedIsVideo ? (
                <LetterVideoPlayer item={opened} />
              ) : (
                <img
                  src={opened.imageUrl}
                  alt={opened.caption || ""}
                  className="max-h-[75vh] w-full object-contain"
                />
              )}
              {opened.caption ? (
                <figcaption className="mt-3 text-center font-serif italic text-muted-foreground">
                  {opened.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function LetterVideoPlayer({ item }: { item: LetterImage }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const youtubeId = youtubeVideoId(item.imageUrl);
  if (youtubeId && origin) {
    return (
      <iframe
        title={item.caption || "Video"}
        src={youtubeEmbedSrc(youtubeId, origin, {
          autoplay: true,
          mute: false,
          controls: true,
          loop: false,
        })}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full"
      />
    );
  }

  const driveId = driveFileId(item.imageUrl);
  if (driveId) {
    return (
      <iframe
        title={item.caption || "Video"}
        src={drivePreviewSrc(driveId)}
        allow="autoplay"
        allowFullScreen
        className="aspect-video w-full"
      />
    );
  }

  return (
    <video
      src={item.imageUrl}
      controls
      autoPlay
      playsInline
      className="max-h-[75vh] w-full bg-ink"
    />
  );
}
