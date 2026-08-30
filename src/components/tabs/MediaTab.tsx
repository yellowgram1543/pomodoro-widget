import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Play,
  Pause,
  SkipForward,
  Trash2,
  Link2,
  ListPlus,
  Tv,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Trees,
  Waves,
  Headphones,
  Flame,
  Wind,
  ExternalLink,
  TrainTrack,
  BookOpen,
  SunMedium,
  Building,
  Activity,
  Sliders,
  Zap,
  Sparkles,
  Moon,
  MoonStar,
  Coffee,
  Sunrise,
  Anchor,
  Snowflake,
  Fan,
  Plane,
  Bird,
  Droplets,
  Keyboard,
  Fish,
  UtensilsCrossed,
  CircleDot,
  Disc,
  Orbit,
  Clock,
  Heart,
  Tent,
  Search,
  BellRing,
} from 'lucide-react';
import { MediaSettings, PlaylistItem, BuiltInAmbientSound } from '../../types';
import { extractYouTubeSource } from '../../utils/youtube';
import { setAmbientSound, getAudioContext } from '../../utils/audio';

interface MediaTabProps {
  media: MediaSettings;
  onUpdateMedia: (newMedia: Partial<MediaSettings>) => void;
  inFloatingPip?: boolean;
  onDockBack?: () => void;
}

interface SoundscapeItem {
  id: BuiltInAmbientSound;
  label: string;
  category: 'All' | 'Rain & Water' | 'Nature' | 'Places' | 'Cozy & Home' | 'Noises' | 'Binaural';
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  media,
  onUpdateMedia,
  inFloatingPip = false,
  onDockBack,
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'soundscapes' | 'video'>('soundscapes');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const { videoId, listId } = media.currentSource;

  // Build clean embed URL for YouTube with enablejsapi=1 for full remote postMessage synchronization
  let embedUrl = '';
  if (listId && !videoId) {
    embedUrl = `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=${
      media.isPlaying ? 1 : 0
    }&mute=${media.isMuted ? 1 : 0}&controls=1&loop=1&enablejsapi=1&playsinline=1`;
  } else if (videoId) {
    const loopParam = listId ? `&list=${listId}` : `&playlist=${videoId}`;
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${
      media.isPlaying ? 1 : 0
    }&mute=${media.isMuted ? 1 : 0}&controls=1&loop=1${loopParam}&enablejsapi=1&playsinline=1`;
  }

  // Handle postMessage commands for video volume and mute
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      if (media.isMuted) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: [] }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [media.volume] }),
          '*'
        );
      }

      if (media.isPlaying) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
    } catch {
      // YouTube postMessage safety
    }
  }, [media.isMuted, media.volume, media.isPlaying]);

  // Synchronize synthesized ambient sound
  useEffect(() => {
    if (media.ambientSound && media.ambientSound !== 'none') {
      const vol = media.isMuted ? 0 : media.ambientSoundVolume;
      setAmbientSound(media.ambientSound, vol);
    } else {
      setAmbientSound('none', 0);
    }
  }, [media.ambientSound, media.ambientSoundVolume, media.isMuted]);

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const { videoId: extractedVideoId, listId: extractedListId } = extractYouTubeSource(customUrl);

    if (!extractedVideoId && !extractedListId) {
      setInputError('Could not find a valid YouTube Video or Playlist ID.');
      return;
    }

    setInputError(null);
    const title =
      customTitle.trim() ||
      (extractedListId ? `Playlist: ${extractedListId}` : `Video: ${extractedVideoId}`);

    const newItem: PlaylistItem = {
      id: `queue-${Date.now()}`,
      url: customUrl.trim(),
      title: title,
      videoId: extractedVideoId,
      listId: extractedListId,
      addedAt: Date.now(),
    };

    onUpdateMedia({
      currentSource: { videoId: extractedVideoId, listId: extractedListId, title },
      playlist: [...media.playlist, newItem],
      currentIndex: media.playlist.length,
      isPlaying: true,
      isMuted: false, // Unmute when user explicitly loads a link
    });

    setCustomUrl('');
    setCustomTitle('');
  };

  const handlePlayQueueIndex = (index: number) => {
    const item = media.playlist[index];
    if (!item) return;

    onUpdateMedia({
      currentSource: {
        videoId: item.videoId,
        listId: item.listId,
        title: item.title,
      },
      currentIndex: index,
      isPlaying: true,
      isMuted: false,
    });
  };

  const handleRemoveQueueItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPlaylist = media.playlist.filter((item) => item.id !== id);
    onUpdateMedia({ playlist: newPlaylist });
  };

  const handleNextTrack = () => {
    if (media.playlist.length === 0) return;
    const nextIdx = (media.currentIndex + 1) % media.playlist.length;
    handlePlayQueueIndex(nextIdx);
  };

  const handleSelectSoundscape = (sound: BuiltInAmbientSound) => {
    getAudioContext();
    if (media.ambientSound === sound) {
      // Toggle off
      onUpdateMedia({ ambientSound: 'none' });
    } else {
      onUpdateMedia({
        ambientSound: sound,
        isMuted: false,
        ambientSoundVolume: media.ambientSoundVolume || 65,
      });
    }
  };

  // Curated list of unique, authentic, high-quality soundscapes (Royalty-free audio loops & pure synthesis)
  const soundscapeCatalog: SoundscapeItem[] = [
    // Rain & Water
    { id: 'light_rain', label: 'Light Rain', category: 'Rain & Water', desc: 'Gentle raindrops falling on leaves', icon: CloudDrizzle },
    { id: 'heavy_rain', label: 'Heavy Rain', category: 'Rain & Water', desc: 'Deep steady downpour shower', icon: CloudRain },
    { id: 'rain_on_tent', label: 'Rain on Tent', category: 'Rain & Water', desc: 'Raindrops pattering on canvas shelter', icon: Tent },
    { id: 'thunderstorm', label: 'Thunderstorm', category: 'Rain & Water', desc: 'Distant rolling thunder & storm rain', icon: CloudLightning },
    { id: 'waves', label: 'Ocean Waves', category: 'Rain & Water', desc: 'Rhythmic coastal surf and rolling tide', icon: Waves },
    { id: 'waterfall', label: 'Mountain Waterfall', category: 'Rain & Water', desc: 'Rushing cascade of white water', icon: Droplets },
    { id: 'river', label: 'River Stream', category: 'Rain & Water', desc: 'Gentle bubbling mountain brook', icon: Waves },
    { id: 'underwater', label: 'Deep Underwater', category: 'Rain & Water', desc: 'Muffled aquatic bubbles & ocean current', icon: Anchor },
    { id: 'whales', label: 'Ocean Whales', category: 'Rain & Water', desc: 'Authentic humpback whale echo songs', icon: Fish },
    // Nature
    { id: 'birds', label: 'Forest Birds', category: 'Nature', desc: 'Morning woodland birdsong & breeze', icon: Bird },
    { id: 'summer_night', label: 'Night Crickets', category: 'Nature', desc: 'Evening dusk air & cricket chirps', icon: Sparkles },
    { id: 'wind', label: 'Wind in Trees', category: 'Nature', desc: 'Rustling canopy gusts & mountain breeze', icon: Wind },
    // Places & Travel
    { id: 'street_cafe', label: 'Street Café', category: 'Places', desc: 'Espresso bar chatter & cup clinks', icon: Coffee },
    { id: 'japanese_library', label: 'Quiet Library', category: 'Places', desc: 'Peaceful study silence & page turns', icon: BookOpen },
    { id: 'commuter_train', label: 'Inside a Train', category: 'Places', desc: 'Rhythmic railway track carriage ride', icon: TrainTrack },
    // Cozy & Home
    { id: 'fireplace', label: 'Crackling Fireplace', category: 'Cozy & Home', desc: 'Warm hearth with popping wood embers', icon: Flame },
    { id: 'wind_chimes', label: 'Wind Chimes', category: 'Cozy & Home', desc: 'Gentle melodic chimes in the breeze', icon: BellRing },
    { id: 'keyboard', label: 'Mechanical Keyboard', category: 'Cozy & Home', desc: 'Real tactile mechanical typing clicks', icon: Keyboard },
    { id: 'record_player', label: 'Vinyl Record Player', category: 'Cozy & Home', desc: 'Vintage needle crackle & turntable hum', icon: Disc },
    { id: 'clock', label: 'Clock Ticking', category: 'Cozy & Home', desc: 'Steady pendulum mechanical tick-tock', icon: Clock },
    { id: 'cat_purr', label: 'Cat Purring', category: 'Cozy & Home', desc: 'Deep rhythmic soothing cat purr', icon: Heart },
    { id: 'room_fan', label: 'Ceiling Fan', category: 'Cozy & Home', desc: 'Steady whirring rotary blade airflow', icon: Fan },
    // Pure Noises
    { id: 'brownnoise', label: 'Brown Noise', category: 'Noises', desc: 'Deep low-frequency acoustic warmth', icon: Sliders },
    { id: 'pinknoise', label: 'Pink Noise', category: 'Noises', desc: 'Natural 1/f balanced focus curve', icon: Activity },
    { id: 'whitenoise', label: 'White Noise', category: 'Noises', desc: 'Full-frequency sound mask', icon: Radio },
    // Binaural Beats
    { id: 'binaural_alpha', label: 'Binaural: Alpha', category: 'Binaural', desc: '10Hz beat for calm flow state & memory', icon: Headphones },
    { id: 'binaural_beta', label: 'Binaural: Beta', category: 'Binaural', desc: '20Hz beat for high alertness & focus', icon: Sparkles },
    { id: 'binaural_gamma', label: 'Binaural: Gamma', category: 'Binaural', desc: '40Hz beat for peak cognition & problem solving', icon: Zap },
    { id: 'binaural_theta', label: 'Binaural: Theta', category: 'Binaural', desc: '6Hz beat for meditation & creativity', icon: Moon },
    { id: 'binaural_delta', label: 'Binaural: Delta', category: 'Binaural', desc: '2.5Hz beat for sleep & deep recovery', icon: MoonStar },
  ];

  const categories = ['All', 'Rain & Water', 'Nature', 'Places', 'Cozy & Home', 'Noises', 'Binaural'];

  const filteredSoundscapes = useMemo(() => {
    return soundscapeCatalog.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [soundscapeCatalog, activeCategory, searchQuery]);

  const activeSoundObj = soundscapeCatalog.find((s) => s.id === media.ambientSound);

  return (
    <div className="flex flex-col w-full space-y-3.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
      {/* Media Mode Selector */}
      <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl">
        <button
          onClick={() => setMediaType('soundscapes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mediaType === 'soundscapes'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Ambient Soundscapes ({soundscapeCatalog.length})</span>
        </button>
        <button
          onClick={() => setMediaType('video')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mediaType === 'video'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>YouTube Player</span>
        </button>
      </div>

      {/* Built-in Ambient Soundscapes (Synthesized offline audio) */}
      {mediaType === 'soundscapes' ? (
        <div className="space-y-3">
          {/* Active Soundscape Status & Volume Banner */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2.5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {media.ambientSound !== 'none' && !media.isMuted ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-600" />
                  )}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {activeSoundObj ? activeSoundObj.label : 'No Soundscape Playing'}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {media.ambientSound !== 'none' ? 'Royalty-Free Audio • Seamless Loop' : 'Select a sound to begin'}
                  </span>
                </div>
              </div>

              {media.ambientSound !== 'none' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateMedia({ ambientSound: 'none' })}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 text-[10px] font-semibold border border-white/10 transition-all"
                    title="Stop Ambient Sound"
                  >
                    Stop
                  </button>
                  <button
                    onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
                    className={`p-1.5 rounded-lg border transition-all ${
                      media.isMuted
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                    title={media.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {media.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Volume Control */}
            {media.ambientSound !== 'none' && (
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 font-mono w-16">
                  Vol {media.isMuted ? 0 : media.ambientSoundVolume}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={media.isMuted ? 0 : media.ambientSoundVolume}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateMedia({ ambientSoundVolume: val, isMuted: val === 0 });
                  }}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Search & Category Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-amber-400/50">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search sounds (e.g. rain, train, coffee, binaural)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => {
                const isCatActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                      isCatActive
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soundscapes Grid */}
          <div className="grid grid-cols-2 gap-2">
            {filteredSoundscapes.map((item) => {
              const Icon = item.icon;
              const isPlaying = media.ambientSound === item.id && !media.isMuted;
              return (
                <button
                  key={item.id}
                  id={`soundscape-btn-${item.id}`}
                  onClick={() => handleSelectSoundscape(item.id)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    isPlaying
                      ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPlaying
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-white/10 text-neutral-300 group-hover:text-white group-hover:bg-white/15'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                        <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_1s_infinite_300ms] h-2" />
                        <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_1s_infinite_200ms] h-2.5" />
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono text-neutral-500 uppercase">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold truncate w-full ${isPlaying ? 'text-amber-200' : 'text-white'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredSoundscapes.length === 0 && (
            <div className="text-center py-6 text-neutral-500 text-xs">
              No soundscapes found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      ) : (
        /* Video Mode */
        <div className="space-y-3">
          {inFloatingPip ? (
            /* Dedicated Always-on-Top Floating PiP Media Controller */
            <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-950/90 border border-amber-400/30 shadow-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-end gap-0.5 h-3.5 px-1 py-0.5 bg-amber-500/20 rounded">
                    <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                    <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_1s_infinite_300ms] h-2" />
                    <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_1s_infinite_200ms] h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wide">
                    Streaming in Main Tab
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {videoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white text-[10px] flex items-center gap-1 transition-all"
                      title="Open full video in YouTube tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {onDockBack && (
                    <button
                      onClick={onDockBack}
                      className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition-all"
                      title="Dock back to watch video frame"
                    >
                      <span>Dock</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Play/Pause Banner */}
              <div className="flex items-center justify-between gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-white block truncate">
                    {media.currentSource.title || 'Ambient Video Track'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {media.isMuted ? 'Muted' : `Volume: ${media.volume}%`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onUpdateMedia({ isPlaying: !media.isPlaying })}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all active:scale-95 shadow-md shadow-amber-500/20"
                    title={media.isPlaying ? 'Pause Background Video' : 'Play Background Video'}
                  >
                    {media.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
                    className={`p-2 rounded-xl border transition-all ${
                      media.isMuted
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                    title={media.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {media.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {media.playlist.length > 1 && (
                    <button
                      onClick={handleNextTrack}
                      className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all"
                      title="Next track"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>Volume</span>
                  <span>{media.isMuted ? '0%' : `${media.volume}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={media.isMuted ? 0 : media.volume}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateMedia({ volume: val, isMuted: val === 0 });
                  }}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          ) : (
            /* Active Video Player Box (Standard Mode) */
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/15 shadow-xl group">
              {embedUrl ? (
                <iframe
                  ref={iframeRef}
                  key={embedUrl}
                  title="Widget Ambient Video Player"
                  src={embedUrl}
                  className="w-full h-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
                  <Tv className="w-8 h-8 stroke-1 mb-1 text-neutral-600" />
                  <span>Select a preset or paste a video link</span>
                </div>
              )}

              {/* Unmute Prompt Banner if Muted */}
              {media.isMuted && embedUrl && (
                <button
                  onClick={() => onUpdateMedia({ isMuted: false })}
                  className="absolute top-2 right-2 z-10 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all animate-bounce"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tap to Unmute Sound</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Player Bar: Only show in Standard Mode */}
          {!inFloatingPip && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold text-white truncate">
                    {media.currentSource.title || 'Ambient Track'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id="btn-media-toggle-mute"
                    onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
                    className={`p-1.5 rounded-lg border transition-all ${
                      media.isMuted
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                    title={media.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {media.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  {media.playlist.length > 1 && (
                    <button
                      id="btn-media-skip-track"
                      onClick={handleNextTrack}
                      className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
                      title="Next playlist track"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-neutral-400 font-mono w-14">
                  Vol {media.isMuted ? 0 : media.volume}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={media.isMuted ? 0 : media.volume}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateMedia({ volume: val, isMuted: val === 0 });
                  }}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Custom YouTube URL Loader */}
          <form onSubmit={handleApplyUrl} className="space-y-2 pt-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Load Custom YouTube Video / Playlist
            </label>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-amber-400/50">
                <Link2 className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  id="custom-youtube-url-input"
                  type="text"
                  placeholder="Paste YouTube link (e.g. youtu.be/... or list=...)"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional custom title label"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
                <button
                  id="btn-apply-youtube-url"
                  type="submit"
                  disabled={!customUrl.trim()}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-neutral-950 font-semibold text-xs rounded-lg transition-all"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Load</span>
                </button>
              </div>

              {inputError && <p className="text-[11px] text-rose-400">{inputError}</p>}
            </div>
          </form>

          {/* Custom Playlist Queue */}
          {media.playlist.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Saved Videos Queue ({media.playlist.length})
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {media.playlist.map((item, idx) => {
                  const isActive = media.currentIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handlePlayQueueIndex(idx)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium'
                          : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Radio className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemoveQueueItem(item.id, e)}
                        className="p-1 text-neutral-500 hover:text-rose-400 transition-colors ml-2"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
