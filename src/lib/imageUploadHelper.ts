import { fileToOptimizedDataUrl } from "./imageUtils";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image (File or base64 data URL) to Supabase Storage via /api/upload.
 * Returns the permanent public CDN URL from Supabase Storage.
 */
export async function uploadImageToServer(
  fileOrBase64: File | string,
  previousUrl?: string,
  fileName?: string
): Promise<UploadResult> {
  try {
    let base64Data: string;

    if (fileOrBase64 instanceof File) {
      // Compress and optimize image on device before network upload
      base64Data = await fileToOptimizedDataUrl(fileOrBase64, 1200, 1200, 0.85);
    } else {
      base64Data = fileOrBase64;
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: base64Data,
        previousUrl: previousUrl || undefined,
        fileName: fileName || (fileOrBase64 instanceof File ? fileOrBase64.name : undefined)
      })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success || !data?.url) {
      if (base64Data && base64Data.startsWith("data:image/")) {
        return {
          success: true,
          url: base64Data
        };
      }
      return {
        success: false,
        error: data?.error || `Erreur serveur (${response.status}) lors du téléversement.`
      };
    }

    return {
      success: true,
      url: data.url
    };
  } catch (err: any) {
    console.error("Erreur uploadImageToServer:", err);
    try {
      if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:image/")) {
        return { success: true, url: fileOrBase64 };
      }
      if (fileOrBase64 instanceof File) {
        const fallbackBase64 = await fileToOptimizedDataUrl(fileOrBase64, 1200, 1200, 0.85);
        return { success: true, url: fallbackBase64 };
      }
    } catch {}
    return {
      success: false,
      error: err.message || "Erreur de connexion lors du téléversement de l'image."
    };
  }
}
