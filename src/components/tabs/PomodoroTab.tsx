import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
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
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    shortBreak: {
      label: 'Short Rest',
      color: 'text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    longBreak: {
      label: 'Long Rest',
      color: 'text-sky-400',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
  };

  const currentTheme = modeThemes[state.mode];

  return (
    <div className="flex flex-col items-center justify-between w-full space-y-4 py-1">
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

      {/* Main Countdown Display without circle */}
      <div className="flex flex-col items-center justify-center my-3 sm:my-5 text-center select-none">
        <span className={`px-3 py-0.5 mb-3 text-[11px] font-semibold tracking-wider uppercase rounded-full border ${currentTheme.badge}`}>
          {currentTheme.label}
        </span>
        
        <div className="text-6xl sm:text-7xl font-timer-default tracking-tight text-white drop-shadow-md">
          {formattedTime}
        </div>

        {/* Cycle indicator dots */}
        <div className="flex items-center gap-2 mt-4">
          {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, idx) => {
            const isFilled = idx < state.currentCycle;
            const isCurrent = idx === state.currentCycle - 1 && state.mode === 'work';
            return (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
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
        <span className="text-[11px] text-neutral-400 mt-1.5 font-mono">
          Cycle {state.currentCycle} / {settings.cyclesBeforeLongBreak}
        </span>
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
      <div className="flex items-center justify-between w-full px-3.5 py-2 text-xs bg-white/[0.03] border border-white/5 rounded-xl text-neutral-400 font-mono">
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

