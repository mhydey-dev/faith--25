const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.86;

export async function compressImageFile(file: File): Promise<File> {
  if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) {
    return file;
  }

  try {
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(file);
    }

    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) return file;

    const tooBig = file.size > 8 * 1024 * 1024;
    if (blob.size >= file.size && !tooBig) {
      return file;
    }

    const ready =
      blob.size > 8 * 1024 * 1024
        ? await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", 0.72);
          })
        : blob;
    if (!ready) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([ready], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
