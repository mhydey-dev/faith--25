function resolveApiBase() {
  const fromEnv = String((import.meta as any).env?.VITE_API_URL ?? "").replace(/\/$/, "");
  if (fromEnv && !fromEnv.startsWith("/")) return fromEnv;
  return "http://127.0.0.1:5000/api";
}

const API_BASE = resolveApiBase();

export type Photo = {
  _id: string;
  imageUrl: string;
  cloudinaryId: string;
  caption: string;
  kind?: "timeline" | "portrait";
  createdAt: string;
  updatedAt: string;
};

export type BirthdayMessage = {
  _id: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type QuizOption = {
  label: string;
  correct: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export type PublicSite = {
  quiz: QuizQuestion[];
  hasLoveLetter: boolean;
  loveLetterTitle: string;
  updatedAt?: string;
};

export type LetterImage = {
  _id: string;
  imageUrl: string;
  caption: string;
  kind?: "image" | "video";
};

export type AdminSite = PublicSite & {
  loveLetterBody: string;
  hasLetterPassword: boolean;
  musicUrl: string;
  musicTitle: string;
  loveLetterImages: LetterImage[];
};

export type UnlockedLetter = {
  title: string;
  body: string;
  musicUrl?: string;
  musicTitle?: string;
  images?: LetterImage[];
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { adminKey?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.adminKey) headers.set("x-admin-key", init.adminKey);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function getPhotos(kind?: "timeline" | "portrait"): Promise<Photo[]> {
  const query = kind ? `?kind=${kind}` : "";
  return request<Photo[]>(`/photos${query}`);
}

export async function getMessages(): Promise<BirthdayMessage[]> {
  return request<BirthdayMessage[]>("/messages");
}

export async function postMessage(input: {
  author: string;
  content: string;
}): Promise<BirthdayMessage> {
  return request<BirthdayMessage>("/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadPhoto(input: {
  file: File;
  caption?: string;
  kind?: "timeline" | "portrait";
  adminKey: string;
}): Promise<Photo> {
  const body = new FormData();
  body.append("image", input.file);
  if (input.caption) body.append("caption", input.caption);
  if (input.kind) body.append("kind", input.kind);

  return request<Photo>("/photos/upload", {
    method: "POST",
    body,
    adminKey: input.adminKey,
  });
}

export async function deletePhoto(id: string, adminKey: string): Promise<void> {
  await request<{ ok: boolean }>(`/photos/${id}`, {
    method: "DELETE",
    adminKey,
  });
}

export async function getSite(): Promise<PublicSite> {
  return request<PublicSite>("/site");
}

export async function unlockLoveLetter(password: string): Promise<UnlockedLetter> {
  return request<UnlockedLetter>("/site/letter/unlock", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function adminLogin(adminKey: string): Promise<void> {
  await request<{ ok: boolean }>("/site/admin/login", {
    method: "POST",
    adminKey,
  });
}

export async function getAdminSite(adminKey: string): Promise<AdminSite> {
  return request<AdminSite>("/site/admin", { adminKey });
}

export async function saveAdminSite(
  adminKey: string,
  input: {
    quiz?: QuizQuestion[];
    loveLetterTitle?: string;
    loveLetterBody?: string;
    letterPassword?: string;
    musicTitle?: string;
    musicUrl?: string;
  },
): Promise<AdminSite> {
  return request<AdminSite>("/site/admin", {
    method: "PUT",
    adminKey,
    body: JSON.stringify(input),
  });
}

export async function deleteMusic(adminKey: string): Promise<AdminSite> {
  return request<AdminSite>("/site/admin/music", {
    method: "DELETE",
    adminKey,
  });
}

export async function uploadLetterImage(input: {
  file: File;
  caption?: string;
  at?: number;
  adminKey: string;
}): Promise<AdminSite> {
  const body = new FormData();
  body.append("image", input.file);
  if (input.caption) body.append("caption", input.caption);
  if (typeof input.at === "number") body.append("at", String(input.at));
  return request<AdminSite>("/site/admin/letter-images", {
    method: "POST",
    body,
    adminKey: input.adminKey,
  });
}

export async function addLetterVideoLink(input: {
  url: string;
  caption?: string;
  at?: number;
  adminKey: string;
}): Promise<AdminSite> {
  return request<AdminSite>("/site/admin/letter-video-link", {
    method: "POST",
    adminKey: input.adminKey,
    body: JSON.stringify({
      url: input.url,
      caption: input.caption || "",
      ...(typeof input.at === "number" ? { at: input.at } : {}),
    }),
  });
}

export async function deleteLetterImage(id: string, adminKey: string): Promise<AdminSite> {
  return request<AdminSite>(`/site/admin/letter-images/${id}`, {
    method: "DELETE",
    adminKey,
  });
}

/** Kept so stale Studio reloads do not crash; music is a pasted link now. */
export async function uploadMusic(_input: {
  file: File;
  title?: string;
  adminKey: string;
}): Promise<AdminSite> {
  throw new ApiError("Music is added by link in Studio now, not by file upload.", 400);
}

export const photoQueryKey = ["photos"] as const;
export const messageQueryKey = ["messages"] as const;
export const siteQueryKey = ["site"] as const;

export const ADMIN_KEY_STORAGE = "faith-25-admin-key";
