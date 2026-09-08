import { useQuery } from "@tanstack/react-query";

import memory1 from "@/assets/memory-1.jpg";
import { getPhotos, photoQueryKey, type Photo } from "@/lib/api";
import { portraitStory } from "./data";
import { Reveal } from "./Reveal";

export function PortraitStory({ initialPhotos }: { initialPhotos: Photo[] }) {
  const { data: photos = initialPhotos } = useQuery({
    queryKey: [...photoQueryKey, "portrait"] as const,
    queryFn: () => getPhotos("portrait"),
    initialData: initialPhotos.filter((p) => p.kind === "portrait"),
    retry: 1,
  });

  const featured = photos[0];
  const imageSrc = featured?.imageUrl || memory1;

  return (
    <section id="portrait" className="px-5 pt-24 pb-8 sm:pt-32 sm:pb-10">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">
              {portraitStory.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              {portraitStory.headline}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <figure className="relative mt-14 overflow-hidden">
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10]">
              <img
                src={imageSrc}
                alt="Faith Funmilayo"
                className="h-full w-full object-cover"
                width={1400}
                height={900}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            </div>
            <figcaption className="mt-6 font-serif text-sm italic text-muted-foreground">
              {featured?.caption?.trim()
                ? featured.caption
                : "To know her is to love her—cheers to 25 years of incredible impact"}
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={180}>
          <div className="mx-auto mt-14 max-w-2xl space-y-5 font-serif text-lg leading-relaxed text-foreground/90 sm:text-xl">
            {portraitStory.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
