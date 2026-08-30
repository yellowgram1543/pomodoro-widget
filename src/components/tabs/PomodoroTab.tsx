import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PomodoroSettings, PomodoroState, SettingsCategory, PomodoroTimerStyle } from '../../types';
import { playChime } from '../../utils/audio';

interface PomodoroTabProps {
  state: PomodoroState;
  settings: PomodoroSettings;
  timerStyle?: PomodoroTimerStyle;
  onUpdateState: (newState: Partial<PomodoroState>) => void;
  onUpdateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  onOpenSettings?: (cat: SettingsCategory) => void;
}

export const PomodoroTab: React.FC<PomodoroTabProps> = ({
  state,
  settings,
  timerStyle = 'default',
  onUpdateState,
  onOpenSettings,
}) => {
  // Format time MM:SS
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');
  const formattedTime = `${mStr}:${sStr}`;

  const currentTotalSeconds =
    state.mode === 'work'
      ? settings.workDuration * 60
      : state.mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;

  const progress = Math.max(
    0,
    Math.min(1, (currentTotalSeconds - state.timeLeft) / Math.max(1, currentTotalSeconds))
  );

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
      fillColor: '#fbbf24',
      bgBar: 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]',
      dotLit: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110',
    },
    shortBreak: {
      label: 'Short Rest',
      color: 'text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      fillColor: '#34d399',
      bgBar: 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]',
      dotLit: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-110',
    },
    longBreak: {
      label: 'Long Rest',
      color: 'text-sky-400',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      fillColor: '#38bdf8',
      bgBar: 'bg-gradient-to-r from-sky-500 to-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]',
      dotLit: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-110',
    },
  };

  const currentTheme = modeThemes[state.mode];

  // Render the chosen timer visual style
  const renderTimerDisplay = () => {
    switch (timerStyle) {
      case 'flipClock':
        return (
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-3">
            {/* Minutes Digits */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <FlipDigit digit={mStr[0]} />
              <FlipDigit digit={mStr[1]} />
            </div>

            {/* Pulsing Mechanical Colon */}
            <div className="flex flex-col gap-2.5 px-0.5 sm:px-1">
              <span
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                  state.isRunning
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                    : 'bg-white/30'
                }`}
              />
              <span
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                  state.isRunning
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                    : 'bg-white/30'
                }`}
              />
            </div>

            {/* Seconds Digits */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <FlipDigit digit={sStr[0]} />
              <FlipDigit digit={sStr[1]} />
            </div>
          </div>
        );

      case 'progressBar':
        return (
          <div className="flex flex-col items-center justify-center w-full max-w-xs space-y-3.5 my-2">
            <div className="text-6xl sm:text-7xl font-timer-default tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </div>
            <div className="w-full h-3.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/15 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${currentTheme.bgBar}`}
                style={{ width: `${Math.max(3, Math.min(100, progress * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between w-full text-[11px] font-mono text-neutral-400 px-1">
              <span>{Math.round(progress * 100)}% elapsed</span>
              <span>{Math.ceil(state.timeLeft / 60)}m left</span>
            </div>
          </div>
        );

      case 'gauge':
        const radius = 46;
        const circ = 2 * Math.PI * radius;
        const offset = circ * (1 - progress);
        return (
          <div className="relative flex flex-col items-center justify-center my-1">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <g transform="rotate(-90 60 60)">
                  {/* Background Track Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="9"
                    className="text-neutral-800/90"
                    fill="transparent"
                  />
                  {/* Active Dynamic Progress Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth="9"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`transition-all duration-500 ease-out fill-transparent stroke-current ${currentTheme.color}`}
                  />
                </g>
              </svg>
              {/* Perfectly Centered Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight drop-shadow-md tabular-nums leading-none">
                  {formattedTime}
                </span>
                <span className="text-xs font-mono font-semibold text-neutral-400 mt-2.5 leading-none">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>
          </div>
        );

      case 'dotMatrix':
        const totalDots = 30; // 3 rows x 10 cols
        const activeCount = Math.round(progress * totalDots);
        return (
          <div className="flex flex-col items-center justify-center space-y-3.5 my-2">
            <div className="grid grid-cols-10 gap-2 p-3 bg-neutral-900/80 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
              {Array.from({ length: totalDots }).map((_, idx) => {
                const isLit = idx < activeCount;
                return (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      isLit ? currentTheme.dotLit : 'bg-white/15'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="flex flex-col items-center justify-center space-y-3 my-2">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-2 border-white/15 bg-neutral-900/90 shadow-xl flex items-center justify-center">
              <div
                className="w-full h-full rounded-full transition-all duration-500"
                style={{
                  background: `conic-gradient(${currentTheme.fillColor} ${progress * 360}deg, rgba(255,255,255,0.12) 0deg)`,
                }}
              />
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </div>
          </div>
        );

      case 'default':
      default:
        return (
          <div className="text-6xl sm:text-7xl font-timer-default tracking-tight text-white drop-shadow-md my-2">
            {formattedTime}
          </div>
        );
    }
  };

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

      {/* Main Countdown Display using active timerStyle */}
      <div className="flex flex-col items-center justify-center my-2 sm:my-3 text-center select-none w-full">
        <button
          onClick={() => onOpenSettings?.('pomodoro')}
          className={`px-3 py-0.5 mb-2 text-[11px] font-semibold tracking-wider uppercase rounded-full border ${currentTheme.badge} hover:opacity-80 transition-opacity cursor-pointer`}
          title="Click to customize Pomodoro intervals and style"
        >
          {currentTheme.label}
        </button>

        {renderTimerDisplay()}

        {/* Cycle indicator dots */}
        <div className="flex items-center gap-2 mt-3">
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

// Retro mechanical split-flap flip digit card with authentic 3D page flip animation
const FlipDigit: React.FC<{ digit: string }> = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (digit !== current) {
      setPrevious(current);
      setCurrent(digit);
      setIsFlipping(true);
      setFlipKey((prev) => prev + 1);

      const timeout = setTimeout(() => {
        setIsFlipping(false);
      }, 550);

      return () => clearTimeout(timeout);
    }
  }, [digit, current]);

  return (
    <div className="relative w-12 sm:w-15 h-16 sm:h-20 bg-neutral-950 rounded-xl shadow-2xl overflow-hidden font-mono font-black text-3xl sm:text-4xl text-white select-none">
      {/* 1. Static Top Half (Displays incoming/current digit top half) */}
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-t-xl border-t border-x border-white/15 border-b border-black/90">
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 flex items-center justify-center">
          <span className="tabular-nums leading-none drop-shadow">{current}</span>
        </div>
        <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />
      </div>

      {/* 2. Static Bottom Half (Displays previous or settled current digit bottom half) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-b-xl border-b border-x border-white/15 border-t border-black/90">
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 flex items-center justify-center">
          <span className="tabular-nums leading-none drop-shadow">
            {isFlipping ? previous : current}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </div>

      {/* 3. Flipping Top Leaf (Flips down from 0deg to -90deg showing previous top half) */}
      {isFlipping && (
        <div
          key={`flip-top-${flipKey}`}
          className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-t-xl border-t border-x border-white/15 border-b border-black/90 origin-bottom animate-flip-top z-20"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-16 sm:h-20 flex items-center justify-center">
            <span className="tabular-nums leading-none drop-shadow">{previous}</span>
          </div>
          <div className="absolute inset-0 bg-black animate-flip-shadow-top pointer-events-none" />
        </div>
      )}

      {/* 4. Flipping Bottom Leaf (Flips down from 90deg to 0deg showing current bottom half) */}
      {isFlipping && (
        <div
          key={`flip-bot-${flipKey}`}
          className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-b-xl border-b border-x border-white/15 border-t border-black/90 origin-top animate-flip-bottom z-20"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 flex items-center justify-center">
            <span className="tabular-nums leading-none drop-shadow">{current}</span>
          </div>
          <div className="absolute inset-0 bg-black animate-flip-shadow-bottom pointer-events-none" />
        </div>
      )}

      {/* 5. Center Split Crease & Side Mechanical Grooves */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-black shadow-md z-30 pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2.5 bg-neutral-950 border-r border-white/10 rounded-r-sm z-30 pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-2.5 bg-neutral-950 border-l border-white/10 rounded-l-sm z-30 pointer-events-none" />
    </div>
  );
};

