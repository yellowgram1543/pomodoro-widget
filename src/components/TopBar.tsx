import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  EyeOff,
  Radio,
  Clock,
  Layers,
} from 'lucide-react';
import { MediaSettings, AmbientSource, TabType } from '../types';
import { AMBIENT_PRESETS } from '../utils/youtube';

interface TopBarProps {
  media: MediaSettings;
  onUpdateMedia: (m: Partial<MediaSettings>) => void;
  onSelectPreset: (preset: AmbientSource) => void;
  isZenMode: boolean;
  setIsZenMode: (v: boolean) => void;
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  media,
  onUpdateMedia,
  onSelectPreset,
  isZenMode,
  setIsZenMode,
  activeTab,
  setActiveTab,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 pointer-events-none">
      {/* App Branding & Current Clock */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-neutral-950/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold tracking-tight text-white font-sans">
            Ambient Focus
          </span>
          <span className="text-neutral-500 text-xs">|</span>
          <span className="text-xs font-mono font-medium text-neutral-300">
            {currentTime}
          </span>
        </div>

        {/* Quick Atmosphere Selector Pill */}
        <div className="relative">
          <button
            id="btn-topbar-atmosphere"
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950/60 hover:bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-xs text-neutral-200 transition-all shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[140px]">
              {media.currentSource.title || 'Ambience'}
            </span>
          </button>

          {showPresetMenu && (
            <div className="absolute top-10 left-0 w-64 p-2 bg-neutral-950/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Quick Ambience Switcher
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                {AMBIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowPresetMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                      media.currentSource.videoId === preset.videoId
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <span className="truncate">{preset.title}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Mute, Zen Mode, Fullscreen */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          id="btn-topbar-mute-toggle"
          onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
          className={`p-2 rounded-xl backdrop-blur-xl border transition-all shadow-lg ${
            media.isMuted
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-neutral-950/60 hover:bg-neutral-900/80 text-neutral-200 border-white/10'
          }`}
          title={media.isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
        >
          {media.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          id="btn-topbar-zen-mode"
          onClick={() => setIsZenMode(!isZenMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all shadow-lg text-xs font-semibold ${
            isZenMode
              ? 'bg-amber-500 text-neutral-950 border-amber-400'
              : 'bg-neutral-950/60 hover:bg-neutral-900/80 text-neutral-200 border-white/10'
          }`}
          title="Toggle Zen Mode (Hide floating widgets)"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Zen Mode</span>
        </button>

        <button
          id="btn-topbar-fullscreen"
          onClick={toggleFullscreen}
          className="p-2 bg-neutral-950/60 hover:bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-xl text-neutral-200 transition-all shadow-lg"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
