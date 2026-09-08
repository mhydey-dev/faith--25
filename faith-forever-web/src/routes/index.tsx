import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { Nav } from "@/components/birthday/Nav";
import { Hero } from "@/components/birthday/Hero";
import { TogetherTicker } from "@/components/birthday/TogetherTicker";
import { CandleCake } from "@/components/birthday/CandleCake";
import { LoveLetter } from "@/components/birthday/LoveLetter";
import { Reasons } from "@/components/birthday/Reasons";
import { MemoryLane } from "@/components/birthday/MemoryLane";
import { OpenWhen } from "@/components/birthday/OpenWhen";
import { Playlist } from "@/components/birthday/Playlist";
import { WishList } from "@/components/birthday/WishList";
import { Footer } from "@/components/birthday/Footer";
import { useConfetti } from "@/components/birthday/effects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, Faith Funmilayo — A Digital Love Letter" },
      {
        name: "description",
        content:
          "A warm, interactive birthday letter for Faith Funmilayo: blow out the candles, read the letter, wander memory lane, and plan our year ahead.",
      },
      { property: "og:title", content: "Happy Birthday, Faith Funmilayo ❤️" },
      {
        property: "og:description",
        content: "A digital love letter for my favorite person — open the envelope.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { fire, overlay } = useConfetti();
  const celebrate = useCallback(() => fire(120), [fire]);

  return (
    <main className="relative overflow-x-hidden">
      {overlay}
      <Nav />
      <Hero />
      <TogetherTicker />
      <CandleCake onAllOut={celebrate} />
      <LoveLetter />
      <Reasons />
      <MemoryLane />
      <OpenWhen />
      <Playlist />
      <WishList />
      <Footer onSecret={() => fire(180)} />
    </main>
  );
}
