export interface VideoStyleItem {
  num: string;
  slug: string;
  en: string;
  th: string;
  cat: string;
  suit: string;
  pen: string;
  pth: string;
}

export const VIDEO_STYLES_CATEGORIES = [
  "การ์ตูน",
  "เกม",
  "งานพิมพ์/กระดาษ",
  "UI/เทคโนโลยี",
  "ไทย",
  "มินิมอล"
] as const;

export const VIDEO_STYLES_MEDIA_BASE = 'https://ii23-gallery.pages.dev/assets/styles';

export function getVideoStyleImageUrl(slug: string): string {
  return `${VIDEO_STYLES_MEDIA_BASE}/p/${slug}.jpg`;
}

export function getVideoStyleVideoUrl(slug: string): string {
  return `${VIDEO_STYLES_MEDIA_BASE}/v/${slug}.mp4`;
}
