import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Plus,
  Radio,
  Play,
  Pause,
  SkipForward,
  Trash2,
  Sparkles,
  Link2,
  ListPlus,
  Tv,
  CloudRain,
  Trees,
  Waves,
  Headphones,
  Flame,
  Wind,
  ExternalLink,
} from 'lucide-react';
import { MediaSettings, PlaylistItem, AmbientSource, BuiltInAmbientSound } from '../../types';
import { extractYouTubeSource, AMBIENT_PRESETS } from '../../utils/youtube';
import { setAmbientSound, getAudioContext } from '../../utils/audio';

interface MediaTabProps {
  media: MediaSettings;
  onUpdateMedia: (newMedia: Partial<MediaSettings>) => void;
  onSelectPreset: (preset: AmbientSource) => void;
  inFloatingPip?: boolean;
  onDockBack?: () => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  media,
  onUpdateMedia,
  onSelectPreset,
  inFloatingPip = false,
  onDockBack,
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mediaType, setMediaType] = useState<'video' | 'soundscapes'>('video');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const { videoId, listId } = media.currentSource;

  // Build clean embed URL for YouTube. In Document PiP, origin parameters shouldn't contain encoded characters that trip up the internal parser.
  let embedUrl = '';
  if (listId && !videoId) {
    embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&autoplay=1&mute=${
      media.isMuted ? 1 : 0
    }&controls=1&loop=1&playsinline=1`;
  } else if (videoId) {
    const loopParam = listId ? `&list=${listId}` : `&playlist=${videoId}`;
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${
      media.isMuted ? 1 : 0
    }&controls=1&loop=1${loopParam}&playsinline=1`;
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
        ambientSoundVolume: media.ambientSoundVolume || 60,
      });
    }
  };

  const soundscapeList: {
    id: BuiltInAmbientSound;
    label: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'rain', label: 'Gentle Rain', desc: 'Relaxing rainfall soundscape', icon: CloudRain },
    { id: 'forest', label: 'Forest Breeze', desc: 'Calming woodland atmosphere', icon: Trees },
    { id: 'waves', label: 'Ocean Waves', desc: 'Rhythmic rolling sea tide', icon: Waves },
    { id: 'binaural', label: 'Alpha 432Hz', desc: 'Binaural wave for deep focus', icon: Headphones },
    { id: 'fireplace', label: 'Crackling Fire', desc: 'Cozy fireplace warmth', icon: Flame },
    { id: 'whitenoise', label: 'White Noise', desc: 'Smooth focus frequency mask', icon: Wind },
  ];

  const categories = ['All', 'Lofi', 'Rain & Nature', 'Space & Sci-Fi', 'Cozy', 'Atmospheric'];
  const filteredPresets =
    selectedCategory === 'All'
      ? AMBIENT_PRESETS
      : AMBIENT_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex flex-col w-full space-y-3.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
      {/* Media Mode Selector: Integrated YouTube Player vs Ambient Soundscapes */}
      <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl">
        <button
          onClick={() => setMediaType('video')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mediaType === 'video'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Ambient Video Player</span>
        </button>
        <button
          onClick={() => setMediaType('soundscapes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mediaType === 'soundscapes'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Ambient Soundscapes</span>
        </button>
      </div>

      {/* Embedded Video Screen or PiP Remote Controller */}
      {mediaType === 'video' ? (
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
                    {media.currentSource.title || 'Ambient Study Track'}
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

          {/* Quick Player Bar: Only show in Standard Mode (since PiP has dedicated controller) */}
          {!inFloatingPip && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold text-white truncate">
                    {media.currentSource.title || 'Tokyo Lofi Study Beats'}
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

          {/* Curated Presets Library */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Curated Focus Presets
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredPresets.map((preset) => {
                const isCurrent = media.currentSource.videoId === preset.videoId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      onUpdateMedia({ isMuted: false, isPlaying: true });
                    }}
                    className={`group relative overflow-hidden rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-end h-20 ${
                      isCurrent
                        ? 'border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                        : 'border-white/10 hover:border-white/30 bg-neutral-900/60'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity group-hover:scale-105 duration-500"
                      style={{ backgroundImage: `url(${preset.thumbnail})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

                    <div className="relative z-10 flex flex-col">
                      <span className="text-[9px] font-mono text-amber-300 font-semibold">{preset.tag}</span>
                      <span className="text-[11px] font-bold text-white leading-tight truncate">
                        {preset.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Built-in Ambient Soundscapes (Synthesized offline audio) */
        <div className="space-y-3">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Built-in Soundscapes</span>
              <span className="text-[10px] font-mono text-amber-300">100% Reliable Offline Audio</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Synthesized harmonic background audio for deep concentration, free from ads or playback interruptions.
            </p>

            {/* Volume Control for Ambient Sounds */}
            {media.ambientSound !== 'none' && (
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 font-mono w-14">
                  Vol {media.ambientSoundVolume}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={media.ambientSoundVolume}
                  onChange={(e) => onUpdateMedia({ ambientSoundVolume: parseInt(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {soundscapeList.map((item) => {
              const Icon = item.icon;
              const isPlaying = media.ambientSound === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectSoundscape(item.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isPlaying
                      ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className={`p-1.5 rounded-lg ${isPlaying ? 'bg-amber-400 text-neutral-950' : 'bg-white/10 text-white'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isPlaying ? 'text-amber-200' : 'text-white'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
