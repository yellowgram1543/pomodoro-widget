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
} from 'lucide-react';
import {
  PomodoroSettings,
  PomodoroState,
  TaskTimerState,
  MediaSettings,
  SettingsCategory,
  AlarmSound,
  ClockTimerStyle,
} from '../types';
import { playChime } from '../utils/audio';
import { CLOCK_TIMER_STYLES } from '../utils/timerThemes';

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
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory);

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
    applyCustomTimerDuration(0, 25, 0);
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
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

            {/* 4. APPEARANCE */}
            {activeCategory === 'appearance' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Appearance & Atmosphere</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Adjust background atmosphere, overlays, and glassmorphic styling.
                  </p>
                </div>

                {/* Focus Theme Atmosphere */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Focus Theme Atmosphere
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { name: 'Warm Amber & Sunset', glow: 'from-amber-500/20 to-orange-500/10' },
                      { name: 'Cyber Cyan Glow', glow: 'from-cyan-500/20 to-blue-500/10' },
                      { name: 'Zen Emerald Forest', glow: 'from-emerald-500/20 to-teal-500/10' },
                      { name: 'Deep Midnight Twilight', glow: 'from-purple-500/20 to-indigo-500/10' },
                    ].map((theme, i) => (
                      <div
                        key={theme.name}
                        className={`p-3 rounded-xl border border-white/10 bg-gradient-to-br ${theme.glow} text-xs font-semibold text-white flex items-center justify-between cursor-pointer hover:border-white/30 transition-all`}
                      >
                        <span>{theme.name}</span>
                        {i === 0 && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
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
