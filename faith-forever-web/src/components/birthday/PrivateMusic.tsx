import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { playableAudioUrl, youtubeEmbedSrc, youtubeVideoId } from "@/lib/music";

const PLAY_FOR_MS = 40 * 60 * 1000;

function sendYoutubeCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: unknown[] = [],
) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*",
  );
}

export function PrivateMusic({
  url,
  title,
}: {
  url: string;
  title?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playStartedAt = useRef<number | null>(null);
  const playedMs = useRef(0);
  const stopTimer = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [origin, setOrigin] = useState("");

  const videoId = useMemo(() => (url ? youtubeVideoId(url) : null), [url]);
  const audioSrc = useMemo(() => {
    if (!url || videoId) return "";
    return playableAudioUrl(url);
  }, [url, videoId]);

  const clearStopTimer = () => {
    if (stopTimer.current == null) return;
    window.clearTimeout(stopTimer.current);
    stopTimer.current = null;
  };

  const haltPlayback = () => {
    clearStopTimer();
    playStartedAt.current = null;
    playedMs.current = PLAY_FOR_MS;
    setPlaying(false);
    sendYoutubeCommand(iframeRef.current, "pauseVideo");
    audioRef.current?.pause();
  };

  const beginPlaying = () => {
    if (playedMs.current >= PLAY_FOR_MS) {
      playedMs.current = 0;
    }
    if (playStartedAt.current == null) {
      playStartedAt.current = Date.now();
    }
    setPlaying(true);
  };

  const pausePlaying = () => {
    if (playStartedAt.current != null) {
      playedMs.current += Date.now() - playStartedAt.current;
      playStartedAt.current = null;
    }
    setPlaying(false);
  };

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    clearStopTimer();
    if (!playing) return;
    const remaining = PLAY_FOR_MS - playedMs.current;
    if (remaining <= 0) {
      haltPlayback();
      return;
    }
    stopTimer.current = window.setTimeout(() => {
      haltPlayback();
    }, remaining);
    return clearStopTimer;
    // haltPlayback closes over the latest refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    if (!audioSrc) return;
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => beginPlaying();
    const onPause = () => pausePlaying();
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    void audio.play().catch(() => {
      /* browsers may block until she taps Play */
    });

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

  const startYoutube = () => {
    const iframe = iframeRef.current;
    iframe?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1 }),
      "*",
    );
    sendYoutubeCommand(iframe, "unMute");
    sendYoutubeCommand(iframe, "playVideo");
    beginPlaying();
  };

  useEffect(() => {
    if (!videoId) return;
    const t1 = window.setTimeout(startYoutube, 250);
    const t2 = window.setTimeout(startYoutube, 800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // startYoutube reads the iframe ref after it mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, origin]);

  const toggle = async () => {
    if (videoId) {
      if (playing) {
        sendYoutubeCommand(iframeRef.current, "pauseVideo");
        pausePlaying();
      } else {
        startYoutube();
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        /* ignore */
      }
    } else {
      audio.pause();
    }
  };

  const restart = async () => {
    clearStopTimer();
    playedMs.current = 0;
    playStartedAt.current = Date.now();
    if (videoId) {
      sendYoutubeCommand(iframeRef.current, "seekTo", [0, true]);
      sendYoutubeCommand(iframeRef.current, "unMute");
      sendYoutubeCommand(iframeRef.current, "playVideo");
      setPlaying(true);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    try {
      await audio.play();
    } catch {
      /* ignore */
    }
  };

  if (!url) return null;

  const embedSrc =
    videoId && origin ? youtubeEmbedSrc(videoId, origin, { autoplay: true, mute: true }) : "";

  return (
    <div className="mb-10 flex items-center justify-between gap-4 border border-marigold/50 px-4 py-3">
      {embedSrc ? (
        <iframe
          ref={iframeRef}
          title={title || "Private song"}
          src={embedSrc}
          allow="autoplay; encrypted-media"
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      ) : null}
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sea">
          A special song for you my love ❤️💕
        </p>
        {/* <p className="truncate font-serif text-base italic text-foreground/80">
          {title ? `${title} — while you read` : "A song while you read"}
        </p> */}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={restart}
          aria-label="Restart song"
          title="Restart song"
          className="flex h-10 w-10 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause song" : "Play song"}
          title={playing ? "Pause" : "Play"}
          className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
