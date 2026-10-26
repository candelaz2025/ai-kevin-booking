import rawData from '@/data/drama-catalog.json';
import { DramaCatalog, DramaItem, DRAMA_MEDIA_BASE_URL } from './drama-types';

export const dramaCatalog: DramaCatalog = (rawData as unknown) as DramaCatalog;

/**
 * Get the full URL for a drama media asset (image or video)
 */
export function getDramaMediaUrl(fileName?: string): string {
  if (!fileName) return '';
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    return fileName;
  }
  return `${DRAMA_MEDIA_BASE_URL}/${fileName}`;
}

/**
 * Filter items by group, media type, and search keyword
 */
export function filterDramaItems(
  items: DramaItem[],
  group: string = 'all',
  typeFilter: 'all' | 'clip' | 'image' = 'all',
  searchQuery: string = ''
): DramaItem[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter(item => {
    // 1. Group filter
    if (group !== 'all' && item.group !== group) {
      return false;
    }

    // 2. Type filter
    if (typeFilter === 'clip' && item.kind !== 'clip') {
      return false;
    }
    if (typeFilter === 'image' && item.kind !== 'image') {
      return false;
    }

    // 3. Search query
    if (query) {
      const matchLabel = item.label.toLowerCase().includes(query);
      const matchGroup = item.groupTh.toLowerCase().includes(query);
      const matchBeat = (item.beat || '').toLowerCase().includes(query);
      const matchLines = (item.lines || []).some(l => l.toLowerCase().includes(query));
      const matchPrompt = (item.metaPrompt || '').toLowerCase().includes(query);
      const matchSettings = Object.entries(item.settings || {}).some(
        ([k, v]) => (k && k.toLowerCase().includes(query)) || (Boolean(v) && String(v).toLowerCase().includes(query))
      );

      if (!matchLabel && !matchGroup && !matchBeat && !matchLines && !matchPrompt && !matchSettings) {
        return false;
      }
    }

    return true;
  });
}
