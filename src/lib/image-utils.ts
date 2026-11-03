/**
 * Image Utilities for kevinaiagent.tech
 * Handles Google Drive CDN URL transformations, direct previews, and fallbacks
 */

export const DEFAULT_COURSE_COVER = '/assets/ai-content-workshop.avif';

/**
 * Formats any Google Drive sharing URL into a high-performance direct CDN image URL
 * that bypasses 403 blocks and works with Next.js <Image /> component.
 */
export function formatGoogleDriveImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Return data URLs as-is
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  // Already a direct CDN URL
  if (trimmed.includes('lh3.googleusercontent.com')) {
    return trimmed;
  }

  // Google Drive link with /file/d/FILE_ID
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }

  // Google Drive link with id=FILE_ID (open?id=..., uc?id=..., thumbnail?id=...)
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return trimmed;
}

/**
 * Returns safe image URL with fallback to default course cover
 */
export function getSafeCourseImageUrl(url?: string | null): string {
  const formatted = formatGoogleDriveImageUrl(url);
  return formatted || DEFAULT_COURSE_COVER;
}

/**
 * Compresses an image file in the browser using HTML Canvas.
 * Automatically resizes high-resolution camera/phone photos to max dimensions
 * and compresses to WebP or JPEG. Keeps payload typically under 350KB to prevent
 * Vercel HTTP 413 (Request Entity Too Large).
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<File> {
  // If not in browser or not an image, return file as-is
  if (typeof window === 'undefined' || !file || !file.type.startsWith('image/')) {
    return file;
  }

  // If already under 350KB and a standard web image, no heavy compression needed
  if (file.size <= 350 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp' || file.type === 'image/png')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for photographic images, preserving PNG if transparent
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            if (blob.size < file.size) {
              const ext = outputMime === 'image/jpeg' ? '.jpg' : '.png';
              const cleanName = file.name.replace(/\.[^/.]+$/, ext);
              const compressedFile = new File([blob], cleanName, {
                type: outputMime,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          outputMime,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export interface AttachmentDownloadInfo {
  viewUrl: string;
  downloadUrl: string;
  isDrive: boolean;
  fileId: string | null;
}

/**
 * Resolves attachment URLs into convenient view and download URLs,
 * specifically handling Google Drive sharing links.
 */
export function getAttachmentDownloadInfo(url?: string | null): AttachmentDownloadInfo {
  if (!url) {
    return { viewUrl: '#', downloadUrl: '#', isDrive: false, fileId: null };
  }
  const trimmed = url.trim();

  // Check for Google Drive file ID
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = fileMatch ? fileMatch[1] : (idMatch ? idMatch[1] : null);

  if (fileId) {
    return {
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isDrive: true,
      fileId
    };
  }

  return {
    viewUrl: trimmed,
    downloadUrl: trimmed,
    isDrive: false,
    fileId: null
  };
}
