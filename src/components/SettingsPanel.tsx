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
  Bell,
  Sliders,
  Flame,
  Info,
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
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
import { AMBIENT_PRESETS, extractYouTubeSource } from '../utils/youtube';

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
  media,
  onUpdateMedia,
  clockTimerStyle = 'default',
  onUpdateClockTimerStyle,
  pomoTimerStyle = 'default',
  onUpdatePomoTimerStyle,
  appearanceSettings = {
    backgroundMode: 'theme',
    activeTheme: 'defaultDark',
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
      setVideoInputError('Please enter a valid YouTube video URL or 11-char ID.');
      return;
    }
    setVideoInputError(null);
    onUpdateAppearance?.({
      backgroundMode: 'video',
      videoBackgroundId: videoId,
      videoBackgroundTitle: 'Custom Video Background',
      customBackgroundUrl: null,
    });
    setVideoSavedSuccess(true);
    setTimeout(() => setVideoSavedSuccess(false), 2000);
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
      case 'rainbowFlare':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-cyan-300 via-pink-300 to-yellow-200">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-cyan-400/60 rounded-full blur-lg" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-pink-400/70 rounded-full blur-lg" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-300/50 rounded-full blur-md" />
          </div>
        );
      case 'darkFlare':
        return (
          <div className="w-full h-full relative overflow-hidden bg-neutral-950">
            <div className="absolute top-2 right-2 w-20 h-20 bg-rose-600/50 rounded-full blur-xl" />
            <div className="absolute bottom-1 left-2 w-16 h-16 bg-amber-500/40 rounded-full blur-lg" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        );
      case 'heatMap':
        return (
          <div
            className="w-full h-full relative overflow-hidden bg-neutral-950"
            style={{
              background:
                'radial-gradient(ellipse at 80% 20%, #facc15 0%, #f97316 30%, #ec4899 60%, #3b82f6 90%, #000 100%)',
            }}
          />
        );
      case 'darkPurpleHeart':
        return (
          <div className="w-full h-full relative overflow-hidden bg-neutral-950 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-fuchsia-500 fill-current filter blur-[2px] drop-shadow-[0_0_12px_rgba(217,70,239,0.9)]">
              <path d="M50,85 C50,85 10,55 10,32 C10,18 20,10 32,10 C41,10 47,16 50,22 C53,16 59,10 68,10 C80,10 90,18 90,32 C90,55 50,85 50,85 Z" />
            </svg>
          </div>
        );
      case 'flocusViolet':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600">
            <div className="absolute top-0 right-0 w-16 h-16 bg-violet-400/40 rounded-full blur-md" />
          </div>
        );
      case 'pastelLofi':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-sky-200 via-indigo-200 to-blue-200">
            <div className="absolute top-1 left-2 w-12 h-12 bg-cyan-300/60 rounded-full blur-md" />
            <div className="absolute bottom-1 right-2 w-12 h-12 bg-purple-300/60 rounded-full blur-md" />
          </div>
        );
      case 'sakura':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-rose-200 via-pink-300 to-rose-300">
            <div className="absolute top-1 right-1 w-14 h-14 bg-pink-400/50 rounded-full blur-md" />
          </div>
        );
      case 'lightPurpleHeart':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-purple-200 via-fuchsia-200 to-indigo-100 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-fuchsia-400 fill-current filter blur-[2px] drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">
              <path d="M50,85 C50,85 10,55 10,32 C10,18 20,10 32,10 C41,10 47,16 50,22 C53,16 59,10 68,10 C80,10 90,18 90,32 C90,55 50,85 50,85 Z" />
            </svg>
          </div>
        );
      case 'grainyGradient':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-700 via-rose-600 to-amber-400">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
          </div>
        );
      case 'cyberpunk':
        return (
          <div className="w-full h-full relative overflow-hidden bg-neutral-950">
            <div className="absolute top-1 left-1 w-12 h-12 bg-cyan-500/50 rounded-full blur-md" />
            <div className="absolute bottom-1 right-1 w-12 h-12 bg-fuchsia-600/50 rounded-full blur-md" />
          </div>
        );
      case 'zenEmerald':
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-emerald-950 via-teal-950 to-neutral-950">
            <div className="absolute top-2 left-2 w-14 h-14 bg-emerald-600/40 rounded-full blur-md" />
          </div>
        );
      case 'defaultDark':
      default:
        return (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-neutral-950 via-slate-950 to-neutral-900 flex items-center justify-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full blur-md" />
          </div>
        );
    }
  };

  // Sync initialCategory if opened from a specific button
  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Timer custom inputs state
  const [timerHours, setTimerHours] = useState(Math.floor(taskTimer.duration / 3600));
  const [timerMinutes, setTimerMinutes] = useState(Math.floor((taskTimer.duration % 3600) / 60));
  const [timerSeconds, setTimerSeconds] = useState(taskTimer.duration % 60);

  // Sync timer state when taskTimer changes
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
            <span className="font-mono font-bold text-xl sm:text-2xl text-white tracking-tight">
              25:00
            </span>
          </div>
        );
      case 'flipClock':
        return (
          <div className="flex items-center justify-center gap-2 w-full h-full">
            <div className="relative w-8 h-10 bg-neutral-800/90 rounded-lg border border-white/20 flex items-center justify-center overflow-hidden shadow">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black" />
              <span className="font-mono font-black text-base text-white">2</span>
            </div>
            <div className="relative w-8 h-10 bg-neutral-800/90 rounded-lg border border-white/20 flex items-center justify-center overflow-hidden shadow">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black" />
              <span className="font-mono font-black text-base text-white">5</span>
            </div>
          </div>
        );
      case 'progressBar':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full px-4 space-y-2">
            <span className="text-[11px] font-mono font-bold text-white tracking-tight">25:00</span>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden flex p-0.5 border border-white/10">
              <div className="w-[65%] h-full bg-white rounded-full" />
            </div>
          </div>
        );
      case 'gauge':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-1">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <g transform="rotate(-90 18 18)">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 * 0.35}
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
            <span className="text-[10px] font-mono font-bold text-white leading-none">25:00</span>
          </div>
        );
      case 'dotMatrix':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-1.5">
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: 18 }).map((_, i) => {
                const col = i % 6;
                const isLit = col < 4;
                return (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${isLit ? 'bg-white' : 'bg-neutral-800'}`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] font-mono font-bold text-white">25:00</span>
          </div>
        );
      case 'pie':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-1.5">
            <div
              className="w-7 h-7 rounded-full border border-neutral-700 shadow-sm"
              style={{
                background: 'conic-gradient(#ffffff 240deg, #262626 0deg)',
              }}
            />
            <span className="text-[10px] font-mono font-bold text-white">25:00</span>
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
      {/* Subtle Backdrop so user can clearly preview background theme changes live */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container (Two-part layout: Sidebar + Main Settings) */}
      <div className="relative z-10 w-full max-w-2xl sm:max-w-3xl h-full bg-neutral-950/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Focus Hub Settings</h2>
              <p className="text-[11px] text-neutral-400">Customize intervals, alarms, timers, and themes</p>
            </div>
          </div>

          <button
            id="btn-close-settings-panel"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-all"
            title="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <aside className="w-48 sm:w-56 border-r border-white/10 bg-neutral-900/40 p-3 space-y-1.5 shrink-0 overflow-y-auto">
            <span className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            <div className="pt-6 mt-6 border-t border-white/10">
              <button
                onClick={handleResetAllDefaults}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-neutral-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </aside>

          {/* Right Main Settings Pane */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. POMODORO SETTINGS */}
            {activeCategory === 'pomodoro' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Pomodoro Interval Durations</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Configure custom lengths for your focus, short rest, and long rest blocks.
                  </p>
                </div>

                {/* Duration Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <label className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                      <span>Focus Session</span>
                      <span className="text-[10px] font-mono text-neutral-400">minutes</span>
                    </label>
                    <div className="flex items-center gap-2">
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
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 block">Default: 25 mins</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <label className="text-xs font-semibold text-emerald-300 flex items-center justify-between">
                      <span>Short Rest</span>
                      <span className="text-[10px] font-mono text-neutral-400">minutes</span>
                    </label>
                    <div className="flex items-center gap-2">
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
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 block">Default: 5 mins</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <label className="text-xs font-semibold text-sky-300 flex items-center justify-between">
                      <span>Long Rest</span>
                      <span className="text-[10px] font-mono text-neutral-400">minutes</span>
                    </label>
                    <div className="flex items-center gap-2">
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
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 block">Default: 15 mins</span>
                  </div>
                </div>

                {/* 1.B. TIMER STYLE (Appearance Gallery for Pomodoro) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white tracking-tight">
                      Timer Style
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-400/40 rounded-full font-mono flex items-center gap-1">
                      <span className="text-amber-400">⚡</span> PLUS
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-mono">
                      NEW
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Choose how the time remaining is displayed.
                  </p>

                  {/* 6 Miniature Style Cards Grid */}
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
                          {/* Card Frame */}
                          <div
                            className={`w-full aspect-[16/11] rounded-2xl flex flex-col items-center justify-center p-3 transition-all relative overflow-hidden ${
                              isSelected
                                ? 'bg-neutral-900 border-2 border-white shadow-xl shadow-white/5'
                                : 'bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/10 hover:border-white/25'
                            }`}
                          >
                            {renderPomoStylePreview(style.id)}
                          </div>

                          {/* Label under card */}
                          <span
                            className={`mt-2 text-xs tracking-wide transition-colors ${
                              isSelected ? 'text-white font-bold' : 'text-neutral-400 group-hover:text-neutral-200'
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
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Cycle Behavior & Automation
                  </h4>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-white block">Cycles Before Long Rest</span>
                      <span className="text-[11px] text-neutral-400">
                        Number of focus sprints completed before triggering the long rest break.
                      </span>
                    </div>
                    <select
                      id="select-setting-cycles"
                      value={pomoSettings.cyclesBeforeLongBreak}
                      onChange={(e) =>
                        onUpdatePomoSettings({ cyclesBeforeLongBreak: parseInt(e.target.value) || 4 })
                      }
                      className="bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {[2, 3, 4, 5, 6, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} cycles
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10">
                    <div>
                      <span className="text-xs font-semibold text-white block">Auto-start Breaks</span>
                      <span className="text-[11px] text-neutral-400">
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
                      <div className="w-10 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10">
                    <div>
                      <span className="text-xs font-semibold text-white block">Auto-start Pomodoros</span>
                      <span className="text-[11px] text-neutral-400">
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
                      <div className="w-10 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TIMER SETTINGS (Includes Target Duration & Timer Typography Appearance) */}
            {activeCategory === 'timer' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TimerIcon className="w-4 h-4 text-cyan-400" />
                    <span>Task Countdown Timer Settings</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Customize typography appearance, default target durations, and quick intervals for individual tasks.
                  </p>
                </div>

                {/* Timer Typography & Clock Style Gallery (Exclusively for Timer) */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white block">
                        Timer Style & Typography
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full font-mono">
                        ⚡ TIMER ONLY
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Active: <strong className="text-cyan-300 capitalize">{clockTimerStyle}</strong>
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
                          className={`group relative rounded-2xl p-2 cursor-pointer transition-all border flex flex-col items-center ${
                            isSelected
                              ? 'bg-neutral-900 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                              : 'bg-neutral-900/60 border-white/10 hover:border-white/25 hover:bg-neutral-900/90'
                          }`}
                        >
                          {/* Miniature Desktop Thumbnail Preview */}
                          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-2 border border-white/5 shadow-inner">
                            {/* Subtle Ambient Background Gradient simulation */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none" />

                            {/* Top small logo / branding */}
                            <div className="absolute top-1.5 flex items-center gap-1 opacity-70">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <span className="text-[8px] font-medium text-neutral-300 tracking-wider">flocus</span>
                            </div>

                            {/* Displayed Time in the exact font theme */}
                            <div
                              className={`text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md z-10 transition-transform group-hover:scale-105 ${style.className}`}
                            >
                              {style.previewText}
                            </div>

                            {/* Selection Checkmark */}
                            {isSelected && (
                              <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-neutral-950 flex items-center justify-center shadow-md">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          {/* Theme Name Label */}
                          <span
                            className={`mt-2 text-xs font-semibold text-center transition-colors ${
                              isSelected ? 'text-cyan-300 font-bold' : 'text-neutral-300 group-hover:text-white'
                            }`}
                          >
                            {style.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Default Target Duration (Hours, Minutes, Seconds) */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Set Target Duration (HH:MM:SS)
                  </span>

                  <div className="flex items-center justify-center gap-3 font-mono py-2">
                    <div className="flex flex-col items-center">
                      <label className="text-[10px] text-neutral-400 mb-1">Hours</label>
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
                        className="w-16 px-2 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white text-center font-bold text-base focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <span className="text-neutral-500 text-xl mt-4">:</span>
                    <div className="flex flex-col items-center">
                      <label className="text-[10px] text-neutral-400 mb-1">Minutes</label>
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
                        className="w-16 px-2 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white text-center font-bold text-base focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <span className="text-neutral-500 text-xl mt-4">:</span>
                    <div className="flex flex-col items-center">
                      <label className="text-[10px] text-neutral-400 mb-1">Seconds</label>
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
                        className="w-16 px-2 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white text-center font-bold text-base focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Intervals Buttons */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Quick Preset Durations
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: '10m Quick Sprint', secs: 10 * 60 },
                      { label: '15m Sprint', secs: 15 * 60 },
                      { label: '25m Standard', secs: 25 * 60 },
                      { label: '45m Deep Work', secs: 45 * 60 },
                      { label: '60m Block', secs: 60 * 60 },
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
                          className={`p-2.5 rounded-xl text-xs font-semibold transition-all border text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                              : 'bg-neutral-900/60 text-neutral-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span>{p.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
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
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Alarm Chimes & Sound Settings</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Select harmonic tones and adjust notification alert volume.
                  </p>
                </div>

                {/* Alarm Sound Picker */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Session Completion Chime
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'bell' as AlarmSound, name: 'Zen Meditation Bell', desc: 'Harmonic 528Hz calming brass chime' },
                      { id: 'marimba' as AlarmSound, name: 'Marimba Melodic', desc: 'Uplifting gentle wooden acoustic notes' },
                      { id: 'bowl' as AlarmSound, name: 'Tibetan Singing Bowl', desc: 'Deep resonating relaxation bowl' },
                      { id: 'digital' as AlarmSound, name: 'Digital Synth Chime', desc: 'Modern crisp electronic chime' },
                    ].map((s) => {
                      const isSelected = pomoSettings.alarmSound === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            onUpdatePomoSettings({ alarmSound: s.id });
                            testAlarm(s.id);
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-400/40 text-white'
                              : 'bg-neutral-900/60 border-white/10 text-neutral-300 hover:bg-white/5'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">{s.name}</span>
                            <span className="text-[11px] text-neutral-400">{s.desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              testAlarm(s.id);
                            }}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition-all shrink-0 ml-2"
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
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Chime Notification Volume</span>
                    <span className="font-mono text-amber-300">
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
                    className="w-full accent-amber-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
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
                {/* Section Header */}
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Appearance & Atmosphere</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Customize background themes, ambient video backdrops, custom wallpapers, and overlay tints.
                  </p>
                </div>

                {/* THEME PRESET GALLERY */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Themes
                    </span>
                    {appearanceSettings.backgroundMode === 'video' && appearanceSettings.videoBackgroundId && (
                      <span className="text-[11px] text-amber-400/90 font-mono">
                        (Video background active)
                      </span>
                    )}
                    {appearanceSettings.backgroundMode === 'custom' && appearanceSettings.customBackgroundUrl && (
                      <span className="text-[11px] text-emerald-400/90 font-mono">
                        (Custom wallpaper active)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
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
                          {/* Card Preview Container */}
                          <div
                            className={`w-full aspect-[16/10] rounded-2xl relative overflow-hidden transition-all shadow-md ${
                              isSelected
                                ? 'border-2 border-white ring-2 ring-white/20 shadow-xl'
                                : 'border border-white/10 group-hover:border-white/25'
                            }`}
                          >
                            {/* Inner Visual */}
                            {renderThemeCardVisual(theme.id)}

                            {/* Active Checkmark Pill on Bottom Right */}
                            {isSelected && (
                              <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-lg z-10">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          {/* Theme Label */}
                          <span
                            className={`mt-2 text-xs tracking-wide transition-colors ${
                              isSelected
                                ? 'text-white font-bold'
                                : 'text-neutral-300 group-hover:text-white'
                            }`}
                          >
                            {theme.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* VIDEO BACKGROUND MODULE */}
                <div className="pt-3 space-y-4 border-t border-white/10">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      Video Background
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Paste YouTube URL below, adjust the opacity above.
                    </p>
                  </div>

                  {/* YouTube URL Input & Save Button */}
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
                        className="flex-1 bg-neutral-900/90 border border-neutral-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!customVideoUrl.trim()}
                        className="px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] active:scale-95 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        {videoSavedSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <span>Save</span>
                        )}
                      </button>
                    </div>

                    {videoInputError && (
                      <p className="text-[11px] text-rose-400">{videoInputError}</p>
                    )}
                  </form>

                  {/* Video Active Status & Controls */}
                  {appearanceSettings.backgroundMode === 'video' && appearanceSettings.videoBackgroundId && (
                    <div className="p-3 bg-neutral-900/80 border border-amber-400/30 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-semibold text-amber-200 truncate">
                          Active: {appearanceSettings.videoBackgroundTitle || 'Video Background'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-neutral-400 flex items-center gap-1.5"
                          title="Video backgrounds are always muted for focus"
                        >
                          <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
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
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-all"
                        >
                          Turn Off
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CURATED FOCUS PRESETS (VIDEO BACKDROPS) */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Curated Focus Presets
                      </span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {['All', 'City', 'Coastal', 'Europe'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setVideoCategory(cat)}
                          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                            videoCategory === cat
                              ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                              : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Presets Grid */}
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
                            className={`group relative overflow-hidden rounded-2xl border p-3 cursor-pointer transition-all flex flex-col justify-end h-24 ${
                              isCurrentVideo
                                ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                                : 'border-white/10 hover:border-white/30 bg-neutral-900/70'
                            }`}
                          >
                            <div
                              className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:opacity-65 transition-all group-hover:scale-105 duration-500"
                              style={{ backgroundImage: `url(${preset.thumbnail})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-transparent" />

                            <div className="relative z-10 flex flex-col">
                              <span className="text-[10px] font-mono text-amber-300 font-semibold">{preset.tag}</span>
                              <span className="text-xs font-bold text-white leading-tight truncate mt-0.5">
                                {preset.title}
                              </span>
                            </div>

                            {isCurrentVideo && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg z-10">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CUSTOM BACKGROUND MODULE */}
                <div className="pt-3 space-y-3 border-t border-white/10">
                  <h4 className="text-base font-bold text-white tracking-tight">
                    Custom Background
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Upload your own theme image. All uploads must follow our guidelines.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Left: Drag & Drop Dropzone Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative rounded-2xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[145px] overflow-hidden ${
                        isDragOver
                          ? 'border-indigo-400 bg-indigo-500/20'
                          : appearanceSettings.backgroundMode === 'custom' && appearanceSettings.customBackgroundUrl
                          ? 'border-emerald-500/50 bg-neutral-900/80 hover:border-emerald-400'
                          : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-900/80'
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
                            alt="Custom uploaded wallpaper"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="relative z-10 flex flex-col items-center gap-1">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md">
                              <Check className="w-3 h-3" /> Image Applied
                            </span>
                            <span className="text-[11px] text-neutral-200 mt-1 font-medium">
                              Click or drop to replace
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <p className="text-xs text-neutral-200">
                            Drop file here or{' '}
                            <span className="underline font-bold text-white">browse</span>
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            JPG, PNG, WEBP, HEIC (max 5MB, min 800px)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Controls (Save upload, Remove image, Overlay slider) */}
                    <div className="flex flex-col justify-between space-y-4">
                      {/* Action Buttons */}
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
                          className="flex-1 px-4 py-2.5 bg-[#5850ec] hover:bg-[#4f46e5] active:scale-95 text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          {savedSuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Saved!</span>
                            </>
                          ) : (
                            <span>Save upload</span>
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
                          className={`flex-1 px-4 py-2.5 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 ${
                            appearanceSettings.customBackgroundUrl
                              ? 'bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-95 text-rose-100 cursor-pointer'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span>Remove image</span>
                        </button>
                      </div>

                      {/* Overlay Slider (0% - 100%) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-white">Overlay</label>
                        </div>
                        <div className="flex items-center gap-3">
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
                            className="flex-1 accent-indigo-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                          />
                          <div className="px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs font-mono font-bold text-white min-w-[50px] text-center shadow-inner">
                            {appearanceSettings.customBackgroundOverlay}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zen Mode Shortcut Tip */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Zen & Fullscreen Mode
                  </span>
                  <p className="text-xs text-neutral-400">
                    Press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-[10px] font-mono text-white">Z</kbd> anytime to immerse in Zen Mode and hide all floating headers.
                  </p>
                </div>
              </div>
            )}

            {/* 5. SHORTCUTS & INFO */}
            {activeCategory === 'shortcuts' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-amber-400" />
                    <span>Keyboard Shortcuts</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Navigate and control your ambient session effortlessly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10 text-xs">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-neutral-300">Play / Pause Active Timer</span>
                    <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-mono font-bold text-[11px]">
                      Space
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-neutral-300">Toggle Mute / Unmute Media</span>
                    <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-mono font-bold text-[11px]">
                      M
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-neutral-300">Toggle Zen Distraction-Free Mode</span>
                    <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-mono font-bold text-[11px]">
                      Z
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-neutral-300">Exit Zen Mode</span>
                    <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-mono font-bold text-[11px]">
                      Esc
                    </kbd>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-neutral-400">
                    <strong className="text-white block">Focus Hub Pro</strong>
                    <span>Designed for uninterrupted deep work, ambient flow, and multi-screen productivity.</span>
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
