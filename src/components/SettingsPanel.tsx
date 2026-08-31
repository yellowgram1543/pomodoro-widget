import React, { useState } from 'react';
import {
  X,
  Clock,
  Timer as TimerIcon,
  Volume2,
  VolumeX,
  Palette,
  Keyboard,
  RotateCcw,
  Sparkles,
  Check,
  Play,
  Sliders,
  Info,
  BookOpen,
} from 'lucide-react';
import {
  PomodoroSettings,
  PomodoroState,
  TaskTimerState,
  MediaSettings,
  SettingsCategory,
  AlarmSound,
  ClockTimerStyle,
  PomodoroTimerStyle,
  AppearanceSettings,
  BackgroundThemeId,
} from '../types';
import { playChime } from '../utils/audio';
import { CLOCK_TIMER_STYLES } from '../utils/timerThemes';
import { POMO_TIMER_STYLES } from '../utils/pomoTimerStyles';
import { THEME_PRESETS } from '../utils/themePresets';
import { AMBIENT_PRESETS, extractYouTubeSource, fetchYouTubeTitle, truncateTitle } from '../utils/youtube';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: SettingsCategory;
  pomoSettings: PomodoroSettings;
  onUpdatePomoSettings: (newSettings: Partial<PomodoroSettings>) => void;
  pomoState: PomodoroState;
  onUpdatePomoState: (newState: Partial<PomodoroState>) => void;
  taskTimer: TaskTimerState;
  onUpdateTaskTimer: (newTimer: Partial<TaskTimerState>) => void;
  media: MediaSettings;
  onUpdateMedia: (newMedia: Partial<MediaSettings>) => void;
  clockTimerStyle?: ClockTimerStyle;
  onUpdateClockTimerStyle?: (style: ClockTimerStyle) => void;
  pomoTimerStyle?: PomodoroTimerStyle;
  onUpdatePomoTimerStyle?: (style: PomodoroTimerStyle) => void;
  appearanceSettings?: AppearanceSettings;
  onUpdateAppearance?: (newAppearance: Partial<AppearanceSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  initialCategory = 'pomodoro',
  pomoSettings,
  onUpdatePomoSettings,
  pomoState,
  onUpdatePomoState,
  taskTimer,
  onUpdateTaskTimer,
  media: _media,
  onUpdateMedia: _onUpdateMedia,
  clockTimerStyle = 'default',
  onUpdateClockTimerStyle,
  pomoTimerStyle = 'default',
  onUpdatePomoTimerStyle,
  appearanceSettings = {
    backgroundMode: 'theme',
    activeTheme: 'mangaKissaten',
    customBackgroundUrl: null,
    customBackgroundOverlay: 0,
    videoBackgroundId: null,
    videoBackgroundTitle: null,
    videoMuted: true,
  },
  onUpdateAppearance,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory);
  const [isDragOver, setIsDragOver] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [videoCategory, setVideoCategory] = useState<string>('All');
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [videoSavedSuccess, setVideoSavedSuccess] = useState<boolean>(false);
  const [videoInputError, setVideoInputError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSaveVideoUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customVideoUrl.trim()) return;
    const { videoId } = extractYouTubeSource(customVideoUrl);
    if (!videoId) {
      setVideoInputError('Please enter a valid YouTube video URL or ID.');
      return;
    }
    setVideoInputError(null);
    onUpdateAppearance?.({
      backgroundMode: 'video',
      videoBackgroundId: videoId,
      videoBackgroundTitle: 'Loading title...',
      customBackgroundUrl: null,
    });
    setVideoSavedSuccess(true);
    setTimeout(() => setVideoSavedSuccess(false), 2000);

    const targetUrl = customVideoUrl.trim();
    fetchYouTubeTitle(targetUrl).then((fetchedTitle) => {
      if (fetchedTitle) {
        onUpdateAppearance?.({
          videoBackgroundTitle: truncateTitle(fetchedTitle, 50),
        });
      }
    }).catch(() => {});
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, HEIC)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateAppearance?.({
          customBackgroundUrl: dataUrl,
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderThemeCardVisual = (themeId: BackgroundThemeId) => {
    switch (themeId) {
      case 'mangaKissaten':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#F6F3EB] via-[#ECE6D9] to-[#DFD6C5] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#8E6F4E]/20 border border-[#8E6F4E]/30" />
          </div>
        );
      case 'tankobonPages':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#FAF8F3] via-[#F2EDE2] to-[#E5DDCF] flex items-center justify-center">
            <div className="w-9 h-6 border-y border-[#211F1C]/20 flex flex-col justify-between py-1">
              <div className="w-full h-[1px] bg-[#211F1C]/20" />
              <div className="w-3/4 h-[1px] bg-[#211F1C]/20" />
            </div>
          </div>
        );
      case 'cedarStudy':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-[#EFEAE0] via-[#E2D8C7] to-[#C9B9A2] flex items-center justify-center">
            <div className="w-10 h-7 border border-[#8E6F4E]/30 rounded bg-[#8E6F4E]/10" />
          </div>
        );
      case 'washiSumi':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#F5F2EA] via-[#E8E2D5] to-[#D5CDC0] flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-[#211F1C]/15 blur-[1px]" />
          </div>
        );
      case 'matchaReading':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-[#F4F5EE] via-[#E2E8D8] to-[#CBD8BE] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#4A7C59]/25 border border-[#4A7C59]/30" />
          </div>
        );
      case 'shinjukuRain':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#F0F2F5] via-[#DEE4EB] to-[#CAD3DE] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#3D5A73]/20 border border-[#3D5A73]/30" />
          </div>
        );
      case 'archivalLibrary':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-[#F7F3E9] via-[#E8DEC8] to-[#CFBFA3] flex items-center justify-center">
            <div className="w-8 h-8 rounded bg-[#8E6F4E]/25 border border-[#8E6F4E]/30" />
          </div>
        );
      case 'hankoVermilion':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-[#F6F2EA] via-[#EFE7D8] to-[#E2D3BE] flex items-center justify-center">
            <div className="w-6 h-6 rounded border border-[#C84B31]/60 bg-[#C84B31]/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#C84B31]" />
            </div>
          </div>
        );
      case 'crimsonRipples':
        return <div className="w-full h-full pattern-crimson-ripples" />;
      case 'draftingGrid':
        return <div className="w-full h-full pattern-drafting-grid" />;
      case 'pastelDiamond':
        return <div className="w-full h-full pattern-pastel-diamond" />;
      case 'wheatWeave':
        return <div className="w-full h-full pattern-wheat-weave" />;
      case 'dynamicTiles':
        return <div className="w-full h-full pattern-dynamic-tiles" />;
      case 'badSnakeSunset':
        return <div className="w-full h-full pattern-bad-snake-sunset" />;
      case 'modernSkunkPine':
        return <div className="w-full h-full pattern-modern-skunk-pine" />;
      case 'fluffyBearClouds':
        return <div className="w-full h-full pattern-fluffy-bear-clouds" />;
      case 'niceGrasshopperGrid':
        return <div className="w-full h-full pattern-nice-grasshopper-grid" />;
      case 'thinBulldogContour':
        return <div className="w-full h-full pattern-thin-bulldog-contour" />;
      case 'greatFishScales':
        return <div className="w-full h-full pattern-great-fish-scales" />;
      default:
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-[#F6F2EA] via-[#EFE7D8] to-[#E2D3BE] flex items-center justify-center">
            <div className="w-6 h-6 rounded border border-[#C84B31]/60 bg-[#C84B31]/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#C84B31]" />
            </div>
          </div>
        );
    }
  };

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  const [timerHours, setTimerHours] = useState(Math.floor(taskTimer.duration / 3600));
  const [timerMinutes, setTimerMinutes] = useState(Math.floor((taskTimer.duration % 3600) / 60));
  const [timerSeconds, setTimerSeconds] = useState(taskTimer.duration % 60);

  React.useEffect(() => {
    setTimerHours(Math.floor(taskTimer.duration / 3600));
    setTimerMinutes(Math.floor((taskTimer.duration % 3600) / 60));
    setTimerSeconds(taskTimer.duration % 60);
  }, [taskTimer.duration]);

  if (!isOpen) return null;

  const testAlarm = (sound: AlarmSound) => {
    playChime(sound, pomoSettings.soundVolume);
  };

  const applyCustomTimerDuration = (h: number, m: number, s: number) => {
    const totalSecs = (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
    const safeSecs = Math.max(10, totalSecs);
    onUpdateTaskTimer({
      duration: safeSecs,
      timeLeft: safeSecs,
      isRunning: false,
      isCompleted: false,
    });
  };

  const handleResetAllDefaults = () => {
    onUpdatePomoSettings({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      alarmSound: 'bell',
      soundVolume: 0.7,
    });
    if (!pomoState.isRunning) {
      onUpdatePomoState({ timeLeft: 25 * 60, mode: 'work', currentCycle: 1 });
    }
    onUpdatePomoTimerStyle?.('default');
    applyCustomTimerDuration(0, 25, 0);
  };

  const renderPomoStylePreview = (styleId: PomodoroTimerStyle) => {
    switch (styleId) {
      case 'default':
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className="font-mono font-bold text-lg sm:text-xl text-[#211F1C] tracking-tight">
              25:00
            </span>
          </div>
        );
      case 'flipClock':
        return (
          <div className="flex items-center justify-center gap-1.5 w-full h-full">
            <div className="relative w-7 h-9 bg-[#211F1C] rounded-md border border-[#211F1C] flex items-center justify-center overflow-hidden shadow-sm">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#3B3630]" />
              <span className="font-mono font-bold text-sm text-[#F6F3EB]">2</span>
            </div>
            <div className="relative w-7 h-9 bg-[#211F1C] rounded-md border border-[#211F1C] flex items-center justify-center overflow-hidden shadow-sm">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#3B3630]" />
              <span className="font-mono font-bold text-sm text-[#F6F3EB]">5</span>
            </div>
          </div>
        );
      case 'progressBar':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full px-4 space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#211F1C]">25:00</span>
            <div className="w-full h-2 bg-[#E5DFD5] rounded-full overflow-hidden flex p-0.5 border border-[#D8D0C3]">
              <div className="w-[65%] h-full bg-[#C84B31] rounded-full" />
            </div>
          </div>
        );
      case 'gauge':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-1">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <g transform="rotate(-90 18 18)">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#E5DFD5" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#C84B31"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 * 0.35}
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#211F1C] leading-none">25:00</span>
          </div>
        );
      case 'dotMatrix':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-1.5">
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 18 }).map((_, i) => {
                const col = i % 6;
                const isLit = col < 4;
                return (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${isLit ? 'bg-[#C84B31]' : 'bg-[#E5DFD5]'}`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] font-mono font-bold text-[#211F1C]">25:00</span>
          </div>
        );
      case 'pie':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-1.5">
            <div
              className="w-6 h-6 rounded-full border border-[#D8D0C3] shadow-sm"
              style={{
                background: 'conic-gradient(#C84B31 240deg, #E5DFD5 0deg)',
              }}
            />
            <span className="text-[10px] font-mono font-bold text-[#211F1C]">25:00</span>
          </div>
        );
    }
  };

  const navCategories: { id: SettingsCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
    { id: 'timer', label: 'Timer Settings', icon: TimerIcon },
    { id: 'sound', label: 'Sounds & Alerts', icon: Volume2 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'shortcuts', label: 'Shortcuts & Info', icon: Keyboard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#211F1C]/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container (Library Paper Surface) */}
      <div className="relative z-10 w-full max-w-2xl sm:max-w-3xl h-full bg-[#FCFAF6] border-l border-[#E2DBD0] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DBD0] shrink-0 bg-[#F6F3EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8E6F4E]/15 border border-[#8E6F4E]/25 flex items-center justify-center text-[#8E6F4E]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#211F1C] tracking-wide">Study Settings</h2>
              <p className="text-[11px] text-[#6B6255]">Intervals, notifications, themes, and timer styles</p>
            </div>
          </div>

          <button
            id="btn-close-settings-panel"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#6B6255] hover:text-[#211F1C] border border-[#E2DBD0] transition-all cursor-pointer"
            title="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <aside className="w-48 sm:w-56 border-r border-[#E2DBD0] bg-[#F6F3EB] p-3 space-y-1 shrink-0 overflow-y-auto">
            <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#9B9182] block">
              Preferences
            </span>
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`btn-settings-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#E5DFD5] text-[#211F1C] border border-[#D5CDC0] shadow-xs'
                      : 'text-[#6B6255] hover:text-[#211F1C] hover:bg-[#EFE9DF] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C84B31]' : 'text-[#8E6F4E]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-[#E2DBD0]">
              <button
                onClick={handleResetAllDefaults}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-[#6B6255] hover:text-[#C84B31] hover:bg-[#C84B31]/10 rounded-lg transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </aside>

          {/* Right Main Settings Pane */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#FCFAF6]">
            {/* 1. POMODORO SETTINGS */}
            {activeCategory === 'pomodoro' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[#211F1C] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C84B31]" />
                    <span>Pomodoro Interval Durations</span>
                  </h3>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Configure custom lengths for focus sprints, short breaks, and restorative long breaks.
                  </p>
                </div>

                {/* Duration Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-2">
                    <label className="text-xs font-semibold text-[#8E6F4E] flex items-center justify-between">
                      <span>Focus Session</span>
                      <span className="text-[10px] font-mono text-[#9B9182]">minutes</span>
                    </label>
                    <input
                      id="input-setting-work-duration"
                      type="number"
                      min="1"
                      max="120"
                      value={pomoSettings.workDuration}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 25);
                        onUpdatePomoSettings({ workDuration: val });
                        if (pomoState.mode === 'work' && !pomoState.isRunning) {
                          onUpdatePomoState({ timeLeft: val * 60 });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-[#FCFAF6] border border-[#DCD3C4] rounded-lg text-[#211F1C] font-mono text-center font-bold text-sm focus:outline-none focus:border-[#C84B31]"
                    />
                    <span className="text-[10px] text-[#9B9182] block">Standard: 25 mins</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-2">
                    <label className="text-xs font-semibold text-[#4A7C59] flex items-center justify-between">
                      <span>Short Rest</span>
                      <span className="text-[10px] font-mono text-[#9B9182]">minutes</span>
                    </label>
                    <input
                      id="input-setting-short-break"
                      type="number"
                      min="1"
                      max="60"
                      value={pomoSettings.shortBreakDuration}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 5);
                        onUpdatePomoSettings({ shortBreakDuration: val });
                        if (pomoState.mode === 'shortBreak' && !pomoState.isRunning) {
                          onUpdatePomoState({ timeLeft: val * 60 });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-[#FCFAF6] border border-[#DCD3C4] rounded-lg text-[#211F1C] font-mono text-center font-bold text-sm focus:outline-none focus:border-[#4A7C59]"
                    />
                    <span className="text-[10px] text-[#9B9182] block">Standard: 5 mins</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-2">
                    <label className="text-xs font-semibold text-[#3D5A73] flex items-center justify-between">
                      <span>Long Rest</span>
                      <span className="text-[10px] font-mono text-[#9B9182]">minutes</span>
                    </label>
                    <input
                      id="input-setting-long-break"
                      type="number"
                      min="1"
                      max="90"
                      value={pomoSettings.longBreakDuration}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 15);
                        onUpdatePomoSettings({ longBreakDuration: val });
                        if (pomoState.mode === 'longBreak' && !pomoState.isRunning) {
                          onUpdatePomoState({ timeLeft: val * 60 });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-[#FCFAF6] border border-[#DCD3C4] rounded-lg text-[#211F1C] font-mono text-center font-bold text-sm focus:outline-none focus:border-[#3D5A73]"
                    />
                    <span className="text-[10px] text-[#9B9182] block">Standard: 15 mins</span>
                  </div>
                </div>

                {/* 1.B. TIMER STYLE (Appearance Gallery for Pomodoro) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#211F1C] tracking-tight">
                      Display Style
                    </h4>
                  </div>
                  <p className="text-xs text-[#6B6255]">
                    Select how the remaining time is rendered on your desk.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {POMO_TIMER_STYLES.map((style) => {
                      const isSelected = pomoTimerStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          id={`btn-pomo-style-${style.id}`}
                          onClick={() => onUpdatePomoTimerStyle?.(style.id)}
                          className={`flex flex-col items-center group text-left cursor-pointer transition-all ${
                            isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                          }`}
                        >
                          <div
                            className={`w-full aspect-[16/11] rounded-xl flex flex-col items-center justify-center p-3 transition-all relative overflow-hidden ${
                              isSelected
                                ? 'bg-[#FCFAF6] border-2 border-[#C84B31] shadow-md'
                                : 'bg-[#F6F3EB] hover:bg-[#EFE9DF] border border-[#E2DBD0]'
                            }`}
                          >
                            {renderPomoStylePreview(style.id)}
                          </div>

                          <span
                            className={`mt-1.5 text-xs tracking-wide transition-colors ${
                              isSelected ? 'text-[#C84B31] font-bold' : 'text-[#6B6255] group-hover:text-[#211F1C]'
                            }`}
                          >
                            {style.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cycles & Automation Group */}
                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E6F4E]">
                    Cycle Behavior & Automation
                  </h4>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-[#211F1C] block">Cycles Before Long Rest</span>
                      <span className="text-[11px] text-[#6B6255]">
                        Number of focus sprints completed before triggering long rest.
                      </span>
                    </div>
                    <select
                      id="select-setting-cycles"
                      value={pomoSettings.cyclesBeforeLongBreak}
                      onChange={(e) =>
                        onUpdatePomoSettings({ cyclesBeforeLongBreak: parseInt(e.target.value) || 4 })
                      }
                      className="bg-[#FCFAF6] border border-[#DCD3C4] rounded-lg px-3 py-1.5 text-[#211F1C] text-xs font-mono focus:outline-none focus:border-[#C84B31] cursor-pointer"
                    >
                      {[2, 3, 4, 5, 6, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} cycles
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#E2DBD0]">
                    <div>
                      <span className="text-xs font-semibold text-[#211F1C] block">Auto-start Breaks</span>
                      <span className="text-[11px] text-[#6B6255]">
                        Automatically transition into rest periods without manual click.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pomoSettings.autoStartBreaks}
                        onChange={(e) => onUpdatePomoSettings({ autoStartBreaks: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#D8D0C3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C84B31]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#E2DBD0]">
                    <div>
                      <span className="text-xs font-semibold text-[#211F1C] block">Auto-start Pomodoros</span>
                      <span className="text-[11px] text-[#6B6255]">
                        Automatically start the next focus interval when a break concludes.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pomoSettings.autoStartPomodoros}
                        onChange={(e) => onUpdatePomoSettings({ autoStartPomodoros: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#D8D0C3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C84B31]" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TIMER SETTINGS */}
            {activeCategory === 'timer' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[#211F1C] flex items-center gap-2">
                    <TimerIcon className="w-4 h-4 text-[#8E6F4E]" />
                    <span>Countdown Timer Settings</span>
                  </h3>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Customize typography appearance, default durations, and quick intervals for individual tasks.
                  </p>
                </div>

                {/* Typography Gallery */}
                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8E6F4E] block">
                      Typography Face
                    </span>
                    <span className="text-[11px] text-[#6B6255]">
                      Active: <strong className="text-[#C84B31] capitalize">{clockTimerStyle}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CLOCK_TIMER_STYLES.map((style) => {
                      const isSelected = clockTimerStyle === style.id;
                      return (
                        <div
                          key={style.id}
                          id={`timer-theme-card-${style.id}`}
                          onClick={() => onUpdateClockTimerStyle?.(style.id)}
                          className={`group relative rounded-xl p-2 cursor-pointer transition-all border flex flex-col items-center ${
                            isSelected
                              ? 'bg-[#FCFAF6] border-[#C84B31] shadow-md ring-2 ring-[#C84B31]/30'
                              : 'bg-[#F6F3EB] border-[#E2DBD0] hover:bg-[#EFE9DF]'
                          }`}
                        >
                          <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-[#FAF8F3] flex flex-col items-center justify-center p-2 border border-[#E2DBD0]">
                            <div
                              className={`text-xl sm:text-2xl text-[#211F1C] tracking-tight transition-transform group-hover:scale-105 ${style.className}`}
                            >
                              {style.previewText}
                            </div>

                            {isSelected && (
                              <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C84B31] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <span
                            className={`mt-1.5 text-xs font-semibold text-center transition-colors ${
                              isSelected ? 'text-[#C84B31]' : 'text-[#6B6255] group-hover:text-[#211F1C]'
                            }`}
                          >
                            {style.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Target Duration Input */}
                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8E6F4E] block">
                    Set Target Duration (HH:MM:SS)
                  </span>

                  <div className="flex items-center justify-center gap-3 font-mono py-2">
                    <div className="flex flex-col items-center">
                      <label className="text-[10px] text-[#9B9182] mb-1">Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={timerHours}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setTimerHours(val);
                          applyCustomTimerDuration(val, timerMinutes, timerSeconds);
                        }}
                        className="w-16 px-2 py-1.5 bg-[#FCFAF6] border border-[#DCD3C4] rounded-lg text-[#211F1C] text-center font-bold text-sm focus:outline-none focus:border-[#C84B31]"
                      />
                    </div>
                    <span className="text-[#9B9182] text-xl mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <label className="text-[10px] text-[#9B9182] mb-1">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerMinutes}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          setTimerMinutes(val);
                          applyCustomTimerDuration(timerHours, val, timerSeconds);
                        }}
                        className="w-16 px-2 py-1.5 bg-[#FCFAF6] border border-[#DCD3C4] rounded-lg text-[#211F1C] text-center font-bold text-sm focus:outline-none focus:border-[#C84B31]"
                      />
                    </div>
                    <span className="text-[#9B9182] text-xl mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <label className="text-[10px] text-[#9B9182] mb-1">Seconds</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerSeconds}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          setTimerSeconds(val);
                          applyCustomTimerDuration(timerHours, timerMinutes, val);
                        }}
                        className="w-16 px-2 py-1.5 bg-[#FCFAF6] border border-[#DCD3C4] rounded-lg text-[#211F1C] text-center font-bold text-sm focus:outline-none focus:border-[#C84B31]"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Intervals */}
                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8E6F4E] block">
                    Quick Preset Intervals
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: '10m Quick Sprint', secs: 10 * 60 },
                      { label: '15m Sprint', secs: 15 * 60 },
                      { label: '25m Standard', secs: 25 * 60 },
                      { label: '45m Deep Reading', secs: 45 * 60 },
                      { label: '60m Study Block', secs: 60 * 60 },
                      { label: '90m Master Focus', secs: 90 * 60 },
                    ].map((p) => {
                      const isSelected = taskTimer.duration === p.secs;
                      return (
                        <button
                          key={p.label}
                          onClick={() => {
                            const h = Math.floor(p.secs / 3600);
                            const m = Math.floor((p.secs % 3600) / 60);
                            const s = p.secs % 60;
                            setTimerHours(h);
                            setTimerMinutes(m);
                            setTimerSeconds(s);
                            applyCustomTimerDuration(h, m, s);
                          }}
                          className={`p-2 rounded-lg text-xs font-semibold transition-all border text-left flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#C84B31]/10 text-[#C84B31] border-[#C84B31]/40'
                              : 'bg-[#FCFAF6] text-[#6B6255] border-[#E2DBD0] hover:bg-[#EFE9DF]'
                          }`}
                        >
                          <span>{p.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. SOUNDS & ALERTS */}
            {activeCategory === 'sound' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[#211F1C] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#8E6F4E]" />
                    <span>Notification Chimes & Sound Settings</span>
                  </h3>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Select harmonic tones and adjust completion alert volume.
                  </p>
                </div>

                {/* Alarm Sound Picker */}
                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8E6F4E] block">
                    Session Completion Chime
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'bell' as AlarmSound, name: 'Zen Temple Bell', desc: 'Resonant 528Hz calming brass chime' },
                      { id: 'marimba' as AlarmSound, name: 'Marimba Melodic', desc: 'Gentle wooden acoustic notes' },
                      { id: 'bowl' as AlarmSound, name: 'Tibetan Singing Bowl', desc: 'Deep harmonizing singing bowl' },
                      { id: 'digital' as AlarmSound, name: 'Modern Chime', desc: 'Clean, crisp electronic signal' },
                    ].map((s) => {
                      const isSelected = pomoSettings.alarmSound === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            onUpdatePomoSettings({ alarmSound: s.id });
                            testAlarm(s.id);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#FCFAF6] border-[#C84B31] text-[#211F1C] shadow-xs'
                              : 'bg-[#FCFAF6] border-[#E2DBD0] text-[#6B6255] hover:bg-[#EFE9DF]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block text-[#211F1C]">{s.name}</span>
                            <span className="text-[11px] text-[#9B9182]">{s.desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              testAlarm(s.id);
                            }}
                            className="p-1.5 rounded-lg bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#8E6F4E] transition-all shrink-0 ml-2 cursor-pointer"
                            title="Play sound sample"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alarm Volume Slider */}
                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#211F1C]">Chime Notification Volume</span>
                    <span className="font-mono font-bold text-[#C84B31]">
                      {Math.round(pomoSettings.soundVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(pomoSettings.soundVolume * 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) / 100;
                      onUpdatePomoSettings({ soundVolume: val });
                    }}
                    className="w-full accent-[#C84B31] h-1.5 bg-[#E5DFD5] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9B9182] font-mono">
                    <span>Muted (0%)</span>
                    <span>Gentle (50%)</span>
                    <span>Loud (100%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. APPEARANCE & THEMES */}
            {activeCategory === 'appearance' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[#211F1C] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#8E6F4E]" />
                    <span>Atmosphere & Paper Themes</span>
                  </h3>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Select Japanese manga library atmospheres, quiet study backdrops, or custom paper wallpapers.
                  </p>
                </div>

                {/* THEME PRESET GALLERY */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8E6F4E]">
                      Library Atmospheric Themes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {THEME_PRESETS.map((theme) => {
                      const isSelected =
                        appearanceSettings.backgroundMode === 'theme' &&
                        !appearanceSettings.customBackgroundUrl &&
                        appearanceSettings.activeTheme === theme.id;

                      return (
                        <button
                          key={theme.id}
                          id={`btn-theme-${theme.id}`}
                          onClick={() => {
                            onUpdateAppearance?.({
                              backgroundMode: 'theme',
                              activeTheme: theme.id,
                              customBackgroundUrl: null,
                            });
                          }}
                          className={`flex flex-col items-center group text-center cursor-pointer transition-all ${
                            isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                          }`}
                        >
                          <div
                            className={`w-full aspect-[16/10] rounded-xl relative overflow-hidden transition-all shadow-xs ${
                              isSelected
                                ? 'border-2 border-[#C84B31] ring-2 ring-[#C84B31]/30 shadow-md'
                                : 'border border-[#E2DBD0] group-hover:border-[#D5CDC0]'
                            }`}
                          >
                            {renderThemeCardVisual(theme.id)}

                            {isSelected && (
                              <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C84B31] text-white flex items-center justify-center shadow-xs z-10">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <span
                            className={`mt-1.5 text-[11px] font-semibold tracking-wide transition-colors ${
                              isSelected
                                ? 'text-[#C84B31]'
                                : 'text-[#6B6255] group-hover:text-[#211F1C]'
                            }`}
                          >
                            {theme.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* VIDEO STUDY BACKDROPS */}
                <div className="pt-3 space-y-4 border-t border-[#E2DBD0]">
                  <div>
                    <h4 className="text-sm font-bold text-[#211F1C] tracking-tight">
                      Ambient Study Video Stream
                    </h4>
                    <p className="text-xs text-[#6B6255] mt-0.5">
                      Paste YouTube study stream URL below or pick from curated library backdrops.
                    </p>
                  </div>

                  <form onSubmit={handleSaveVideoUrl} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={customVideoUrl}
                        onChange={(e) => {
                          setCustomVideoUrl(e.target.value);
                          if (videoInputError) setVideoInputError(null);
                        }}
                        className="flex-1 bg-[#FCFAF6] border border-[#DCD3C4] focus:border-[#C84B31] rounded-lg px-3 py-2 text-xs text-[#211F1C] placeholder-[#9B9182] focus:outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!customVideoUrl.trim()}
                        className="px-4 py-2 bg-[#8E6F4E] hover:bg-[#785E42] active:scale-95 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {videoSavedSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </div>

                    {videoInputError && (
                      <p className="text-[11px] text-[#C84B31]">{videoInputError}</p>
                    )}
                  </form>

                  {appearanceSettings.backgroundMode === 'video' && appearanceSettings.videoBackgroundId && (
                    <div className="p-3 bg-[#F6F3EB] border border-[#C84B31]/30 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#C84B31] animate-pulse" />
                        <span className="text-xs font-semibold text-[#211F1C] truncate">
                          Active: {truncateTitle(appearanceSettings.videoBackgroundTitle || 'Video Backdrop', 50)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#EFE9DF] border border-[#E2DBD0] text-[#6B6255] flex items-center gap-1"
                        >
                          <VolumeX className="w-3.5 h-3.5 text-[#9B9182]" />
                          <span>Muted</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateAppearance?.({
                              backgroundMode: 'theme',
                              videoBackgroundId: null,
                            });
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#E5DFD5] hover:bg-[#D5CDC0] text-[#211F1C] border border-[#D5CDC0] transition-all cursor-pointer"
                        >
                          Turn Off
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CURATED FOCUS PRESETS */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E6F4E] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
                        Curated Library Presets
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {['All', 'City', 'Coastal', 'Europe'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setVideoCategory(cat)}
                          className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all cursor-pointer ${
                            videoCategory === cat
                              ? 'bg-[#C84B31] text-white font-bold shadow-xs'
                              : 'bg-[#F6F3EB] hover:bg-[#EFE9DF] text-[#6B6255] border border-[#E2DBD0]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {(videoCategory === 'All'
                        ? AMBIENT_PRESETS
                        : AMBIENT_PRESETS.filter((p) => p.category === videoCategory)
                      ).map((preset) => {
                        const isCurrentVideo =
                          appearanceSettings.backgroundMode === 'video' &&
                          appearanceSettings.videoBackgroundId === preset.videoId;

                        return (
                          <div
                            key={preset.id}
                            id={`btn-video-preset-${preset.id}`}
                            onClick={() => {
                              onUpdateAppearance?.({
                                backgroundMode: 'video',
                                videoBackgroundId: preset.videoId,
                                videoBackgroundTitle: preset.title,
                                customBackgroundUrl: null,
                              });
                            }}
                            className={`group relative overflow-hidden rounded-xl border p-3 cursor-pointer transition-all flex flex-col justify-end h-22 ${
                              isCurrentVideo
                                ? 'border-[#C84B31] ring-2 ring-[#C84B31]/30 shadow-md'
                                : 'border-[#E2DBD0] hover:border-[#D5CDC0] bg-[#F6F3EB]'
                            }`}
                          >
                            <div
                              className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-all group-hover:scale-105 duration-300"
                              style={{ backgroundImage: `url(${preset.thumbnail})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#211F1C]/90 via-[#211F1C]/40 to-transparent" />

                            <div className="relative z-10 flex flex-col">
                              <span className="text-[10px] font-mono text-[#F6F3EB] font-semibold">{preset.tag}</span>
                              <span className="text-xs font-bold text-white leading-tight truncate mt-0.5">
                                {truncateTitle(preset.title, 50)}
                              </span>
                            </div>

                            {isCurrentVideo && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#C84B31] text-white flex items-center justify-center shadow-xs z-10">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CUSTOM BACKGROUND MODULE */}
                <div className="pt-3 space-y-3 border-t border-[#E2DBD0]">
                  <h4 className="text-sm font-bold text-[#211F1C] tracking-tight">
                    Custom Wallpaper
                  </h4>
                  <p className="text-xs text-[#6B6255]">
                    Upload your own backdrop image (JPG, PNG, WEBP).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative rounded-xl border-2 border-dashed transition-all p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] overflow-hidden ${
                        isDragOver
                          ? 'border-[#C84B31] bg-[#C84B31]/10'
                          : appearanceSettings.backgroundMode === 'custom' && appearanceSettings.customBackgroundUrl
                          ? 'border-[#4A7C59] bg-[#4A7C59]/10'
                          : 'border-[#DCD3C4] bg-[#F6F3EB] hover:bg-[#EFE9DF]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/heic,image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />

                      {appearanceSettings.backgroundMode === 'custom' && appearanceSettings.customBackgroundUrl ? (
                        <>
                          <img
                            src={appearanceSettings.customBackgroundUrl}
                            alt="Custom wallpaper"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/25" />
                          <div className="relative z-10 flex flex-col items-center gap-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#4A7C59] text-white text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Image Active
                            </span>
                            <span className="text-[10px] text-white mt-1 font-medium">
                              Click to replace
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <p className="text-xs text-[#211F1C]">
                            Drop file here or <span className="underline font-bold text-[#8E6F4E]">browse</span>
                          </p>
                          <p className="text-[10px] text-[#9B9182]">
                            JPG, PNG, WEBP (max 5MB)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between space-y-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (appearanceSettings.customBackgroundUrl) {
                              onUpdateAppearance?.({
                                backgroundMode: 'custom',
                              });
                              setSavedSuccess(true);
                              setTimeout(() => setSavedSuccess(false), 2000);
                            } else {
                              fileInputRef.current?.click();
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-[#8E6F4E] hover:bg-[#785E42] active:scale-95 text-white font-semibold rounded-lg text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {savedSuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Saved!</span>
                            </>
                          ) : (
                            <span>Apply upload</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateAppearance?.({
                              backgroundMode: 'theme',
                              customBackgroundUrl: null,
                            });
                          }}
                          disabled={!appearanceSettings.customBackgroundUrl}
                          className={`flex-1 px-3 py-2 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
                            appearanceSettings.customBackgroundUrl
                              ? 'bg-[#C84B31]/10 text-[#C84B31] hover:bg-[#C84B31]/20 border border-[#C84B31]/30 cursor-pointer'
                              : 'bg-[#EFE9DF] text-[#9B9182] cursor-not-allowed opacity-60 border border-[#E2DBD0]'
                          }`}
                        >
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-semibold text-[#211F1C]">Overlay Tint</label>
                          <span className="font-mono text-xs text-[#8E6F4E] font-bold">
                            {appearanceSettings.customBackgroundOverlay}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={appearanceSettings.customBackgroundOverlay}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            onUpdateAppearance?.({
                              customBackgroundOverlay: val,
                            });
                          }}
                          className="w-full accent-[#8E6F4E] h-1.5 bg-[#E5DFD5] rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] space-y-1">
                  <span className="text-xs font-bold text-[#8E6F4E] block">
                    Distraction-Free Immersion
                  </span>
                  <p className="text-xs text-[#6B6255]">
                    Press <kbd className="px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD3C4] rounded text-[10px] font-mono text-[#211F1C]">Z</kbd> anytime to enter Zen focus mode.
                  </p>
                </div>
              </div>
            )}

            {/* 5. SHORTCUTS & INFO */}
            {activeCategory === 'shortcuts' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[#211F1C] flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-[#8E6F4E]" />
                    <span>Keyboard Shortcuts</span>
                  </h3>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Navigate and control your study session effortlessly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] divide-y divide-[#E2DBD0] text-xs">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[#211F1C] font-medium">Play / Pause Active Timer</span>
                    <kbd className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD3C4] rounded-md text-[#211F1C] font-mono font-bold text-[11px] shadow-xs">
                      Space
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[#211F1C] font-medium">Toggle Mute / Unmute Media</span>
                    <kbd className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD3C4] rounded-md text-[#211F1C] font-mono font-bold text-[11px] shadow-xs">
                      M
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[#211F1C] font-medium">Toggle Zen Study Mode</span>
                    <kbd className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD3C4] rounded-md text-[#211F1C] font-mono font-bold text-[11px] shadow-xs">
                      Z
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[#211F1C] font-medium">Exit Zen Mode</span>
                    <kbd className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD3C4] rounded-md text-[#211F1C] font-mono font-bold text-[11px] shadow-xs">
                      Esc
                    </kbd>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F3EB] border border-[#E2DBD0] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8E6F4E]/15 border border-[#8E6F4E]/25 flex items-center justify-center text-[#8E6F4E] shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-[#6B6255]">
                    <strong className="text-[#211F1C] block">Manga Library Focus Hub</strong>
                    <span>Designed for calm, undisturbed deep study, reading sprints, and creative flow.</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
