import React, { useState } from 'react';
import {
  X,
  Music2,
  Volume2,
  VolumeX,
  Play,
  Trash2,
  Disc3,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  MediaSettings,
  PlaylistItem,
  BuiltInAmbientSound,
} from '../types';
import {
  extractYouTubeSource,
  fetchYouTubeTitle,
  truncateTitle,
} from '../utils/youtube';
import {
  extractSpotifySource,
  fetchSpotifyTitle,
} from '../utils/spotify';
import { getAudioContext } from '../utils/audio';
import {
  ALL_AMBIENT_SOUNDS,
  SOUND_CATEGORIES,
} from '../data/ambientSounds';

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaSettings;
  onUpdateMedia: (updates: Partial<MediaSettings>) => void;
}

type AudioSubTab = 'sounds' | 'my-music';

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-4 h-4'} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.307c-.215.352-.676.463-1.028.248-2.822-1.724-6.375-2.114-10.562-1.158-.403.092-.803-.162-.895-.565-.092-.403.162-.803.565-.895 4.582-1.047 8.514-.602 11.672 1.342.352.215.463.676.248 1.028zm1.464-3.257c-.27.441-.85.58-1.291.31-3.23-1.986-8.156-2.56-11.977-1.4-.496.151-1.027-.132-1.178-.628-.151-.496.132-1.027.628-1.178 4.373-1.328 9.805-.688 13.508 1.589.441.27.58.85.31 1.291zm.126-3.41c-3.873-2.3-10.264-2.512-13.978-1.385-.595.18-1.229-.158-1.409-.753-.18-.595.158-1.229.753-1.409 4.265-1.295 11.317-1.048 15.787 1.606.535.318.708 1.01.39 1.545-.318.535-1.01.708-1.543.396z" />
    </svg>
  );
}

export const MusicModal: React.FC<MusicModalProps> = ({
  isOpen,
  onClose,
  media,
  onUpdateMedia,
}) => {
  const [activeTab, setActiveTab] = useState<AudioSubTab>('sounds');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active sounds map: { [soundId]: volume (0-100) }
  const activeSounds = media.activeAmbientSounds || {};
  const activeSoundCount = Object.entries(activeSounds).filter(([_, vol]) => (vol as number) > 0).length;

  // Toggle individual sound on / off
  const handleToggleSound = (soundId: BuiltInAmbientSound) => {
    getAudioContext();
    const currentVol = activeSounds[soundId] || 0;
    const newActive = { ...activeSounds };

    if (currentVol > 0) {
      delete newActive[soundId];
    } else {
      newActive[soundId] = 65; // Default initial volume
    }

    const firstActive = Object.keys(newActive)[0] as BuiltInAmbientSound | undefined;

    onUpdateMedia({
      activeAmbientSounds: newActive,
      ambientSound: firstActive || 'none',
      isMuted: false,
    });
  };

  // Change individual sound volume (0 to 100)
  const handleSoundVolumeChange = (soundId: BuiltInAmbientSound, newVol: number) => {
    getAudioContext();
    const newActive = { ...activeSounds };

    if (newVol <= 0) {
      delete newActive[soundId];
    } else {
      newActive[soundId] = newVol;
    }

    const firstActive = Object.keys(newActive)[0] as BuiltInAmbientSound | undefined;

    onUpdateMedia({
      activeAmbientSounds: newActive,
      ambientSound: firstActive || 'none',
      isMuted: false,
    });
  };

  // Turn off all playing ambient sounds
  const handleTurnOffAllSounds = () => {
    onUpdateMedia({
      activeAmbientSounds: {},
      ambientSound: 'none',
    });
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = customUrl.trim();
    if (!trimmedUrl) return;

    const spotifySource = extractSpotifySource(trimmedUrl);
    const youtubeSource = extractYouTubeSource(trimmedUrl);

    if (!spotifySource.spotifyId && !youtubeSource.videoId && !youtubeSource.listId) {
      setInputError('Please enter a valid Spotify link or YouTube URL.');
      return;
    }

    setInputError(null);
    const userEnteredTitle = customTitle.trim();
    const newItemId = `queue-${Date.now()}`;

    if (spotifySource.spotifyId) {
      const initialTitle = userEnteredTitle
        ? truncateTitle(userEnteredTitle, 50)
        : `Spotify ${spotifySource.spotifyType || 'Track'}`;

      const newItem: PlaylistItem = {
        id: newItemId,
        url: trimmedUrl,
        title: initialTitle,
        spotifyId: spotifySource.spotifyId,
        spotifyType: spotifySource.spotifyType,
        service: 'spotify',
        addedAt: Date.now(),
      };

      onUpdateMedia({
        currentSource: {
          videoId: null,
          listId: null,
          spotifyId: spotifySource.spotifyId,
          spotifyType: spotifySource.spotifyType,
          service: 'spotify',
          title: initialTitle,
        },
        playlist: [...media.playlist, newItem],
        currentIndex: media.playlist.length,
        isPlaying: true,
      });

      setCustomUrl('');
      setCustomTitle('');

      if (!userEnteredTitle) {
        fetchSpotifyTitle(trimmedUrl, spotifySource.spotifyType || undefined).then((title) => {
          if (title) {
            const cleanTitle = truncateTitle(title, 50);
            onUpdateMedia({
              currentSource: {
                videoId: null,
                listId: null,
                spotifyId: spotifySource.spotifyId,
                spotifyType: spotifySource.spotifyType,
                service: 'spotify',
                title: cleanTitle,
              },
              playlist: media.playlist
                .concat(newItem)
                .map((item) => (item.id === newItemId ? { ...item, title: cleanTitle } : item)),
            });
          }
        });
      }
    } else {
      // YouTube link
      const { videoId, listId } = youtubeSource;
      const initialTitle = userEnteredTitle
        ? truncateTitle(userEnteredTitle, 50)
        : (listId ? `Playlist: ${listId}` : 'Loading title...');

      const newItem: PlaylistItem = {
        id: newItemId,
        url: trimmedUrl,
        title: initialTitle,
        videoId,
        listId,
        service: 'youtube',
        addedAt: Date.now(),
      };

      onUpdateMedia({
        currentSource: {
          videoId,
          listId,
          spotifyId: null,
          spotifyType: null,
          service: 'youtube',
          title: initialTitle,
        },
        playlist: [...media.playlist, newItem],
        currentIndex: media.playlist.length,
        isPlaying: true,
      });

      setCustomUrl('');
      setCustomTitle('');

      if (!userEnteredTitle) {
        fetchYouTubeTitle(trimmedUrl).then((fetchedTitle) => {
          if (fetchedTitle) {
            const truncated = truncateTitle(fetchedTitle, 50);
            onUpdateMedia({
              currentSource: {
                videoId,
                listId,
                spotifyId: null,
                spotifyType: null,
                service: 'youtube',
                title: truncated,
              },
              playlist: media.playlist
                .concat(newItem)
                .map((item) => (item.id === newItemId ? { ...item, title: truncated } : item)),
            });
          }
        });
      }
    }
  };

  const handleRemoveQueueItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPlaylist = media.playlist.filter((item) => item.id !== id);
    onUpdateMedia({ playlist: newPlaylist });
  };

  const handleSelectQueueItem = (index: number) => {
    const item = media.playlist[index];
    if (!item) return;

    onUpdateMedia({
      currentSource: {
        videoId: item.videoId || null,
        listId: item.listId || null,
        spotifyId: item.spotifyId || null,
        spotifyType: item.spotifyType || null,
        service: item.service || (item.spotifyId ? 'spotify' : 'youtube'),
        title: truncateTitle(item.title, 50),
      },
      currentIndex: index,
      isPlaying: true,
    });
  };

  const isSpotifyCurrent =
    media.currentSource.service === 'spotify' || Boolean(media.currentSource.spotifyId);

  // Filter sounds based on category and search query
  const filteredSounds = ALL_AMBIENT_SOUNDS.filter((sound) => {
    const matchesCategory =
      selectedCategory === 'all' || sound.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      sound.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sound.tag && sound.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      id="music-hub-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="music-hub-modal"
        className="w-full max-w-4xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Audio Icon & Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <span className="font-bold text-base tracking-wide text-white">Audio Hub</span>
            </div>

            {/* Sub-Tabs: Sounds vs My Music */}
            <div className="flex items-center bg-[#1c1c1c] p-1 rounded-xl border border-white/5">
              <button
                id="music-tab-sounds"
                onClick={() => setActiveTab('sounds')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'sounds'
                    ? 'bg-[#2e230f] text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sounds ({ALL_AMBIENT_SOUNDS.length})
              </button>
              <button
                id="music-tab-mymusic"
                onClick={() => setActiveTab('my-music')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'my-music'
                    ? 'bg-[#2e230f] text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                My Music
              </button>
            </div>
          </div>

          <button
            id="close-music-hub-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-[#121212]">
          {/* TAB 1: SOUNDS */}
          {activeTab === 'sounds' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Header Title + Turn Off All Sound Button */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Ambient Soundscapes
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Mix multiple simultaneous sounds (rain, campfire, birds, waves) to create your custom focus environment.
                  </p>
                </div>

                <button
                  id="btn-turn-off-ambient-sound"
                  onClick={handleTurnOffAllSounds}
                  disabled={activeSoundCount === 0}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all border shrink-0 ${
                    activeSoundCount > 0
                      ? 'bg-[#3b1219] border-rose-900/70 text-rose-400 hover:bg-[#4f1822] cursor-pointer shadow-sm'
                      : 'bg-white/5 border-white/10 text-neutral-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {activeSoundCount > 0 ? `Turn Off Sound (${activeSoundCount})` : 'Turn Off Sound'}
                </button>
              </div>

              {/* 1. Uncluttered Search Sound Bar Placed Above Categories */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="ambient-search-sound-input"
                  type="text"
                  placeholder="Search ambient sounds by name (rain, birds, ocean, coffee, campfire, fan)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-[#181818] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/70 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs p-1 rounded-md"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 2. Category Filter Pills Row Below Search */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {SOUND_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`sound-cat-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-sm font-semibold'
                          : 'bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  );
                })}
              </div>

              {/* 3. Soundscape Cards Grid (Custom Layout matching User Sketch) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {filteredSounds.map((sound) => {
                  const Icon = sound.icon;
                  const volume = activeSounds[sound.id] || 0;
                  const isActive = volume > 0;

                  return (
                    <div
                      key={sound.id}
                      id={`soundscape-card-${sound.id}`}
                      className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#1a160e] border-amber-500/80 shadow-lg shadow-amber-500/10'
                          : 'bg-[#181818] border-white/5 hover:border-white/15 hover:bg-[#1e1e1e]'
                      }`}
                    >
                      {/* Top Clickable Zone: Toggles Sound ON/OFF */}
                      <button
                        type="button"
                        onClick={() => handleToggleSound(sound.id)}
                        className="w-full flex flex-col items-center cursor-pointer focus:outline-none"
                      >
                        {/* Circular Icon Badge */}
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-all ${
                            isActive
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/60 shadow-md shadow-amber-500/20 scale-105'
                              : 'bg-[#242424] text-neutral-400 group-hover:text-neutral-200 group-hover:bg-[#2b2b2b]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Clean Sound Name (No Description!) */}
                        <span
                          className={`text-xs font-bold leading-tight line-clamp-1 transition-colors ${
                            isActive ? 'text-amber-300' : 'text-white'
                          }`}
                        >
                          {sound.label}
                        </span>
                      </button>

                      {/* Active Glowing Dot */}
                      {isActive && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
                      )}

                      {/* Bottom Individual Volume Slider Bar matching Sketch */}
                      <div className="w-full mt-3 pt-1 border-t border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className={isActive ? 'text-amber-400 font-semibold' : 'text-neutral-500'}>
                            {isActive ? 'Active' : 'Off'}
                          </span>
                          <span className={isActive ? 'text-amber-400 font-bold' : 'text-neutral-500'}>
                            {volume}%
                          </span>
                        </div>

                        {/* Customized Orange Volume Slider */}
                        <input
                          id={`vol-slider-${sound.id}`}
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) =>
                            handleSoundVolumeChange(sound.id, Number(e.target.value))
                          }
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-neutral-800 focus:outline-none transition-all"
                          style={{
                            accentColor: '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSounds.length === 0 && (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-neutral-400">No sounds found matching "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-2 text-xs text-amber-400 hover:underline"
                  >
                    Reset search & filters
                  </button>
                </div>
              )}

              {/* Master Volume Bar at Bottom */}
              <div className="bg-[#181818] p-4 rounded-xl border border-white/5 space-y-2.5 sticky bottom-0 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-300 font-semibold">Master Soundscape Volume</span>
                    {activeSoundCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{activeSoundCount} sound{activeSoundCount > 1 ? 's' : ''} mixed</span>
                      </span>
                    )}
                  </div>
                  <span className="text-amber-400 font-mono font-bold">
                    {media.ambientSoundVolume}%
                  </span>
                </div>
                <input
                  id="slider-master-soundscape-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={media.ambientSoundVolume}
                  onChange={(e) =>
                    onUpdateMedia({
                      ambientSoundVolume: Number(e.target.value),
                      isMuted: Number(e.target.value) === 0,
                    })
                  }
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  style={{ accentColor: '#f59e0b' }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: MY MUSIC (Spotify & YouTube Streams) */}
          {activeTab === 'my-music' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Input Form for Spotify or YouTube */}
              <div className="bg-[#181818] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Custom Playlists & Tracks</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-black uppercase tracking-wider">
                        Spotify & YouTube
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Paste any Spotify track/playlist/album link or YouTube study stream URL.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleApplyCustomUrl} className="space-y-3">
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        id="music-modal-url-input"
                        type="text"
                        placeholder="Paste Spotify link (open.spotify.com/...) or YouTube link..."
                        value={customUrl}
                        onChange={(e) => {
                          setCustomUrl(e.target.value);
                          if (inputError) setInputError(null);
                        }}
                        className="w-full pl-4 pr-24 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-neutral-500">
                        <SpotifyIcon className="w-3.5 h-3.5" />
                        <Disc3 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <input
                      id="music-modal-title-input"
                      type="text"
                      placeholder="Optional custom title (auto-detected if empty)"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {inputError && (
                    <p className="text-xs text-rose-400 font-medium">{inputError}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      id="music-modal-load-btn"
                      disabled={!customUrl.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Load & Play</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Embedded Player Card */}
              {isSpotifyCurrent && media.currentSource.spotifyId ? (
                /* Spotify Embedded Interactive Player */
                <div className="bg-[#181818] p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SpotifyIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Spotify Web Player ({media.currentSource.spotifyType || 'Playlist'})
                      </span>
                    </div>
                    <a
                      href={`https://open.spotify.com/${media.currentSource.spotifyType || 'playlist'}/${media.currentSource.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Open in Spotify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="w-full rounded-xl overflow-hidden shadow-xl bg-black">
                    <iframe
                      key={`spotify-${media.currentSource.spotifyId}`}
                      src={`https://open.spotify.com/embed/${media.currentSource.spotifyType || 'playlist'}/${media.currentSource.spotifyId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                /* Standard Track Player Card */
                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      <Music2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                        Now Playing
                      </span>
                      <span className="text-xs font-bold text-white block truncate max-w-sm">
                        {truncateTitle(media.currentSource.title || 'Ambient Stream', 50)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      id="music-modal-mute-btn"
                      onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                      title={media.isMuted ? 'Unmute' : 'Mute'}
                    >
                      {media.isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={media.isMuted ? 0 : media.volume}
                        onChange={(e) =>
                          onUpdateMedia({ volume: Number(e.target.value), isMuted: false })
                        }
                        className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
                        {media.isMuted ? '0%' : `${media.volume}%`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Playlist Queue */}
              {media.playlist.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Saved Playlist Queue ({media.playlist.length})
                    </h4>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar">
                    {media.playlist.map((item, idx) => {
                      const isSpotifyItem = item.service === 'spotify' || Boolean(item.spotifyId);
                      const isActive = isSpotifyItem
                        ? media.currentSource.spotifyId === item.spotifyId
                        : media.currentSource.videoId === item.videoId ||
                          media.currentSource.listId === item.listId;

                      return (
                        <div
                          key={item.id}
                          id={`queue-item-${item.id}`}
                          onClick={() => handleSelectQueueItem(idx)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isActive
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                              : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-mono text-neutral-500 w-4">
                              {idx + 1}
                            </span>
                            {isSpotifyItem ? (
                              <SpotifyIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Disc3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span className="font-semibold truncate max-w-sm">
                              {truncateTitle(item.title, 50)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isActive && (
                              <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                                Active
                              </span>
                            )}
                            <button
                              id={`remove-queue-item-${item.id}`}
                              onClick={(e) => handleRemoveQueueItem(item.id, e)}
                              className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
