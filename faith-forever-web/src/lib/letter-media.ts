import { youtubeVideoId } from "./music";

export function driveFileId(url: string): string | null {
  const match = url.trim().match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return match?.[1] ?? null;
}

export function drivePreviewSrc(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function isDirectVideoLink(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const path = parsed.pathname.toLowerCase();
    if (/\.(mp4|webm|mov|m4v)$/i.test(path)) return true;
    return parsed.hostname.includes("res.cloudinary.com") && path.includes("/video/upload/");
  } catch {
    return false;
  }
}

export function isLetterVideo(item: { imageUrl: string; kind?: "image" | "video" }): boolean {
  if (item.kind === "video") return true;
  if (item.kind === "image") return false;
  const url = item.imageUrl;
  return Boolean(youtubeVideoId(url) || driveFileId(url) || isDirectVideoLink(url));
}

export function letterVideoPoster(url: string): string | null {
  const youtubeId = youtubeVideoId(url);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  if (url.includes("/video/upload/")) {
    return url.replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, ".jpg");
  }
  return null;
}
