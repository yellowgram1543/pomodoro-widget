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
 * Curated high-definition ambient backdrops (Lofi, Nature, Space, Cyberpunk, Fireplace, Rain)
 */
export const AMBIENT_PRESETS: AmbientSource[] = [
  {
    id: 'preset-lofi-cafe',
    title: 'Rainy Tokyo Coffee Shop',
    category: 'Lofi',
    videoId: 'jfKfPfyJRdk', // Lofi Girl / Study beats
    listId: null,
    description: 'Gentle lofi hip hop beats with coffee aroma & rain on windows',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    tag: 'Chill Beats',
  },
  {
    id: 'preset-cozy-rain',
    title: 'Cozy Rain & Thunderstorm',
    category: 'Rain & Nature',
    videoId: 'mPZkdNFkNps', // Gentle rain ambience
    listId: null,
    description: 'Deep sleep and focus rain sounds with soft distant rolling thunder',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
    tag: 'Rain & Storm',
  },
  {
    id: 'preset-deep-space',
    title: 'Deep Space Nebula Flight',
    category: 'Space & Sci-Fi',
    videoId: 'unJ1Kz77Qls', // Space ambient
    listId: null,
    description: 'Drifting through cosmic dust clouds and interstellar nebulas',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    tag: 'Cosmic Drone',
  },
  {
    id: 'preset-cyberpunk-night',
    title: 'Cyberpunk 2077 Night City',
    category: 'Space & Sci-Fi',
    videoId: 'd56mG7DezGs', // Cyberpunk ambient
    listId: null,
    description: 'Futuristic rainy skyline with glowing neon signs and synth hum',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    tag: 'Synth Ambience',
  },
  {
    id: 'preset-cozy-fireplace',
    title: 'Warm Mountain Fireplace',
    category: 'Cozy',
    videoId: 'L_LUpnjgPso', // Fireplace sound
    listId: null,
    description: 'Crackling cedar wood logs in a warm cabin during snowstorm',
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    tag: 'Crackling Fire',
  },
  {
    id: 'preset-japanese-garden',
    title: 'Kyoto Bamboo Forest & Stream',
    category: 'Atmospheric',
    videoId: '4vIQON2fDWM', // Japanese garden stream
    listId: null,
    description: 'Tranquil flowing bamboo water fountain and peaceful birdsong',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    tag: 'Zen Garden',
  },
  {
    id: 'preset-forest-river',
    title: 'Alpine Forest Waterfall',
    category: 'Rain & Nature',
    videoId: '1ZYbU8JGB4A', // Waterfall white noise
    listId: null,
    description: 'Continuous white noise of crisp alpine mountain brook',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    tag: 'White Noise',
  },
  {
    id: 'preset-synth-sunset',
    title: 'Retro Sunset Coastal Highway',
    category: 'Atmospheric',
    videoId: '5qap5aO4i9A', // Lofi synth
    listId: null,
    description: 'Golden hour coastal cruise with mellow dreamwave synth tunes',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    tag: 'Chillwave',
  },
];
