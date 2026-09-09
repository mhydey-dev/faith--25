import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  ADMIN_KEY_STORAGE,
  addLetterVideoLink,
  adminLogin,
  deleteLetterImage,
  deleteMusic,
  deletePhoto,
  getAdminSite,
  getPhotos,
  saveAdminSite,
  uploadLetterImage,
  uploadPhoto,
  type AdminSite,
  type LetterImage,
  type Photo,
  type QuizQuestion,
} from "@/lib/api";
import { isLetterVideo, letterVideoPoster } from "@/lib/letter-media";
import { playableAudioUrl, youtubeVideoId } from "@/lib/music";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [{ title: "Studio — Faith at 25" }],
  }),
  component: StudioPage,
});

function emptyQuestion(index: number): QuizQuestion {
  return {
    id: `q${index + 1}`,
    prompt: "",
    options: [
      { label: "", correct: true },
      { label: "", correct: false },
      { label: "", correct: false },
    ],
  };
}

function StudioPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loveLetterTitle, setLoveLetterTitle] = useState("Only for you ifemi ❤️💕");
  const [loveLetterBody, setLoveLetterBody] = useState("");
  const [letterPassword, setLetterPassword] = useState("");
  const [showLetterPassword, setShowLetterPassword] = useState(false);
  const [hasLetterPassword, setHasLetterPassword] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [letterImages, setLetterImages] = useState<LetterImage[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadingLetter, setUploadingLetter] = useState(false);

  const portrait = useMemo(
    () => photos.find((p) => p.kind === "portrait"),
    [photos],
  );
  const timeline = useMemo(
    () => photos.filter((p) => (p.kind ?? "timeline") === "timeline"),
    [photos],
  );

  const applySite = (site: AdminSite) => {
    setQuiz(site.quiz.length ? site.quiz : [emptyQuestion(0)]);
    setLoveLetterTitle(site.loveLetterTitle || "Only for you ifemi ❤️💕");
    setLoveLetterBody(site.loveLetterBody || "");
    setHasLetterPassword(site.hasLetterPassword);
    setMusicUrl(site.musicUrl || "");
    setMusicTitle(site.musicTitle || "");
    setLetterImages(site.loveLetterImages || []);
  };

  const loadAll = async (key: string) => {
    const [site, nextPhotos] = await Promise.all([
      getAdminSite(key),
      getPhotos(),
    ]);
    applySite(site);
    setPhotos(nextPhotos);
  };

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_KEY_STORAGE) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setAdminKey(stored);
    void adminLogin(stored)
      .then(async () => {
        await loadAll(stored);
        setAuthed(true);
      })
      .catch(() => {
        sessionStorage.removeItem(ADMIN_KEY_STORAGE);
      })
      .finally(() => setLoading(false));
  }, []);

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    setLoading(true);
    try {
      await adminLogin(key);
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
      setAdminKey(key);
      await loadAll(key);
      setAuthed(true);
      toast.success("Studio unlocked.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setAuthed(false);
    setAdminKey("");
    setKeyInput("");
  };

  const onSaveContent = async () => {
    setSaving(true);
    try {
      const cleaned = quiz
        .map((q, index) => ({
          id: q.id.trim() || `q${index + 1}`,
          prompt: q.prompt.trim(),
          options: q.options
            .map((o) => ({ label: o.label.trim(), correct: o.correct }))
            .filter((o) => o.label),
        }))
        .filter((q) => q.prompt && q.options.length >= 2);

      for (const q of cleaned) {
        if (!q.options.some((o) => o.correct)) {
          throw new Error(`Mark one correct answer for: “${q.prompt}”`);
        }
      }

      if (loveLetterBody.trim() && !letterPassword.trim() && !hasLetterPassword) {
        throw new Error("Set an unlock password so Faith can open the hidden letter from the menu.");
      }

      const site = await saveAdminSite(adminKey, {
        quiz: cleaned,
        loveLetterTitle,
        loveLetterBody,
        musicTitle,
        musicUrl,
        ...(letterPassword.trim() ? { letterPassword: letterPassword.trim() } : {}),
      });
      applySite(site);
      setLetterPassword("");
      toast.success("Saved quiz, letter, and music.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const onSaveMusic = async () => {
    setSaving(true);
    try {
      const site = await saveAdminSite(adminKey, {
        musicUrl: musicUrl.trim(),
        musicTitle,
      });
      applySite(site);
      toast.success(
        site.musicUrl
          ? "Music link saved — it plays only after she unlocks the letter."
          : "Music link cleared.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save music.");
    } finally {
      setSaving(false);
    }
  };

  const onRemoveMusic = async () => {
    try {
      const site = await deleteMusic(adminKey);
      applySite(site);
      toast.success("Music removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove music.");
    }
  };

  const onLetterImages = async (files: File[], at?: number) => {
    if (!files.length) return;
    setUploadingLetter(true);
    try {
      let site: AdminSite | null = null;
      if (typeof at === "number" && files[0]) {
        site = await uploadLetterImage({ file: files[0], at, adminKey });
      } else {
        for (const file of files) {
          site = await uploadLetterImage({ file, adminKey });
        }
      }
      if (site) applySite(site);
      const allVideo = files.every((file) => file.type.startsWith("video"));
      toast.success(
        files.length > 1
          ? `${files.length} files added to the letter album.`
          : typeof at === "number"
            ? allVideo
              ? "Video replaced."
              : "Photo replaced."
            : allVideo
              ? "Video added to the letter album."
              : "Photo added to the letter album.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploadingLetter(false);
    }
  };

  const onLetterVideoLink = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setUploadingLetter(true);
    try {
      const site = await addLetterVideoLink({ url: trimmed, adminKey });
      applySite(site);
      toast.success("Video link added to the letter album.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add that video link.");
    } finally {
      setUploadingLetter(false);
    }
  };

  const onDeleteLetterImage = async (id: string) => {
    try {
      const site = await deleteLetterImage(id, adminKey);
      applySite(site);
      toast.success("Removed from the letter album.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    }
  };

  const onPhoto = async (
    file: File | null,
    kind: "portrait" | "timeline",
    caption: string,
  ) => {
    if (!file) return;
    try {
      const photo = await uploadPhoto({ file, kind, caption, adminKey });
      setPhotos((current) => {
        if (kind === "portrait") {
          return [photo, ...current.filter((p) => p.kind !== "portrait")];
        }
        return [photo, ...current];
      });
      toast.success(kind === "portrait" ? "Portrait updated." : "Photo added to timeline.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    }
  };

  const onDeletePhoto = async (id: string) => {
    try {
      await deletePhoto(id, adminKey);
      setPhotos((current) => current.filter((p) => p._id !== id));
      toast.success("Photo deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Opening studio…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <form onSubmit={onLogin} className="w-full max-w-md space-y-5 border border-border p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-sea">Private</p>
            <h1 className="mt-3 font-display text-3xl font-semibold">Studio</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your admin key (from Backend <code className="text-foreground">ADMIN_KEY</code>) to
              manage photos, quiz, music, and the locked letter.
            </p>
          </div>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              className="h-11 w-full border border-input bg-background px-4 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? "Hide admin key" : "Show admin key"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-primary py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground"
          >
            Unlock studio
          </button>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-sea">You only</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload everything yourself. Guests can only leave wishes and take the quiz.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            className="border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-primary"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-destructive"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-16">
        {/* Music */}
        <section className="space-y-4 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-semibold">Private letter song</h2>
          <p className="text-sm text-muted-foreground">
            Paste a YouTube link or a direct audio link (mp3, Dropbox, Google Drive). Other visitors
            never hear it — it only plays after Faith unlocks the private letter.
          </p>
          {musicUrl.trim() ? (
            youtubeVideoId(musicUrl) ? (
              <p className="text-sm text-muted-foreground">
                YouTube link ready{musicTitle ? ` — ${musicTitle}` : ""}.
              </p>
            ) : (
              <div className="space-y-3">
                <audio controls src={playableAudioUrl(musicUrl)} className="w-full" />
                <p className="text-sm text-muted-foreground">{musicTitle || "Untitled track"}</p>
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground">No music link yet.</p>
          )}
          <input
            value={musicTitle}
            onChange={(e) => setMusicTitle(e.target.value)}
            placeholder="Song title (optional)"
            className="h-11 w-full border border-input bg-background px-4"
          />
          <input
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
            placeholder="https://youtu.be/… or https://…/song.mp3"
            inputMode="url"
            autoComplete="off"
            className="h-11 w-full border border-input bg-background px-4"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void onSaveMusic()}
              className="bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save music link"}
            </button>
            {musicUrl ? (
              <button
                type="button"
                onClick={() => void onRemoveMusic()}
                className="border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
              >
                Remove
              </button>
            ) : null}
          </div>
        </section>

        {/* Portrait */}
        <section className="space-y-4 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-semibold">Celebrant portrait</h2>
          {portrait ? (
            <div className="space-y-3">
              <img src={portrait.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
              <button
                type="button"
                onClick={() => void onDeletePhoto(portrait._id)}
                className="text-xs uppercase tracking-wider text-destructive"
              >
                Remove portrait
              </button>
            </div>
          ) : null}
          <PortraitUpload
            onUpload={(file, caption) => void onPhoto(file, "portrait", caption)}
          />
        </section>

        {/* Timeline */}
        <section className="space-y-4 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-semibold">Picture timeline</h2>
          <ul className="space-y-4">
            {timeline.map((photo) => (
              <li key={photo._id} className="flex gap-4 border border-border p-3">
                <img src={photo.imageUrl} alt="" className="h-20 w-28 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{photo.caption || "No caption"}</p>
                  <button
                    type="button"
                    onClick={() => void onDeletePhoto(photo._id)}
                    className="mt-2 text-xs uppercase tracking-wider text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <TimelineUpload
            onUpload={(file, caption) => void onPhoto(file, "timeline", caption)}
          />
        </section>

        {/* Quiz */}
        <section className="space-y-6 border-t border-border pt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">Quiz questions</h2>
            <button
              type="button"
              onClick={() => setQuiz((q) => [...q, emptyQuestion(q.length)])}
              className="border border-border px-3 py-2 text-xs uppercase tracking-wider"
            >
              Add question
            </button>
          </div>
          {quiz.map((question, qi) => (
            <div key={question.id + qi} className="space-y-3 border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Question {qi + 1}
                </p>
                <button
                  type="button"
                  onClick={() => setQuiz((all) => all.filter((_, i) => i !== qi))}
                  className="text-xs uppercase tracking-wider text-destructive"
                >
                  Remove
                </button>
              </div>
              <input
                value={question.prompt}
                onChange={(e) =>
                  setQuiz((all) =>
                    all.map((q, i) => (i === qi ? { ...q, prompt: e.target.value } : q)),
                  )
                }
                placeholder="Question prompt"
                className="h-11 w-full border border-input bg-background px-4"
              />
              {question.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={opt.correct}
                      onChange={() =>
                        setQuiz((all) =>
                          all.map((q, i) =>
                            i === qi
                              ? {
                                  ...q,
                                  options: q.options.map((o, j) => ({
                                    ...o,
                                    correct: j === oi,
                                  })),
                                }
                              : q,
                          ),
                        )
                      }
                    />
                    Right
                  </label>
                  <input
                    value={opt.label}
                    onChange={(e) =>
                      setQuiz((all) =>
                        all.map((q, i) =>
                          i === qi
                            ? {
                                ...q,
                                options: q.options.map((o, j) =>
                                  j === oi ? { ...o, label: e.target.value } : o,
                                ),
                              }
                            : q,
                        ),
                      )
                    }
                    placeholder={`Answer ${String.fromCharCode(65 + oi)}`}
                    className="h-10 flex-1 border border-input bg-background px-3"
                  />
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* Love letter */}
        <section className="space-y-4 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-semibold">Locked love letter</h2>
          <p className="text-sm text-muted-foreground">
            Faith opens this from the public site — tap <strong>Private</strong> in the menu, enter
            the unlock password, and she is taken to a hidden page. Save both the letter and an
            unlock password, or she cannot open it.
          </p>
          <input
            value={loveLetterTitle}
            onChange={(e) => setLoveLetterTitle(e.target.value)}
            placeholder="Letter title"
            className="h-11 w-full border border-input bg-background px-4"
          />
          <textarea
            value={loveLetterBody}
            onChange={(e) => setLoveLetterBody(e.target.value)}
            rows={10}
            placeholder="Write the letter only she should read…"
            className="w-full border border-input bg-background px-4 py-3 font-serif text-lg leading-relaxed"
          />
          <div className="relative">
            <input
              type={showLetterPassword ? "text" : "password"}
              value={letterPassword}
              onChange={(e) => setLetterPassword(e.target.value)}
              placeholder={
                hasLetterPassword
                  ? "New unlock password (leave blank to keep current)"
                  : "Set unlock password for Faith"
              }
              className="h-11 w-full border border-input bg-background px-4 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowLetterPassword((v) => !v)}
              aria-label={showLetterPassword ? "Hide unlock password" : "Show unlock password"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showLetterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {hasLetterPassword ? (
            <p className="text-xs text-muted-foreground">A password is already set.</p>
          ) : null}

          <div className="space-y-3 pt-4">
            <h3 className="font-display text-lg font-semibold">Pictures & videos with the letter</h3>
            <p className="text-sm text-muted-foreground">
              These sit in a keepsake album after she finishes reading. Short clips can be uploaded
              (about 40MB). Longer memories work better as a YouTube or Google Drive link.
            </p>
            {letterImages.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {letterImages.map((image, index) => (
                  <li key={image._id} className="space-y-3 border border-border p-3">
                    <StudioMediaPreview item={image} />
                    <div className="flex flex-wrap gap-3">
                      <label className="inline-flex cursor-pointer bg-primary px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-primary-foreground">
                        Replace
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/webm,video/quicktime"
                          className="sr-only"
                          disabled={uploadingLetter}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            void onLetterImages([file], index);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void onDeleteLetterImage(image._id)}
                        className="text-[10px] uppercase tracking-wider text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing yet. Add photos, upload a short video, or paste a link.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <LetterImageUpload
                disabled={uploadingLetter}
                onUpload={(files) => void onLetterImages(files)}
              />
            </div>
            <LetterVideoLinkForm
              disabled={uploadingLetter}
              onAdd={(url) => void onLetterVideoLink(url)}
            />
          </div>
        </section>

        <button
          type="button"
          disabled={saving}
          onClick={() => void onSaveContent()}
          className="w-full bg-accent py-4 text-xs font-medium uppercase tracking-[0.22em] text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save quiz & letter"}
        </button>
      </div>
    </div>
  );
}

function LetterImageUpload({
  onUpload,
  disabled,
}: {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      {disabled ? "Uploading…" : "Add photos or videos"}
      <input
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onUpload(files);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function LetterVideoLinkForm({
  onAdd,
  disabled,
}: {
  onAdd: (url: string) => void;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState("");
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        const next = url.trim();
        if (!next) return;
        onAdd(next);
        setUrl("");
      }}
    >
      <input
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="YouTube, Drive, or .mp4 link"
        disabled={disabled}
        className="h-11 flex-1 border border-input bg-background px-4"
      />
      <button
        type="submit"
        disabled={disabled || !url.trim()}
        className="h-11 border border-primary px-5 text-xs font-medium uppercase tracking-[0.18em] text-primary disabled:opacity-60"
      >
        Add video link
      </button>
    </form>
  );
}

function StudioMediaPreview({ item }: { item: LetterImage }) {
  const video = isLetterVideo(item);
  const poster = video ? letterVideoPoster(item.imageUrl) : null;
  return (
    <div className="relative overflow-hidden">
      {video && !poster ? (
        <video src={item.imageUrl} muted playsInline className="aspect-[4/5] w-full object-cover" />
      ) : (
        <img src={poster || item.imageUrl} alt="" className="aspect-[4/5] w-full object-cover" />
      )}
      {video ? (
        <p className="absolute left-2 top-2 bg-card/90 px-2 py-1 text-[10px] uppercase tracking-wider">
          Video
        </p>
      ) : null}
    </div>
  );
}

function PortraitUpload({
  onUpload,
}: {
  onUpload: (file: File, caption: string) => void;
}) {
  const [caption, setCaption] = useState("");
  return (
    <div className="space-y-3">
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Optional caption under the portrait"
        className="h-11 w-full border border-input bg-background px-4"
      />
      <label className="inline-flex cursor-pointer bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground">
        Upload portrait
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file, caption.trim());
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function TimelineUpload({
  onUpload,
}: {
  onUpload: (file: File, caption: string) => void;
}) {
  const [caption, setCaption] = useState("");
  return (
    <div className="space-y-3">
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption / short story for this frame"
        className="h-11 w-full border border-input bg-background px-4"
      />
      <label className="inline-flex cursor-pointer border border-primary px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        Add timeline photo
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file, caption.trim());
              setCaption("");
            }
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
