import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { getPhotos, photoQueryKey, type Photo } from "@/lib/api";
import { timelinePlaceholders } from "./data";
import { Reveal } from "./Reveal";

type GalleryItem = {
  id: string;
  image: string;
  date: string;
  title: string;
  caption: string;
};

function formatPhotoDate(value: string) {
  try {
    return format(new Date(value), "MMMM yyyy");
  } catch {
    return "";
  }
}

function mapPhotoToItem(photo: Photo): GalleryItem {
  const caption = photo.caption?.trim() || "A moment worth keeping.";
  return {
    id: photo._id,
    image: photo.imageUrl,
    date: photo.createdAt ? formatPhotoDate(photo.createdAt) : "",
    title: caption,
    caption: "",
  };
}

export function PhotoTimeline({ initialPhotos }: { initialPhotos: Photo[] }) {
  const { data: photos = initialPhotos } = useQuery({
    queryKey: [...photoQueryKey, "timeline"] as const,
    queryFn: () => getPhotos("timeline"),
    initialData: initialPhotos.filter((p) => (p.kind ?? "timeline") === "timeline"),
    retry: 1,
  });

  const items: GalleryItem[] =
    photos.length > 0
      ? photos.map(mapPhotoToItem)
      : timelinePlaceholders.map((m, index) => ({
          id: `placeholder-${index}`,
          image: m.image,
          date: m.date,
          title: m.title,
          caption: m.caption,
        }));

  return (
    <section id="timeline" className="px-5 pt-8 pb-24 sm:pt-10 sm:pb-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">Picture timeline</p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Frames of her becoming
            </h2>
            <p className="mt-4 font-serif text-lg italic text-muted-foreground">
            A timeline of favorite memories and unforgettable chapters
            </p>
          </div>
        </Reveal>

        <div className="relative mt-16">
          <span
            className="absolute left-[11px] top-2 hidden h-[calc(100%-1rem)] w-px bg-border sm:block"
            aria-hidden
          />
          <ul className="space-y-16">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={Math.min(i, 6) * 60}>
                <li className="grid gap-6 sm:grid-cols-[24px_minmax(0,1fr)] sm:gap-10">
                  <div className="hidden pt-2 sm:block">
                    <span className="block h-3 w-3 rounded-full bg-marigold ring-4 ring-background" />
                  </div>
                  <figure className="min-w-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="mx-auto block h-auto max-h-[min(85svh,44rem)] w-auto max-w-full"
                    />
                    <figcaption className="mt-5 max-w-xl">
                      <p className="text-xs font-medium uppercase tracking-[0.25em] text-sea">
                        {item.date || `Moment ${i + 1}`}
                      </p>
                      <p className="mt-2 text-balance font-display text-2xl font-semibold leading-snug">
                        {item.title}
                      </p>
                      {item.caption && item.caption !== item.title ? (
                        <p className="mt-2 font-serif text-muted-foreground">{item.caption}</p>
                      ) : null}
                    </figcaption>
                  </figure>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
