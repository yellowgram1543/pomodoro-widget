import React, { useState, useRef, useEffect } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import { MediaSettings, PlaylistItem } from '../../types';
import { extractYouTubeSource, fetchYouTubeTitle, truncateTitle } from '../../utils/youtube';
import { extractSpotifySource, fetchSpotifyTitle } from '../../utils/spotify';

interface MediaTabProps {
  media: MediaSettings;
  onUpdateMedia: (newMedia: Partial<MediaSettings>) => void;
  inFloatingPip?: boolean;
  onDockBack?: () => void;
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-4 h-4'} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.307c-.215.352-.676.463-1.028.248-2.822-1.724-6.375-2.114-10.562-1.158-.403.092-.803-.162-.895-.565-.092-.403.162-.803.565-.895 4.582-1.047 8.514-.602 11.672 1.342.352.215.463.676.248 1.028zm1.464-3.257c-.27.441-.85.58-1.291.31-3.23-1.986-8.156-2.56-11.977-1.4-.496.151-1.027-.132-1.178-.628-.151-.496.132-1.027.628-1.178 4.373-1.328 9.805-.688 13.508 1.589.441.27.58.85.31 1.291zm.126-3.41c-3.873-2.3-10.264-2.512-13.978-1.385-.595.18-1.229-.158-1.409-.753-.18-.595.158-1.229.753-1.409 4.265-1.295 11.317-1.048 15.787 1.606.535.318.708 1.01.39 1.545-.318.535-1.01.708-1.543.396z" />
    </svg>
  );
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const { videoId, listId, spotifyId, spotifyType, service } = media.currentSource;
  const isSpotify = service === 'spotify' || Boolean(spotifyId);

  // Build clean embed URL for YouTube with enablejsapi=1 for full remote postMessage synchronization
  let embedUrl = '';
  if (!isSpotify) {
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
  }

  // Handle postMessage commands for video volume and mute
  useEffect(() => {
    if (!iframeRef.current?.contentWindow || isSpotify) return;
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
  }, [media.isMuted, media.volume, media.isPlaying, isSpotify]);

  // Auto-resolve authentic titles for items with default/placeholder titles
  useEffect(() => {
    let isCancelled = false;

    if (media.currentSource.videoId) {
      const curTitle = media.currentSource.title || '';
      if (
        !curTitle ||
        curTitle.startsWith('Video:') ||
        curTitle.startsWith('Loading') ||
        curTitle.startsWith('Fetching') ||
        curTitle === media.currentSource.videoId
      ) {
        fetchYouTubeTitle(media.currentSource.videoId)
          .then((realTitle) => {
            if (realTitle && !isCancelled) {
              const truncated = truncateTitle(realTitle, 50);
              onUpdateMedia({
                currentSource: {
                  ...media.currentSource,
                  title: truncated,
                },
                playlist: media.playlist.map((p) =>
                  p.videoId === media.currentSource.videoId &&
                  (!p.title ||
                    p.title.startsWith('Video:') ||
                    p.title.startsWith('Loading') ||
                    p.title === p.videoId)
                    ? { ...p, title: truncated }
                    : p
                ),
              });
            }
          })
          .catch(() => {});
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [media.currentSource.videoId, media.playlist.length]);

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (!trimmed) return;

    const spotifySource = extractSpotifySource(trimmed);
    const youtubeSource = extractYouTubeSource(trimmed);

    if (!spotifySource.spotifyId && !youtubeSource.videoId && !youtubeSource.listId) {
      setInputError('Could not find a valid Spotify playlist/track or YouTube URL.');
      return;
    }

    setInputError(null);
    const userEnteredTitle = customTitle.trim();
    const newItemId = `queue-${Date.now()}`;

    if (spotifySource.spotifyId) {
      const initialTitle = userEnteredTitle
        ? truncateTitle(userEnteredTitle, 50)
        : `Spotify ${spotifySource.spotifyType || 'Playlist'}`;

      const newItem: PlaylistItem = {
        id: newItemId,
        url: trimmed,
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
        isMuted: false,
      });

      setCustomUrl('');
      setCustomTitle('');

      if (!userEnteredTitle) {
        fetchSpotifyTitle(trimmed, spotifySource.spotifyType || undefined).then((title) => {
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
      const { videoId: extractedVideoId, listId: extractedListId } = youtubeSource;
      const initialTitle = userEnteredTitle
        ? truncateTitle(userEnteredTitle, 50)
        : (extractedListId ? `Playlist: ${extractedListId}` : `Loading title...`);

      const newItem: PlaylistItem = {
        id: newItemId,
        url: trimmed,
        title: initialTitle,
        videoId: extractedVideoId,
        listId: extractedListId,
        service: 'youtube',
        addedAt: Date.now(),
      };

      onUpdateMedia({
        currentSource: {
          videoId: extractedVideoId,
          listId: extractedListId,
          spotifyId: null,
          spotifyType: null,
          service: 'youtube',
          title: initialTitle,
        },
        playlist: [...media.playlist, newItem],
        currentIndex: media.playlist.length,
        isPlaying: true,
        isMuted: false,
      });

      setCustomUrl('');
      setCustomTitle('');

      if (!userEnteredTitle) {
        fetchYouTubeTitle(trimmed)
          .then((fetchedTitle) => {
            if (fetchedTitle) {
              const truncated = truncateTitle(fetchedTitle, 50);
              onUpdateMedia({
                currentSource: {
                  videoId: extractedVideoId,
                  listId: extractedListId,
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
          })
          .catch(() => {});
      }
    }
  };

  const handlePlayQueueIndex = (index: number) => {
    const item = media.playlist[index];
    if (!item) return;

    onUpdateMedia({
      currentSource: {
        videoId: item.videoId || null,
        listId: item.listId || null,
        spotifyId: item.spotifyId || null,
        spotifyType: item.spotifyType || null,
        service: item.service || (item.spotifyId ? 'spotify' : 'youtube'),
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

  return (
    <div className="flex flex-col w-full space-y-3.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
      {/* Video & Stream Mode */}
      <div className="space-y-3">
        {inFloatingPip ? (
          /* Dedicated Always-on-Top Floating PiP Media Controller */
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#FCFAF6] border border-[#E2DBD0] shadow-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#E2DBD0] pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-end gap-0.5 h-3.5 px-1 py-0.5 bg-[#FBEBE8] rounded">
                  <span className="w-0.5 bg-[#C84B31] rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                  <span className="w-0.5 bg-[#C84B31] rounded-full animate-[bounce_1s_infinite_300ms] h-2" />
                  <span className="w-0.5 bg-[#C84B31] rounded-full animate-[bounce_1s_infinite_200ms] h-3.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#C84B31] uppercase tracking-wide">
                  Soundtrack Active
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isSpotify && spotifyId ? (
                  <a
                    href={`https://open.spotify.com/${spotifyType || 'playlist'}/${spotifyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md bg-[#EBF2ED] text-[#4A7C59] hover:bg-[#DCEDE0] text-[10px] flex items-center gap-1 transition-all font-medium border border-[#C2D8C9]"
                  >
                    <SpotifyIcon className="w-3 h-3" />
                    <span>Spotify</span>
                  </a>
                ) : videoId ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md bg-[#F0EAE1] hover:bg-[#E8E1D6] text-[#5C564C] hover:text-[#211F1C] text-[10px] flex items-center gap-1 transition-all border border-[#E2DBD0]"
                    title="Open full video in YouTube"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>YouTube</span>
                  </a>
                ) : null}

                {onDockBack && (
                  <button
                    onClick={onDockBack}
                    className="p-1 rounded-md bg-[#FBEBE8] hover:bg-[#F7DDD7] text-[#C84B31] text-[10px] font-bold flex items-center gap-1 transition-all border border-[#F2C2BA]"
                  >
                    <span>Dock</span>
                  </button>
                )}
              </div>
            </div>

            {/* Title & Play/Pause Banner */}
            <div className="flex items-center justify-between gap-3 bg-[#F6F3EB] p-2.5 rounded-xl border border-[#E2DBD0]">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[#211F1C] block truncate">
                  {truncateTitle(media.currentSource.title || 'Library Atmosphere', 50)}
                </span>
                <span className="text-[10px] text-[#8F877A] font-mono">
                  {media.isMuted ? 'Muted' : `Volume: ${media.volume}%`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onUpdateMedia({ isPlaying: !media.isPlaying })}
                  className="p-2 rounded-xl bg-[#C84B31] hover:bg-[#B53F27] text-[#FCFAF6] font-bold transition-all active:scale-95 shadow-sm"
                >
                  {media.isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                <button
                  onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
                  className={`p-2 rounded-xl border transition-all ${
                    media.isMuted
                      ? 'bg-[#FBEBE8] text-[#C84B31] border-[#F2C2BA]'
                      : 'bg-[#FCFAF6] text-[#5C564C] border-[#E2DBD0] hover:bg-[#F0EAE1]'
                  }`}
                  title={media.isMuted ? 'Unmute' : 'Mute'}
                >
                  {media.isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {media.playlist.length > 1 && (
                  <button
                    onClick={handleNextTrack}
                    className="p-2 bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl text-[#5C564C] transition-all"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#8F877A] font-mono">
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
                className="w-full accent-[#C84B31] h-1.5 bg-[#E2DBD0] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        ) : (
          /* Active Media Player Box (Standard Mode) */
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#211F1C] border border-[#E2DBD0] shadow-md group">
            {isSpotify && spotifyId ? (
              <div className="p-2 bg-[#191414]">
                <iframe
                  key={`spotify-embed-${spotifyId}`}
                  title="Spotify Player"
                  src={`https://open.spotify.com/embed/${spotifyType || 'playlist'}/${spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl w-full"
                />
              </div>
            ) : embedUrl ? (
              <div className="aspect-video w-full">
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
              </div>
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center text-[#8F877A] text-xs bg-[#F0EAE1]">
                <Tv className="w-8 h-8 stroke-1 mb-1 text-[#CFC5B6]" />
                <span>Paste a Spotify playlist or YouTube link below</span>
              </div>
            )}

            {/* Unmute Prompt Banner if Muted */}
            {!isSpotify && media.isMuted && embedUrl && (
              <button
                onClick={() => onUpdateMedia({ isMuted: false })}
                className="absolute top-2 right-2 z-10 px-2.5 py-1 bg-[#C84B31] hover:bg-[#B53F27] text-[#FCFAF6] text-[11px] font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all animate-bounce"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Tap to Unmute Audio</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Player Bar: Only show in Standard Mode */}
        {!inFloatingPip && (
          <div className="p-3 bg-[#FCFAF6] border border-[#E2DBD0] rounded-xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C59]" />
                </span>
                <span className="text-xs font-bold text-[#211F1C] truncate">
                  {truncateTitle(media.currentSource.title || 'Library Atmosphere', 50)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="btn-media-toggle-mute"
                  onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
                  className={`p-1.5 rounded-lg border transition-all ${
                    media.isMuted
                      ? 'bg-[#FBEBE8] text-[#C84B31] border-[#F2C2BA]'
                      : 'bg-[#F0EAE1] text-[#5C564C] border-[#E2DBD0] hover:bg-[#E8E1D6]'
                  }`}
                  title={media.isMuted ? 'Unmute' : 'Mute'}
                >
                  {media.isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                {media.playlist.length > 1 && (
                  <button
                    id="btn-media-skip-track"
                    onClick={handleNextTrack}
                    className="p-1.5 bg-[#F0EAE1] hover:bg-[#E8E1D6] border border-[#E2DBD0] rounded-lg text-[#5C564C] transition-all"
                    title="Next playlist track"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-[#8F877A] font-mono w-14">
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
                className="w-full accent-[#C84B31] h-1.5 bg-[#E2DBD0] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Custom URL Loader (Spotify & YouTube) */}
        <form onSubmit={handleApplyUrl} className="space-y-2 pt-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C564C]">
            Load Spotify Playlist / Track or YouTube Video
          </label>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FCFAF6] border border-[#E2DBD0] rounded-xl focus-within:border-[#C84B31] shadow-sm">
              <Link2 className="w-4 h-4 text-[#8F877A] shrink-0" />
              <input
                id="custom-media-url-input"
                type="text"
                placeholder="Paste Spotify link (open.spotify.com/...) or YouTube URL..."
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (inputError) setInputError(null);
                }}
                className="w-full bg-transparent text-xs text-[#211F1C] placeholder-[#8F877A] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Optional custom title label"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 bg-[#FCFAF6] border border-[#E2DBD0] rounded-lg px-2.5 py-1 text-xs text-[#211F1C] placeholder-[#8F877A] focus:outline-none shadow-sm"
              />
              <button
                id="btn-apply-media-url"
                type="submit"
                disabled={!customUrl.trim()}
                className="flex items-center gap-1 px-3 py-1 bg-[#C84B31] hover:bg-[#B53F27] disabled:opacity-40 disabled:hover:bg-[#C84B31] text-[#FCFAF6] font-bold text-xs rounded-lg transition-all shadow-sm"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Load</span>
              </button>
            </div>

            {inputError && <p className="text-[11px] text-[#C84B31] font-medium">{inputError}</p>}
          </div>
        </form>

        {/* Custom Playlist Queue */}
        {media.playlist.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C564C]">
              Saved Media Queue ({media.playlist.length})
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {media.playlist.map((item, idx) => {
                const isSpotifyItem = item.service === 'spotify' || Boolean(item.spotifyId);
                const isActive = media.currentIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => handlePlayQueueIndex(idx)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#FBEBE8] text-[#C84B31] border border-[#F2C2BA] font-bold shadow-sm'
                        : 'bg-[#FCFAF6] hover:bg-[#F6F3EB] text-[#5C564C] border border-[#E2DBD0]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isSpotifyItem ? (
                        <SpotifyIcon className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" />
                      ) : (
                        <Radio
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-[#C84B31]' : 'text-[#8F877A]'
                          }`}
                        />
                      )}
                      <span className="truncate">{truncateTitle(item.title, 50)}</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveQueueItem(item.id, e)}
                      className="p-1 text-[#8F877A] hover:text-[#C84B31] transition-colors ml-2"
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
    </div>
  );
};
