import { AmbientSource } from '../types';

/**
 * Truncates any title to a maximum of 50 characters, appending '...' if it exceeds 50 characters.
 */
export function truncateTitle(title: string | null | undefined, maxLength: number = 50): string {
  if (!title || typeof title !== 'string') return '';
  const trimmed = title.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Decodes common HTML entities returned in oEmbed title fields (e.g. &#39; -> ', &amp; -> &)
 */
export function decodeHtmlEntities(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

/**
 * In-memory cache for fast retrieved YouTube titles
 */
const YOUTUBE_TITLE_CACHE = new Map<string, string>();

/**
 * Fetches the authentic YouTube video title via YouTube oEmbed with fallback to noembed & JSONP
 */
export async function fetchYouTubeTitle(urlOrId: string): Promise<string | null> {
  const { videoId, listId } = extractYouTubeSource(urlOrId);
  if (!videoId && !listId) return null;

  const cacheKey = videoId || listId || '';
  if (cacheKey && YOUTUBE_TITLE_CACHE.has(cacheKey)) {
    return YOUTUBE_TITLE_CACHE.get(cacheKey)!;
  }

  const targetUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/playlist?list=${listId}`;

  // 1. Try direct fetch with YouTube oEmbed
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        const clean = decodeHtmlEntities(data.title);
        YOUTUBE_TITLE_CACHE.set(cacheKey, clean);
        return clean;
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. Try noembed fallback
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        const clean = decodeHtmlEntities(data.title);
        YOUTUBE_TITLE_CACHE.set(cacheKey, clean);
        return clean;
      }
    }
  } catch {
    // Continue to fallback
  }

  // 3. Try JSONP fallback via script tag (bypasses any browser sandbox CORS restriction)
  if (typeof document !== 'undefined') {
    try {
      const title = await new Promise<string>((resolve, reject) => {
        const callbackName = `yt_oembed_cb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('JSONP timeout'));
        }, 3500);

        const cleanup = () => {
          clearTimeout(timeout);
          delete (window as unknown as Record<string, unknown>)[callbackName];
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };

        (window as unknown as Record<string, (data: { title?: string }) => void>)[callbackName] = (data) => {
          cleanup();
          if (data && data.title) {
            resolve(decodeHtmlEntities(data.title));
          } else {
            reject(new Error('No title in oEmbed JSONP response'));
          }
        };

        script.src = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json&callback=${callbackName}`;
        script.onerror = () => {
          cleanup();
          reject(new Error('JSONP script load error'));
        };
        document.head.appendChild(script);
      });

      if (title) {
        YOUTUBE_TITLE_CACHE.set(cacheKey, title);
        return title;
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

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
