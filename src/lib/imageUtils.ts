/**
 * Utility to process, compress and convert local image files (from camera or file picker)
 * into lightweight, high-quality base64 Data URLs so no external image hosting is needed.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer webp, fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL("image/webp", quality);
          if (dataUrl && dataUrl.startsWith("data:image/webp")) {
            resolve(dataUrl);
            return;
          }
        } catch (e) {}

        const fallbackDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(fallbackDataUrl);
      };
      img.onerror = () => {
        // In case image format cannot be drawn on canvas, return raw base64
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
