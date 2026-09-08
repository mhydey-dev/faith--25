export function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return fromQuery;
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (
        (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") &&
        parts[1]
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedSrc(
  videoId: string,
  origin: string,
  options?: { autoplay?: boolean; mute?: boolean; controls?: boolean; loop?: boolean },
): string {
  const loop = options?.loop !== false;
  const params = new URLSearchParams({
    autoplay: options?.autoplay === false ? "0" : "1",
    mute: options?.mute === false ? "0" : "1",
    enablejsapi: "1",
    controls: options?.controls ? "1" : "0",
    rel: "0",
    playsinline: "1",
    origin,
  });
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function playableAudioUrl(url: string): string {
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    const drive = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (drive?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${drive[1]}`;
    }

    if (host === "dropbox.com" || host === "dl.dropboxusercontent.com") {
      parsed.hostname = "dl.dropboxusercontent.com";
      parsed.searchParams.set("dl", "1");
      parsed.searchParams.delete("raw");
      return parsed.toString();
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

export function isDirectAudioLink(url: string): boolean {
  if (youtubeVideoId(url)) return false;
  try {
    const path = new URL(url.trim()).pathname.toLowerCase();
    return /\.(mp3|m4a|aac|ogg|wav|flac|webm)(\?.*)?$/.test(path);
  } catch {
    return false;
  }
}
