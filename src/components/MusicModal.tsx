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

  const activeSounds = media.activeAmbientSounds || {};
  const activeSoundCount = Object.entries(activeSounds).filter(([_, vol]) => (vol as number) > 0).length;

  const handleToggleSound = (soundId: BuiltInAmbientSound) => {
    getAudioContext();
    const currentVol = activeSounds[soundId] || 0;
    const newActive = { ...activeSounds };

    if (currentVol > 0) {
      delete newActive[soundId];
    } else {
      newActive[soundId] = 65;
    }

    const firstActive = Object.keys(newActive)[0] as BuiltInAmbientSound | undefined;

    onUpdateMedia({
      activeAmbientSounds: newActive,
      ambientSound: firstActive || 'none',
      isMuted: false,
    });
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#211F1C]/40 backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="music-hub-modal"
        className="w-full max-w-4xl bg-[#FCFAF6] border border-[#E2DBD0] rounded-2xl shadow-2xl overflow-hidden text-[#211F1C] flex flex-col max-h-[92vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#E2DBD0] bg-[#F6F3EB]">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full border-2 border-[#8E6F4E] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#8E6F4E]" />
              </div>
              <span className="font-bold text-base tracking-wide text-[#211F1C]">Soundscapes</span>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center bg-[#EFE9DF] p-1 rounded-lg border border-[#E2DBD0]">
              <button
                id="music-tab-sounds"
                onClick={() => setActiveTab('sounds')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'sounds'
                    ? 'bg-[#FCFAF6] text-[#C84B31] border border-[#D5CDC0] shadow-xs'
                    : 'text-[#6B6255] hover:text-[#211F1C]'
                }`}
              >
                Ambient Sounds ({ALL_AMBIENT_SOUNDS.length})
              </button>
              <button
                id="music-tab-mymusic"
                onClick={() => setActiveTab('my-music')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-music'
                    ? 'bg-[#FCFAF6] text-[#C84B31] border border-[#D5CDC0] shadow-xs'
                    : 'text-[#6B6255] hover:text-[#211F1C]'
                }`}
              >
                Music & Streams
              </button>
            </div>
          </div>

          <button
            id="close-music-hub-modal"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#6B6255] hover:text-[#211F1C] border border-[#E2DBD0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-[#FCFAF6]">
          {/* TAB 1: SOUNDS */}
          {activeTab === 'sounds' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#211F1C] tracking-tight">
                    Ambient Soundscapes
                  </h3>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Layer subtle environmental sounds to construct your ideal reading or deep work atmosphere.
                  </p>
                </div>

                <button
                  id="btn-turn-off-ambient-sound"
                  onClick={handleTurnOffAllSounds}
                  disabled={activeSoundCount === 0}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all border shrink-0 ${
                    activeSoundCount > 0
                      ? 'bg-[#C84B31]/10 border-[#C84B31]/40 text-[#C84B31] hover:bg-[#C84B31]/20 cursor-pointer shadow-xs'
                      : 'bg-[#F6F3EB] border-[#E2DBD0] text-[#9B9182] cursor-not-allowed opacity-50'
                  }`}
                >
                  {activeSoundCount > 0 ? `Turn Off Sounds (${activeSoundCount})` : 'Turn Off Sounds'}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#9B9182] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="ambient-search-sound-input"
                  type="text"
                  placeholder="Search ambient sounds by name (rain, birds, ocean, coffee, campfire, fan)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-[#F6F3EB] border border-[#DCD3C4] rounded-xl text-xs text-[#211F1C] placeholder-[#9B9182] focus:outline-none focus:border-[#C84B31] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9182] hover:text-[#211F1C] text-xs p-1 rounded-md flex items-center justify-center cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {SOUND_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`sound-cat-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C84B31] text-white shadow-xs font-semibold'
                          : 'bg-[#F6F3EB] hover:bg-[#EFE9DF] border border-[#E2DBD0] text-[#6B6255]'
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  );
                })}
              </div>

              {/* Soundscape Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {filteredSounds.map((sound) => {
                  const Icon = sound.icon;
                  const volume = activeSounds[sound.id] || 0;
                  const isActive = volume > 0;

                  return (
                    <div
                      key={sound.id}
                      id={`soundscape-card-${sound.id}`}
                      className={`relative flex flex-col items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#F6F3EB] border-[#C84B31] shadow-sm'
                          : 'bg-[#FCFAF6] border-[#E2DBD0] hover:bg-[#F6F3EB]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSound(sound.id)}
                        className="w-full flex flex-col items-center cursor-pointer focus:outline-none"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                            isActive
                              ? 'bg-[#C84B31]/15 text-[#C84B31] border border-[#C84B31]/40 scale-105'
                              : 'bg-[#F6F3EB] text-[#8E6F4E] group-hover:bg-[#EFE9DF]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <span
                          className={`text-xs font-bold leading-tight line-clamp-1 transition-colors ${
                            isActive ? 'text-[#C84B31]' : 'text-[#211F1C]'
                          }`}
                        >
                          {sound.label}
                        </span>
                      </button>

                      {isActive && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#C84B31]" />
                      )}

                      <div className="w-full mt-3 pt-1 border-t border-[#E2DBD0] flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className={isActive ? 'text-[#C84B31] font-semibold' : 'text-[#9B9182]'}>
                            {isActive ? 'Active' : 'Off'}
                          </span>
                          <span className={isActive ? 'text-[#C84B31] font-bold' : 'text-[#9B9182]'}>
                            {volume}%
                          </span>
                        </div>

                        <input
                          id={`vol-slider-${sound.id}`}
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) =>
                            handleSoundVolumeChange(sound.id, Number(e.target.value))
                          }
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#C84B31] bg-[#E5DFD5] focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSounds.length === 0 && (
                <div className="p-8 text-center bg-[#F6F3EB] rounded-xl border border-[#E2DBD0]">
                  <p className="text-xs text-[#6B6255]">No sounds found matching "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-2 text-xs text-[#C84B31] hover:underline cursor-pointer"
                  >
                    Reset search & filters
                  </button>
                </div>
              )}

              {/* Master Volume Bar at Bottom */}
              <div className="bg-[#F6F3EB] p-4 rounded-xl border border-[#E2DBD0] space-y-2 sticky bottom-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#211F1C] font-semibold">Master Soundscape Volume</span>
                    {activeSoundCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C84B31]/10 text-[#C84B31] border border-[#C84B31]/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{activeSoundCount} active</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[#C84B31] font-mono font-bold">
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
                  className="w-full h-1.5 bg-[#E5DFD5] rounded-lg appearance-none cursor-pointer accent-[#C84B31]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MY MUSIC */}
          {activeTab === 'my-music' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#F6F3EB] p-5 rounded-xl border border-[#E2DBD0] space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#211F1C]">Custom Playlists & Streams</h3>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Paste any Spotify playlist/track link or YouTube study stream URL.
                  </p>
                </div>

                <form onSubmit={handleApplyCustomUrl} className="space-y-2.5">
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
                        className="w-full pl-3.5 pr-20 py-2 rounded-lg bg-[#FCFAF6] border border-[#DCD3C4] text-xs text-[#211F1C] placeholder-[#9B9182] focus:outline-none focus:border-[#C84B31] transition-colors"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#9B9182]">
                        <SpotifyIcon className="w-3.5 h-3.5" />
                        <Disc3 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <input
                      id="music-modal-title-input"
                      type="text"
                      placeholder="Optional custom title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3.5 py-1.5 rounded-lg bg-[#FCFAF6] border border-[#DCD3C4] text-xs text-[#211F1C] placeholder-[#9B9182] focus:outline-none focus:border-[#C84B31] transition-colors"
                    />
                  </div>

                  {inputError && (
                    <p className="text-xs text-[#C84B31] font-medium">{inputError}</p>
                  )}

                  <button
                    type="submit"
                    id="music-modal-load-btn"
                    disabled={!customUrl.trim()}
                    className="px-4 py-2 rounded-lg bg-[#8E6F4E] hover:bg-[#785E42] disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Load & Play</span>
                  </button>
                </form>
              </div>

              {/* Active Stream Card */}
              {isSpotifyCurrent && media.currentSource.spotifyId ? (
                <div className="bg-[#F6F3EB] p-4 rounded-xl border border-[#E2DBD0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SpotifyIcon className="w-4 h-4 text-[#4A7C59]" />
                      <span className="text-xs font-bold text-[#211F1C]">
                        Spotify Player ({media.currentSource.spotifyType || 'Playlist'})
                      </span>
                    </div>
                    <a
                      href={`https://open.spotify.com/${media.currentSource.spotifyType || 'playlist'}/${media.currentSource.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#4A7C59] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Open in Spotify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="w-full rounded-lg overflow-hidden shadow-sm bg-black">
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
                <div className="bg-[#F6F3EB] p-4 rounded-xl border border-[#E2DBD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-[#8E6F4E]/15 border border-[#8E6F4E]/25 text-[#8E6F4E] shrink-0">
                      <Music2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#8E6F4E] tracking-wider block">
                        Now Playing
                      </span>
                      <span className="text-xs font-bold text-[#211F1C] block truncate max-w-sm">
                        {truncateTitle(media.currentSource.title || 'Ambient Stream', 50)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      id="music-modal-mute-btn"
                      onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
                      className="p-1.5 rounded-lg bg-[#FCFAF6] border border-[#E2DBD0] hover:bg-[#EFE9DF] text-[#6B6255] transition-colors cursor-pointer"
                      title={media.isMuted ? 'Unmute' : 'Mute'}
                    >
                      {media.isMuted ? (
                        <VolumeX className="w-4 h-4 text-[#C84B31]" />
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
                        className="w-24 h-1.5 bg-[#E5DFD5] rounded-lg appearance-none cursor-pointer accent-[#8E6F4E]"
                      />
                      <span className="text-[10px] font-mono text-[#6B6255] w-8 text-right">
                        {media.isMuted ? '0%' : `${media.volume}%`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Playlist Queue */}
              {media.playlist.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E6F4E]">
                      Saved Queue ({media.playlist.length})
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
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isActive
                              ? 'bg-[#FCFAF6] border-[#C84B31] text-[#211F1C] shadow-xs'
                              : 'bg-[#F6F3EB] border-[#E2DBD0] text-[#6B6255] hover:bg-[#EFE9DF]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-mono text-[#9B9182] w-4">
                              {idx + 1}
                            </span>
                            {isSpotifyItem ? (
                              <SpotifyIcon className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" />
                            ) : (
                              <Disc3 className="w-3.5 h-3.5 text-[#8E6F4E] shrink-0" />
                            )}
                            <span className="font-semibold truncate max-w-sm text-[#211F1C]">
                              {truncateTitle(item.title, 50)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isActive && (
                              <span className="text-[10px] font-bold text-[#C84B31] px-2 py-0.5 rounded bg-[#C84B31]/10">
                                Active
                              </span>
                            )}
                            <button
                              id={`remove-queue-item-${item.id}`}
                              onClick={(e) => handleRemoveQueueItem(item.id, e)}
                              className="p-1 rounded text-[#9B9182] hover:text-[#C84B31] hover:bg-[#C84B31]/10 transition-colors cursor-pointer"
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
