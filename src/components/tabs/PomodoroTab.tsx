import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, BookOpen } from 'lucide-react';
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
      color: 'text-[#C84B31]',
      badge: 'bg-[#FBEBE8] text-[#C84B31] border-[#F2C2BA]',
      fillColor: '#C84B31',
      bgBar: 'bg-[#C84B31]',
      dotLit: 'bg-[#C84B31] scale-110',
    },
    shortBreak: {
      label: 'Tea Rest',
      color: 'text-[#4A7C59]',
      badge: 'bg-[#EBF2ED] text-[#4A7C59] border-[#C2D8C9]',
      fillColor: '#4A7C59',
      bgBar: 'bg-[#4A7C59]',
      dotLit: 'bg-[#4A7C59] scale-110',
    },
    longBreak: {
      label: 'Quiet Break',
      color: 'text-[#3D5A73]',
      badge: 'bg-[#ECF2F6] text-[#3D5A73] border-[#C3D5E3]',
      fillColor: '#3D5A73',
      bgBar: 'bg-[#3D5A73]',
      dotLit: 'bg-[#3D5A73] scale-110',
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
                    ? 'bg-[#C84B31] scale-110'
                    : 'bg-[#CFC5B6]'
                }`}
              />
              <span
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                  state.isRunning
                    ? 'bg-[#C84B31] scale-110'
                    : 'bg-[#CFC5B6]'
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
            <div className="text-6xl sm:text-7xl font-timer-default tracking-tight text-[#211F1C]">
              {formattedTime}
            </div>
            <div className="w-full h-3 bg-[#EFE9DF] rounded-full overflow-hidden p-0.5 border border-[#E2DBD0]">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${currentTheme.bgBar}`}
                style={{ width: `${Math.max(3, Math.min(100, progress * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between w-full text-[11px] font-mono text-[#5C564C] px-1">
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
                    stroke="#EFE9DF"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Active Dynamic Progress Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth="8"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`transition-all duration-500 ease-out fill-transparent stroke-current ${currentTheme.color}`}
                  />
                </g>
              </svg>
              {/* Perfectly Centered Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-4xl sm:text-5xl font-mono font-black text-[#211F1C] tracking-tight tabular-nums leading-none">
                  {formattedTime}
                </span>
                <span className="text-xs font-mono font-semibold text-[#8F877A] mt-2.5 leading-none">
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
            <div className="grid grid-cols-10 gap-2 p-3 bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl shadow-inner">
              {Array.from({ length: totalDots }).map((_, idx) => {
                const isLit = idx < activeCount;
                return (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      isLit ? currentTheme.dotLit : 'bg-[#E2DBD0]'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#211F1C]">
              {formattedTime}
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="flex flex-col items-center justify-center space-y-3 my-2">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-2 border-[#E2DBD0] bg-[#FCFAF6] shadow-md flex items-center justify-center">
              <div
                className="w-full h-full rounded-full transition-all duration-500"
                style={{
                  background: `conic-gradient(${currentTheme.fillColor} ${progress * 360}deg, #EFE9DF 0deg)`,
                }}
              />
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-[#211F1C]">
              {formattedTime}
            </div>
          </div>
        );

      case 'default':
      default:
        return (
          <div className="text-6xl sm:text-7xl font-timer-default tracking-tight text-[#211F1C] my-2">
            {formattedTime}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full space-y-4 py-1">
      {/* Mode Selector Chips */}
      <div className="flex items-center p-1 bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl">
        <button
          id="btn-pomo-work-mode"
          onClick={() => setManualMode('work')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
            state.mode === 'work'
              ? 'bg-[#FCFAF6] text-[#C84B31] shadow-sm border border-[#E2DBD0]'
              : 'text-[#6B645A] hover:text-[#211F1C]'
          }`}
        >
          Focus ({settings.workDuration}m)
        </button>
        <button
          id="btn-pomo-short-break-mode"
          onClick={() => setManualMode('shortBreak')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
            state.mode === 'shortBreak'
              ? 'bg-[#FCFAF6] text-[#4A7C59] shadow-sm border border-[#E2DBD0]'
              : 'text-[#6B645A] hover:text-[#211F1C]'
          }`}
        >
          Tea Rest ({settings.shortBreakDuration}m)
        </button>
        <button
          id="btn-pomo-long-break-mode"
          onClick={() => setManualMode('longBreak')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
            state.mode === 'longBreak'
              ? 'bg-[#FCFAF6] text-[#3D5A73] shadow-sm border border-[#E2DBD0]'
              : 'text-[#6B645A] hover:text-[#211F1C]'
          }`}
        >
          Quiet Break ({settings.longBreakDuration}m)
        </button>
      </div>

      {/* Main Countdown Display using active timerStyle */}
      <div className="flex flex-col items-center justify-center my-2 sm:my-3 text-center select-none w-full">
        <button
          onClick={() => onOpenSettings?.('pomodoro')}
          className={`px-3 py-0.5 mb-2 text-[11px] font-bold tracking-wider uppercase rounded-full border ${currentTheme.badge} hover:opacity-85 transition-opacity cursor-pointer`}
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
                    ? 'bg-[#C84B31] ring-2 ring-[#C84B31]/30 scale-110'
                    : isFilled
                    ? 'bg-[#C84B31]'
                    : 'bg-[#E2DBD0]'
                }`}
                title={`Round ${idx + 1} of ${settings.cyclesBeforeLongBreak}`}
              />
            );
          })}
        </div>
        <span className="text-[11px] text-[#8F877A] mt-1.5 font-mono">
          Cycle {state.currentCycle} / {settings.cyclesBeforeLongBreak}
        </span>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center justify-center gap-3 w-full">
        <button
          id="btn-pomo-reset"
          onClick={handleReset}
          className="p-3 text-[#5C564C] hover:text-[#211F1C] bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl transition-all shadow-[0_1px_3px_rgba(40,30,20,0.05)]"
          title="Reset Current Interval"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-pomo-toggle-play"
          onClick={togglePlay}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_2px_8px_rgba(40,30,20,0.12)] active:scale-95 ${
            state.isRunning
              ? 'bg-[#FCFAF6] hover:bg-[#F0EAE1] text-[#C84B31] border border-[#E2DBD0]'
              : 'bg-[#C84B31] hover:bg-[#B53F27] text-[#FCFAF6]'
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
          className="p-3 text-[#5C564C] hover:text-[#211F1C] bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl transition-all shadow-[0_1px_3px_rgba(40,30,20,0.05)]"
          title="Skip to Next Cycle"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between w-full px-3.5 py-2 text-xs bg-[#F6F3EB] border border-[#E2DBD0] rounded-xl text-[#5C564C] font-mono">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#C84B31]" />
          <span>Sessions Completed:</span>
          <strong className="text-[#211F1C]">{state.totalCompletedSessions}</strong>
        </span>
        <span className="text-[#8F877A]">
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
    <div className="relative w-12 sm:w-15 h-16 sm:h-20 bg-[#211F1C] rounded-xl shadow-[0_4px_12px_rgba(40,30,20,0.18)] overflow-hidden font-mono font-black text-3xl sm:text-4xl text-[#FCFAF6] select-none border border-[#3A352F]">
      {/* 1. Static Top Half */}
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[#2D2A26] rounded-t-xl border-b border-[#1A1815]">
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 flex items-center justify-center">
          <span className="tabular-nums leading-none">{current}</span>
        </div>
      </div>

      {/* 2. Static Bottom Half */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#211F1C] rounded-b-xl border-t border-[#1A1815]">
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 flex items-center justify-center">
          <span className="tabular-nums leading-none">
            {isFlipping ? previous : current}
          </span>
        </div>
      </div>

      {/* 3. Flipping Top Leaf */}
      {isFlipping && (
        <div
          key={`flip-top-${flipKey}`}
          className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[#2D2A26] rounded-t-xl border-b border-[#1A1815] origin-bottom animate-flip-top z-20"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-16 sm:h-20 flex items-center justify-center">
            <span className="tabular-nums leading-none">{previous}</span>
          </div>
          <div className="absolute inset-0 bg-black animate-flip-shadow-top pointer-events-none" />
        </div>
      )}

      {/* 4. Flipping Bottom Leaf */}
      {isFlipping && (
        <div
          key={`flip-bot-${flipKey}`}
          className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#211F1C] rounded-b-xl border-t border-[#1A1815] origin-top animate-flip-bottom z-20"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 flex items-center justify-center">
            <span className="tabular-nums leading-none">{current}</span>
          </div>
          <div className="absolute inset-0 bg-black animate-flip-shadow-bottom pointer-events-none" />
        </div>
      )}

      {/* 5. Center Split Crease */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#151412] shadow-sm z-30 pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2.5 bg-[#1A1815] rounded-r-sm z-30 pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-2.5 bg-[#1A1815] rounded-l-sm z-30 pointer-events-none" />
    </div>
  );
};

