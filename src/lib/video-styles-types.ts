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

export interface StudioVideoPromptItem {
  id: string;
  title: string;
  kind: string;
  label: string;
  prompt: string;
  summary: string;
}

export interface StudioVideoItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  desc: string;
  tags: string[];
  poster?: string;
  masterPrompt?: string;
  masterPromptTh?: string;
  items: StudioVideoPromptItem[];
}

export const STUDIO_VIDEO_CATEGORIES = [
  "ก่อสร้าง & รีโนเวทบ้าน",
  "เฟอร์นิเจอร์ & แต่งห้อง",
  "รีวิวสินค้า UGC พูดไทย",
  "พรีเซนต์บ้าน & อสังหาฯ",
  "คลิปไวรัลสายฮา & ละครสั้น"
] as const;

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
