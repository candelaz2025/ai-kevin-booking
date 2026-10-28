import rawStyles from '@/data/video-styles-100.json';
import rawStudios from '@/data/studio-video-prompts.json';
import { VideoStyleItem, StudioVideoItem } from './video-styles-types';

export const videoStyles100: VideoStyleItem[] = rawStyles as VideoStyleItem[];
export const studioVideoPrompts: StudioVideoItem[] = rawStudios as StudioVideoItem[];

export function filterStudioVideoPrompts(
  items: StudioVideoItem[],
  selectedCategory: string | null = null,
  searchQuery: string = ''
): StudioVideoItem[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter(studio => {
    // 1. Category filter
    if (selectedCategory && studio.category !== selectedCategory) {
      return false;
    }

    // 2. Search query filter
    if (query) {
      const matchName = studio.name.toLowerCase().includes(query);
      const matchSub = studio.subtitle.toLowerCase().includes(query);
      const matchDesc = studio.desc.toLowerCase().includes(query);
      const matchCat = studio.category.toLowerCase().includes(query);
      const matchTags = studio.tags.some(t => t.toLowerCase().includes(query));
      const matchMaster = (studio.masterPrompt || '').toLowerCase().includes(query) || (studio.masterPromptTh || '').toLowerCase().includes(query);
      const matchItems = studio.items.some(
        it => it.title.toLowerCase().includes(query) || it.prompt.toLowerCase().includes(query)
      );

      if (!matchName && !matchSub && !matchDesc && !matchCat && !matchTags && !matchMaster && !matchItems) {
        return false;
      }
    }

    return true;
  });
}

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
