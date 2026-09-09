import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { Nav } from "@/components/birthday/Nav";
import { Hero } from "@/components/birthday/Hero";
import { Personality } from "@/components/birthday/Personality";
import { PortraitStory } from "@/components/birthday/PortraitStory";
import { PhotoTimeline } from "@/components/birthday/PhotoTimeline";
import { TwentyFiveStats } from "@/components/birthday/TwentyFiveStats";
import { KnowHerQuiz } from "@/components/birthday/KnowHerQuiz";
import { WishWall } from "@/components/birthday/WishWall";
import { Footer } from "@/components/birthday/Footer";
import { useConfetti } from "@/components/birthday/effects";
import {
  getMessages,
  getPhotos,
  getSite,
  messageQueryKey,
  photoQueryKey,
  siteQueryKey,
  type BirthdayMessage,
  type Photo,
  type PublicSite,
} from "@/lib/api";

const emptySite: PublicSite = {
  quiz: [],
  hasLoveLetter: false,
  loveLetterTitle: "Only for you ifemi ❤️💕",
};

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [photos, messages, site] = await Promise.all([
      getPhotos().catch((): Photo[] => []),
      getMessages().catch((): BirthdayMessage[] => []),
      getSite().catch((): PublicSite => emptySite),
    ]);

    context.queryClient.setQueryData(photoQueryKey, photos);
    context.queryClient.setQueryData(messageQueryKey, messages);
    context.queryClient.setQueryData(siteQueryKey, site);

    return { photos, messages, site };
  },
  head: () => ({
    meta: [
      { title: "25 Years of Faith" },
      {
        name: "description",
        content:
          "A birthday site for Faith turning 25: her personality, portrait story, photo timeline, quarter-century stats, a quiz about her, and a wall of birthday wishes.",
      },
      { property: "og:title", content: "25 Years of Faith" },
      {
        property: "og:description",
        content: "The Story • The Journey • The Trivia • The Words",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { photos, messages, site } = Route.useLoaderData();
  const { fire, overlay } = useConfetti();
  const celebrate = useCallback(() => fire(160), [fire]);

  return (
    <main className="relative overflow-x-hidden">
      {overlay}
      <Nav />
      <Hero />
      <Personality />
      <PortraitStory initialPhotos={photos} />
      <PhotoTimeline initialPhotos={photos} />
      <TwentyFiveStats />
      <KnowHerQuiz questions={site.quiz} />
      <WishWall initialMessages={messages} />
      <Footer onSecret={celebrate} />
    </main>
  );
}
