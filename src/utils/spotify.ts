import { SpotifyMediaType, MediaServiceType } from '../types';
import { decodeHtmlEntities, truncateTitle } from './youtube';

export interface ParsedMedia {
  service: MediaServiceType;
  videoId: string | null;
  listId: string | null;
  spotifyId: string | null;
  spotifyType: SpotifyMediaType | null;
}

const SPOTIFY_TITLE_CACHE = new Map<string, string>();

/**
 * Extracts Spotify type and ID from URLs such as:
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 * - https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
 * - https://open.spotify.com/album/41MnTivkwTO3UUAJ25879i
 * - https://open.spotify.com/episode/776A23nfj93neXZKyvgdA8
 * - spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
 */
export function extractSpotifySource(url: string): {
  spotifyId: string | null;
  spotifyType: SpotifyMediaType | null;
} {
  if (!url || typeof url !== 'string') {
    return { spotifyId: null, spotifyType: null };
  }

  const trimmed = url.trim();

  // Pattern 1: https://open.spotify.com/{type}/{id}
  const webMatch = trimmed.match(
    /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/i
  );
  if (webMatch) {
    const type = webMatch[1].toLowerCase() as SpotifyMediaType;
    const id = webMatch[2];
    return { spotifyId: id, spotifyType: type };
  }

  // Pattern 2: spotify:{type}:{id}
  const uriMatch = trimmed.match(/^spotify:(track|playlist|album|artist|episode|show):([a-zA-Z0-9]+)/i);
  if (uriMatch) {
    const type = uriMatch[1].toLowerCase() as SpotifyMediaType;
    const id = uriMatch[2];
    return { spotifyId: id, spotifyType: type };
  }

  // Pattern 3: embed link: https://open.spotify.com/embed/{type}/{id}
  const embedMatch = trimmed.match(
    /spotify\.com\/embed\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/i
  );
  if (embedMatch) {
    const type = embedMatch[1].toLowerCase() as SpotifyMediaType;
    const id = embedMatch[2];
    return { spotifyId: id, spotifyType: type };
  }

  return { spotifyId: null, spotifyType: null };
}

/**
 * Fetches real title from Spotify oEmbed public API (no API key required)
 */
export async function fetchSpotifyTitle(urlOrId: string, type?: SpotifyMediaType): Promise<string | null> {
  const { spotifyId, spotifyType } = extractSpotifySource(urlOrId);
  const resolvedId = spotifyId || urlOrId;
  const resolvedType = spotifyType || type || 'playlist';

  if (!resolvedId) return null;
  const cacheKey = `spotify_${resolvedType}_${resolvedId}`;

  if (SPOTIFY_TITLE_CACHE.has(cacheKey)) {
    return SPOTIFY_TITLE_CACHE.get(cacheKey)!;
  }

  const targetUrl = urlOrId.includes('spotify.com')
    ? urlOrId
    : `https://open.spotify.com/${resolvedType}/${resolvedId}`;

  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        const clean = decodeHtmlEntities(data.title);
        SPOTIFY_TITLE_CACHE.set(cacheKey, clean);
        return clean;
      }
    }
  } catch {
    // Graceful fallback
  }

  return null;
}
