import { BuiltInAmbientSound } from '../types';
import {
  CloudRain,
  CloudLightning,
  Tent,
  Waves,
  Droplets,
  Bird,
  Flame,
  Moon,
  Wind,
  Coffee,
  BookOpen,
  Train,
  Bell,
  Keyboard,
  Disc3,
  Clock,
  Heart,
  Fan,
  Fish,
  Zap,
  Activity,
  Brain,
  Sparkles,
  Sliders,
  Compass,
} from 'lucide-react';
import React from 'react';

export interface SoundCategory {
  id: string;
  name: string;
  count: number;
}

export interface AmbientSoundDefinition {
  id: BuiltInAmbientSound;
  label: string;
  desc: string;
  category: 'rain' | 'nature' | 'places' | 'cozy' | 'noise' | 'binaural';
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

export const SOUND_CATEGORIES: SoundCategory[] = [
  { id: 'all', name: 'All Sounds', count: 28 },
  { id: 'rain', name: 'Rain & Water', count: 8 },
  { id: 'nature', name: 'Nature & Night', count: 4 },
  { id: 'places', name: 'Places & Travel', count: 3 },
  { id: 'cozy', name: 'Cozy & Home', count: 5 },
  { id: 'noise', name: 'Pure Noise', count: 3 },
  { id: 'binaural', name: 'Binaural Beats', count: 5 },
];

function TreesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'w-5 h-5'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
      <path d="M7 16v6" />
      <path d="M13 19v3" />
      <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5" />
    </svg>
  );
}

export const ALL_AMBIENT_SOUNDS: AmbientSoundDefinition[] = [
  // 1. Rain & Water
  {
    id: 'light_rain',
    label: 'Gentle Rain',
    desc: 'Soft steady rainfall on glass',
    category: 'rain',
    icon: CloudRain,
  },
  {
    id: 'heavy_rain',
    label: 'Heavy Downpour',
    desc: 'Immersive deep storm rain',
    category: 'rain',
    icon: CloudRain,
  },
  {
    id: 'rain_on_tent',
    label: 'Rain on Tent',
    desc: 'Camp canopy rhythmic drops',
    category: 'rain',
    icon: Tent,
  },
  {
    id: 'thunderstorm',
    label: 'Thunderstorm',
    desc: 'Rolling thunder & rainfall',
    category: 'rain',
    icon: CloudLightning,
  },
  {
    id: 'waves',
    label: 'Ocean Waves',
    desc: 'Rhythmic deep tide waves',
    category: 'rain',
    icon: Waves,
  },
  {
    id: 'waterfall',
    label: 'Waterfall',
    desc: 'Cascading mountain stream',
    category: 'rain',
    icon: Droplets,
  },
  {
    id: 'river',
    label: 'Forest Creek',
    desc: 'Gentle brook pebble current',
    category: 'rain',
    icon: Waves,
  },
  {
    id: 'underwater',
    label: 'Underwater',
    desc: 'Submerged deep-sea resonance',
    category: 'rain',
    icon: Fish,
  },

  // 2. Nature & Wildlife
  {
    id: 'birds',
    label: 'Morning Birds',
    desc: 'Dawn songbirds in canopy',
    category: 'nature',
    icon: Bird,
  },
  {
    id: 'summer_night',
    label: 'Summer Crickets',
    desc: 'Peaceful twilight chirping',
    category: 'nature',
    icon: Moon,
  },
  {
    id: 'wind',
    label: 'Mountain Wind',
    desc: 'Gentle alpine gust in trees',
    category: 'nature',
    icon: Wind,
  },
  {
    id: 'whales',
    label: 'Whale Songs',
    desc: 'Ethereal oceanic harmony',
    category: 'nature',
    icon: Fish,
  },

  // 3. Places & Travel
  {
    id: 'street_cafe',
    label: 'Coffee Shop',
    desc: 'Cozy murmur & bistro ambience',
    category: 'places',
    icon: Coffee,
  },
  {
    id: 'japanese_library',
    label: 'Quiet Library',
    desc: 'Serene page turns & silent space',
    category: 'places',
    icon: BookOpen,
  },
  {
    id: 'commuter_train',
    label: 'Night Train',
    desc: 'Rhythmic sleeper train rails',
    category: 'places',
    icon: Train,
  },

  // 4. Cozy & Home
  {
    id: 'fireplace',
    label: 'Campfire',
    desc: 'Crackling warm woodfire',
    category: 'cozy',
    icon: Flame,
  },
  {
    id: 'wind_chimes',
    label: 'Wind Chimes',
    desc: 'Delicate bamboo/metal rings',
    category: 'cozy',
    icon: Bell,
  },
  {
    id: 'keyboard',
    label: 'Mechanical Typing',
    desc: 'Satisfying tactile key clatter',
    category: 'cozy',
    icon: Keyboard,
  },
  {
    id: 'record_player',
    label: 'Vinyl Crackle',
    desc: 'Warm analog needle texture',
    category: 'cozy',
    icon: Disc3,
  },
  {
    id: 'clock',
    label: 'Antique Clock',
    desc: 'Subtle pendulum tick-tock',
    category: 'cozy',
    icon: Clock,
  },
  {
    id: 'cat_purr',
    label: 'Cat Purring',
    desc: 'Soothing rhythmic vibrato',
    category: 'cozy',
    icon: Heart,
  },
  {
    id: 'room_fan',
    label: 'Ceiling Fan',
    desc: 'Steady low-frequency drone',
    category: 'cozy',
    icon: Fan,
  },

  // 5. Pure Noise Colors (Synthesized via Web Audio)
  {
    id: 'whitenoise',
    label: 'White Noise',
    desc: 'Even spectrum focus isolation',
    category: 'noise',
    icon: Sliders,
    tag: 'All Frequencies',
  },
  {
    id: 'pinknoise',
    label: 'Pink Noise',
    desc: 'Balanced 1/f deeper masking',
    category: 'noise',
    icon: Sliders,
    tag: 'Balanced Masking',
  },
  {
    id: 'brownnoise',
    label: 'Brown Noise',
    desc: 'Deep warm low-frequency rumble',
    category: 'noise',
    icon: Sliders,
    tag: 'Deep Focus',
  },

  // 6. Binaural Beats (Synthesized via Web Audio)
  {
    id: 'binaural_gamma',
    label: 'Gamma (40 Hz)',
    desc: 'Peak cognitive performance',
    category: 'binaural',
    icon: Brain,
    tag: 'Cognition',
  },
  {
    id: 'binaural_beta',
    label: 'Beta (20 Hz)',
    desc: 'High alertness & problem solving',
    category: 'binaural',
    icon: Activity,
    tag: 'Alertness',
  },
  {
    id: 'binaural_alpha',
    label: 'Alpha (10 Hz)',
    desc: 'Relaxed focus & flow state',
    category: 'binaural',
    icon: Sparkles,
    tag: 'Flow State',
  },
  {
    id: 'binaural_theta',
    label: 'Theta (6 Hz)',
    desc: 'Deep meditation & creativity',
    category: 'binaural',
    icon: Zap,
    tag: 'Meditation',
  },
  {
    id: 'binaural_delta',
    label: 'Delta (2.5 Hz)',
    desc: 'Restorative power nap & calm',
    category: 'binaural',
    icon: Compass,
    tag: 'Sleep & Calm',
  },
];
