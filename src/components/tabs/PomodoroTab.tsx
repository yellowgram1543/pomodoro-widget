import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PomodoroSettings, PomodoroState, SettingsCategory } from '../../types';
import { playChime } from '../../utils/audio';

interface PomodoroTabProps {
  state: PomodoroState;
  settings: PomodoroSettings;
  onUpdateState: (newState: Partial<PomodoroState>) => void;
  onUpdateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  onOpenSettings?: (cat: SettingsCategory) => void;
}

export const PomodoroTab: React.FC<PomodoroTabProps> = ({
  state,
  settings,
  onUpdateState,
  onOpenSettings,
}) => {
  // Format time MM:SS
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate current max duration for progress ring
  const currentTotalSeconds =
    state.mode === 'work'
      ? settings.workDuration * 60
      : state.mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;

  const progress = Math.max(0, Math.min(1, (currentTotalSeconds - state.timeLeft) / currentTotalSeconds));

  const togglePlay = () => {
    onUpdateState({ isRunning: !state.isRunning });
    if (!state.isRunning) {
      playChime(settings.alarmSound, settings.soundVolume * 0.4);
    }
  };

  const handleReset = () => {
    const defaultDuration =
      state.mode === 'work'
        ? settings.workDuration * 60
        : state.mode === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;

    onUpdateState({
      isRunning: false,
      timeLeft: defaultDuration,
    });
  };

  const handleSkip = () => {
    let nextMode: PomodoroState['mode'] = 'work';
    let nextCycle = state.currentCycle;
    let nextTotalSessions = state.totalCompletedSessions;

    if (state.mode === 'work') {
      nextTotalSessions += 1;
      if (state.currentCycle >= settings.cyclesBeforeLongBreak) {
        nextMode = 'longBreak';
        nextCycle = 1;
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      } else {
        nextMode = 'shortBreak';
        nextCycle += 1;
      }
    } else {
      nextMode = 'work';
    }

    const nextSeconds =
      nextMode === 'work'
        ? settings.workDuration * 60
        : nextMode === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;

    playChime(settings.alarmSound, settings.soundVolume);

    onUpdateState({
      mode: nextMode,
      currentCycle: nextCycle,
      totalCompletedSessions: nextTotalSessions,
      timeLeft: nextSeconds,
      isRunning: nextMode === 'work' ? settings.autoStartPomodoros : settings.autoStartBreaks,
    });
  };

  const setManualMode = (newMode: PomodoroState['mode']) => {
    const nextSeconds =
      newMode === 'work'
        ? settings.workDuration * 60
        : newMode === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;

    onUpdateState({
      mode: newMode,
      timeLeft: nextSeconds,
      isRunning: false,
    });
  };

  const modeThemes = {
    work: {
      label: 'Focus Session',
      color: 'text-amber-400',
      stroke: 'stroke-amber-400',
      bgGlow: 'from-amber-500/10 to-orange-500/5',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    shortBreak: {
      label: 'Short Break',
      color: 'text-emerald-400',
      stroke: 'stroke-emerald-400',
      bgGlow: 'from-emerald-500/10 to-teal-500/5',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    longBreak: {
      label: 'Long Rest',
      color: 'text-sky-400',
      stroke: 'stroke-sky-400',
      bgGlow: 'from-sky-500/10 to-indigo-500/5',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
  };

  const currentTheme = modeThemes[state.mode];

  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.65
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-between w-full space-y-3.5">
      {/* Mode Selector Chips */}
      <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
        <button
          id="btn-pomo-work-mode"
          onClick={() => setManualMode('work')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            state.mode === 'work'
              ? 'bg-amber-500/25 text-amber-300 shadow-sm border border-amber-400/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Work ({settings.workDuration}m)
        </button>
        <button
          id="btn-pomo-short-break-mode"
          onClick={() => setManualMode('shortBreak')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            state.mode === 'shortBreak'
              ? 'bg-emerald-500/25 text-emerald-300 shadow-sm border border-emerald-400/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Short Rest ({settings.shortBreakDuration}m)
        </button>
        <button
          id="btn-pomo-long-break-mode"
          onClick={() => setManualMode('longBreak')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            state.mode === 'longBreak'
              ? 'bg-sky-500/25 text-sky-300 shadow-sm border border-sky-400/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Long Rest ({settings.longBreakDuration}m)
        </button>
      </div>

      {/* Main Countdown Progress Circular Stage - Perfectly Centered */}
      <div className="relative flex items-center justify-center my-1">
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/10"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-700 ease-out fill-transparent ${currentTheme.stroke}`}
          />
        </svg>

        {/* Center Time & Status Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className={`px-2.5 py-0.5 mb-2 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase rounded-full border ${currentTheme.badge}`}>
            {currentTheme.label}
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md">
            {formattedTime}
          </div>

          {/* Cycle dots */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, idx) => {
              const isFilled = idx < state.currentCycle;
              const isCurrent = idx === state.currentCycle - 1 && state.mode === 'work';
              return (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-amber-400 ring-2 ring-amber-400/40 scale-125 animate-pulse'
                      : isFilled
                      ? 'bg-amber-400'
                      : 'bg-white/20'
                  }`}
                  title={`Round ${idx + 1} of ${settings.cyclesBeforeLongBreak}`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 font-mono">
            Cycle {state.currentCycle} / {settings.cyclesBeforeLongBreak}
          </span>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center justify-center gap-3 w-full">
        <button
          id="btn-pomo-reset"
          onClick={handleReset}
          className="p-3 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          title="Reset Current Interval"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-pomo-toggle-play"
          onClick={togglePlay}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 ${
            state.isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/25'
              : 'bg-white hover:bg-neutral-100 text-neutral-950 shadow-white/20'
          }`}
        >
          {state.isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        <button
          id="btn-pomo-skip"
          onClick={handleSkip}
          className="p-3 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          title="Skip to Next Cycle"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between w-full px-3 py-2 text-xs bg-white/[0.03] border border-white/5 rounded-lg text-neutral-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sessions Completed:</span>
          <strong className="text-white">{state.totalCompletedSessions}</strong>
        </span>
        <span className="text-neutral-500">
          Focus: {state.totalCompletedSessions * settings.workDuration}m
        </span>
      </div>
    </div>
  );
};
