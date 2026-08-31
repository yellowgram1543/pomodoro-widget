import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  EyeOff,
  Settings,
  Music2,
} from 'lucide-react';
import { MediaSettings, AmbientSource, TabType, SettingsCategory } from '../types';
import { AMBIENT_PRESETS, truncateTitle } from '../utils/youtube';

interface TopBarProps {
  media: MediaSettings;
  onUpdateMedia: (m: Partial<MediaSettings>) => void;
  onSelectPreset: (preset: AmbientSource) => void;
  isZenMode: boolean;
  setIsZenMode: (v: boolean) => void;
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  onOpenSettings?: (cat: SettingsCategory) => void;
  onOpenMusic?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  media,
  onUpdateMedia,
  onSelectPreset,
  isZenMode,
  setIsZenMode,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenMusic,
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
      <div className="flex items-center gap-3.5 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#FCFAF6] border border-[#E2DBD0] rounded-xl shadow-[0_2px_8px_rgba(40,30,20,0.06)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C84B31]" />
          <span className="text-xs font-bold tracking-tight text-[#211F1C] font-heading">
            Manga Focus
          </span>
          <span className="text-[#CFC5B6] text-xs">/</span>
          <span className="text-xs font-mono font-medium text-[#5C564C]">
            {currentTime}
          </span>
        </div>

        {/* Quick Atmosphere Selector */}
        <div className="relative">
          <button
            id="btn-topbar-atmosphere"
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl text-xs font-medium text-[#211F1C] transition-all shadow-[0_2px_8px_rgba(40,30,20,0.06)]"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C84B31]" />
            <span className="truncate max-w-[140px]">
              {truncateTitle(media.currentSource.title || 'Ambience', 50)}
            </span>
          </button>

          {showPresetMenu && (
            <div className="absolute top-11 left-0 w-64 p-2 bg-[#FCFAF6] border border-[#E2DBD0] rounded-xl shadow-[0_12px_28px_rgba(40,30,20,0.12)] space-y-1 z-30">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8F877A]">
                Library Ambience Switcher
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                {AMBIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowPresetMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                      media.currentSource.videoId === preset.videoId
                        ? 'bg-[#F0EAE1] text-[#C84B31] font-bold border border-[#E2DBD0]'
                        : 'hover:bg-[#F0EAE1] text-[#5C564C]'
                    }`}
                  >
                    <span className="truncate">{truncateTitle(preset.title, 50)}</span>
                    <span className="text-[10px] text-[#8F877A] font-mono">
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          id="btn-topbar-music"
          onClick={() => onOpenMusic?.()}
          className="p-2 bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl text-[#211F1C] hover:text-[#C84B31] transition-all shadow-[0_2px_8px_rgba(40,30,20,0.06)]"
          title="Soundscapes & Audio Mixer"
        >
          <Music2 className="w-4 h-4" />
        </button>

        <button
          id="btn-topbar-settings"
          onClick={() => onOpenSettings?.('pomodoro')}
          className="p-2 bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl text-[#211F1C] hover:text-[#C84B31] transition-all shadow-[0_2px_8px_rgba(40,30,20,0.06)]"
          title="Settings & Themes"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          id="btn-topbar-mute-toggle"
          onClick={() => onUpdateMedia({ isMuted: !media.isMuted })}
          className={`p-2 rounded-xl border transition-all shadow-[0_2px_8px_rgba(40,30,20,0.06)] ${
            media.isMuted
              ? 'bg-[#FBEBE8] text-[#C84B31] border-[#F2C2BA]'
              : 'bg-[#FCFAF6] hover:bg-[#F0EAE1] text-[#211F1C] border-[#E2DBD0]'
          }`}
          title={media.isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {media.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          id="btn-topbar-zen-mode"
          onClick={() => setIsZenMode(!isZenMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all shadow-[0_2px_8px_rgba(40,30,20,0.06)] text-xs font-bold ${
            isZenMode
              ? 'bg-[#C84B31] text-[#FCFAF6] border-[#C84B31]'
              : 'bg-[#FCFAF6] hover:bg-[#F0EAE1] text-[#211F1C] border-[#E2DBD0]'
          }`}
          title="Toggle Zen Mode"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Zen Mode</span>
        </button>

        <button
          id="btn-topbar-fullscreen"
          onClick={toggleFullscreen}
          className="p-2 bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl text-[#211F1C] transition-all shadow-[0_2px_8px_rgba(40,30,20,0.06)]"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
