import { AmbientSource } from '../types';

/**
 * Extracts YouTube video ID and playlist ID from various URL formats:
 * - standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID&list=LIST_ID
 * - short URLs: https://youtu.be/VIDEO_ID?list=LIST_ID
 * - embed URLs: https://www.youtube.com/embed/VIDEO_ID
 * - playlist-only URLs: https://www.youtube.com/playlist?list=LIST_ID
 * - direct 11-char ID inputs
 */
export function extractYouTubeSource(url: string): { videoId: string | null; listId: string | null } {
  if (!url || typeof url !== 'string') {
    return { videoId: null, listId: null };
  }

  const cleanUrl = url.trim();

  // Check if user entered direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return { videoId: cleanUrl, listId: null };
  }

  // Check if user entered direct playlist ID (usually starts with PL or RD)
  if (/^(?:PL|RD|FL|UU|LL)[a-zA-Z0-9_-]+$/.test(cleanUrl)) {
    return { videoId: null, listId: cleanUrl };
  }

  // Match video ID
  const videoMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );

  // Match playlist ID
  const playlistMatch = cleanUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);

  return {
    videoId: videoMatch ? videoMatch[1] : null,
    listId: playlistMatch ? playlistMatch[1] : null,
  };
}

/**
 * Curated high-definition ambient backdrops (Scenic city drives, coastal tours, world destinations)
 */
export const AMBIENT_PRESETS: AmbientSource[] = [
  {
    id: 'preset-florida-keys',
    title: 'Florida Keys',
    category: 'Coastal',
    videoId: '5t7f-3lFOgs',
    listId: null,
    description: 'Scenic overseas highway drive through turquoise Florida Keys waters',
    thumbnail: 'https://img.youtube.com/vi/5t7f-3lFOgs/hqdefault.jpg',
    tag: '4K Scenic Drive',
  },
  {
    id: 'preset-miami',
    title: 'Miami',
    category: 'City',
    videoId: 'UlIDWxkLw4g',
    listId: null,
    description: 'Skyscraper district drive through downtown Miami',
    thumbnail: 'https://img.youtube.com/vi/UlIDWxkLw4g/hqdefault.jpg',
    tag: '4K Skyscraper Drive',
  },
  {
    id: 'preset-madrid',
    title: 'Madrid',
    category: 'Europe',
    videoId: 'ZQC3fIhnH4o',
    listId: null,
    description: 'Grand boulevards and historic architecture of Madrid',
    thumbnail: 'https://img.youtube.com/vi/ZQC3fIhnH4o/hqdefault.jpg',
    tag: '4K City Atmosphere',
  },
  {
    id: 'preset-amalfi-coast',
    title: 'Amalfi Coast',
    category: 'Coastal',
    videoId: 'NWn1zSPshoA',
    listId: null,
    description: 'Stunning cliffside coastal drive along the Mediterranean Amalfi Coast',
    thumbnail: 'https://img.youtube.com/vi/NWn1zSPshoA/hqdefault.jpg',
    tag: '4K Coastal View',
  },
  {
    id: 'preset-paris',
    title: 'Paris',
    category: 'Europe',
    videoId: 'QWyYsMAaGyc',
    listId: null,
    description: 'Iconic Parisian avenues, landmarks, and city atmosphere',
    thumbnail: 'https://img.youtube.com/vi/QWyYsMAaGyc/hqdefault.jpg',
    tag: '4K City Walk',
  },
  {
    id: 'preset-rome',
    title: 'Rome',
    category: 'Europe',
    videoId: '-E6z7icjIxE',
    listId: null,
    description: 'Timeless Roman avenues, monuments, and classical streets',
    thumbnail: 'https://img.youtube.com/vi/-E6z7icjIxE/hqdefault.jpg',
    tag: '4K Ancient City',
  },
  {
    id: 'preset-miami-beach',
    title: 'Miami Beach',
    category: 'Coastal',
    videoId: 'uSlGIfnrr8M',
    listId: null,
    description: 'Billionaire bunker and coastal palms in Miami Beach',
    thumbnail: 'https://img.youtube.com/vi/uSlGIfnrr8M/hqdefault.jpg',
    tag: '4K Ocean Drive',
  },
  {
    id: 'preset-chicago',
    title: 'Chicago',
    category: 'City',
    videoId: 'PsZLQslFRtw',
    listId: null,
    description: 'Dramatic architectural skyline and riverfront bridges of Chicago',
    thumbnail: 'https://img.youtube.com/vi/PsZLQslFRtw/hqdefault.jpg',
    tag: '4K Urban Skyline',
  },
];
