import rawStyles from '@/data/video-styles-100.json';
import { VideoStyleItem } from './video-styles-types';

export const videoStyles100: VideoStyleItem[] = rawStyles as VideoStyleItem[];

export function filterVideoStyles(
  items: VideoStyleItem[],
  selectedCategory: string | null = null,
  searchQuery: string = ''
): VideoStyleItem[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter(style => {
    // 1. Category filter
    if (selectedCategory) {
      const cats = style.cat.split('/').map(c => c.trim());
      if (!cats.includes(selectedCategory) && style.cat !== selectedCategory) {
        return false;
      }
    }

    // 2. Search query filter
    if (query) {
      const matchNum = style.num.toLowerCase().includes(query);
      const matchEn = style.en.toLowerCase().includes(query);
      const matchTh = style.th.toLowerCase().includes(query);
      const matchCat = style.cat.toLowerCase().includes(query);
      const matchSuit = style.suit.toLowerCase().includes(query);
      const matchPen = style.pen.toLowerCase().includes(query);
      const matchPth = style.pth.toLowerCase().includes(query);

      if (!matchNum && !matchEn && !matchTh && !matchCat && !matchSuit && !matchPen && !matchPth) {
        return false;
      }
    }

    return true;
  });
}
