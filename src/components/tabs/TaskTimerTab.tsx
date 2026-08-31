import React from 'react';
import { Play, Pause, RotateCcw, Plus, Target } from 'lucide-react';
import { TaskTimerState, SettingsCategory, ClockTimerStyle } from '../../types';
import { playChime } from '../../utils/audio';
import { getTimerFontClass } from '../../utils/timerThemes';

interface TaskTimerTabProps {
  timer: TaskTimerState;
  timerStyle?: ClockTimerStyle;
  onUpdateTimer: (newTimer: Partial<TaskTimerState>) => void;
  onOpenSettings?: (cat: SettingsCategory) => void;
}

export const TaskTimerTab: React.FC<TaskTimerTabProps> = ({
  timer,
  timerStyle = 'default',
  onUpdateTimer,
  onOpenSettings,
}) => {
  // Format HH:MM:SS
  const h = Math.floor(timer.timeLeft / 3600);
  const m = Math.floor((timer.timeLeft % 3600) / 60);
  const s = timer.timeLeft % 60;
  const formattedDisplay = `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(
    2,
    '0'
  )}:${String(s).padStart(2, '0')}`;

  const progress =
    timer.duration > 0
      ? Math.max(0, Math.min(1, (timer.duration - timer.timeLeft) / timer.duration))
      : 0;

  const toggleTimer = () => {
    if (timer.timeLeft <= 0) {
      // If completed or at 0, reset to initial duration
      onUpdateTimer({
        timeLeft: timer.duration,
        isRunning: true,
        isCompleted: false,
      });
      playChime('bell', 0.5);
      return;
    }

    onUpdateTimer({ isRunning: !timer.isRunning });
    if (!timer.isRunning) {
      playChime('bell', 0.4);
    }
  };

  const handleReset = () => {
    onUpdateTimer({
      timeLeft: timer.duration,
      isRunning: false,
      isCompleted: false,
    });
  };

  const addTime = (additionalSeconds: number) => {
    const newTimeLeft = Math.max(0, timer.timeLeft + additionalSeconds);
    const newDuration = Math.max(newTimeLeft, timer.duration + (additionalSeconds > 0 ? additionalSeconds : 0));
    onUpdateTimer({
      timeLeft: newTimeLeft,
      duration: newDuration,
      isCompleted: false,
    });
  };

  return (
    <div className="flex flex-col items-center justify-between w-full space-y-4 py-1">
      {/* Task Objective Header Input */}
      <div className="w-full relative">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#FCFAF6] border border-[#E2DBD0] rounded-xl focus-within:border-[#C84B31] transition-colors shadow-sm">
          <Target className="w-4 h-4 text-[#C84B31] shrink-0" />
          <input
            id="task-timer-objective-input"
            type="text"
            placeholder="What chapter or assignment are you working on?"
            value={timer.taskTitle}
            onChange={(e) => onUpdateTimer({ taskTitle: e.target.value })}
            className="w-full bg-transparent text-xs sm:text-sm text-[#211F1C] placeholder-[#8F877A] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center my-3 sm:my-5 text-center select-none">
        <div className={`text-6xl sm:text-7xl tracking-tight text-[#211F1C] transition-all ${getTimerFontClass(timerStyle)}`}>
          {formattedDisplay}
        </div>

        <button
          onClick={() => onOpenSettings?.('timer')}
          className="text-xs text-[#5C564C] hover:text-[#C84B31] mt-3 font-mono flex items-center gap-2 transition-colors cursor-pointer group"
          title="Click to configure timer duration and typography styles"
        >
          <span className="group-hover:underline">{Math.round(progress * 100)}% Done</span>
          <span className="text-[#A39B8E]">•</span>
          <span className="group-hover:underline">Target: {Math.round(timer.duration / 60)}m</span>
        </button>
      </div>

      {/* Quick Extension Adjustments (+5m, +15m, +30m, -5m) */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        <button
          id="btn-timer-sub-5m"
          onClick={() => addTime(-5 * 60)}
          disabled={timer.timeLeft <= 300}
          className="px-2.5 py-1.5 bg-[#FCFAF6] hover:bg-[#F0EAE1] disabled:opacity-40 disabled:hover:bg-[#FCFAF6] border border-[#E2DBD0] rounded-lg text-xs font-mono text-[#5C564C] transition-all"
          title="Subtract 5 minutes"
        >
          -5m
        </button>
        <button
          id="btn-timer-add-5m"
          onClick={() => addTime(5 * 60)}
          className="px-3 py-1.5 bg-[#FBEBE8] hover:bg-[#F7DDD7] border border-[#F2C2BA] rounded-lg text-xs font-mono text-[#C84B31] font-bold transition-all flex items-center gap-1"
          title="Extend by 5 minutes"
        >
          <Plus className="w-3 h-3" /> 5m
        </button>
        <button
          id="btn-timer-add-15m"
          onClick={() => addTime(15 * 60)}
          className="px-3 py-1.5 bg-[#FBEBE8] hover:bg-[#F7DDD7] border border-[#F2C2BA] rounded-lg text-xs font-mono text-[#C84B31] font-bold transition-all flex items-center gap-1"
          title="Extend by 15 minutes"
        >
          <Plus className="w-3 h-3" /> 15m
        </button>
        <button
          id="btn-timer-add-30m"
          onClick={() => addTime(30 * 60)}
          className="px-2.5 py-1.5 bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-lg text-xs font-mono text-[#5C564C] transition-all"
          title="Extend by 30 minutes"
        >
          +30m
        </button>
      </div>

      {/* Main Play / Pause Controls */}
      <div className="flex items-center justify-center gap-3 w-full">
        <button
          id="btn-task-timer-reset"
          onClick={handleReset}
          className="p-3 text-[#5C564C] hover:text-[#211F1C] bg-[#FCFAF6] hover:bg-[#F0EAE1] border border-[#E2DBD0] rounded-xl transition-all shadow-[0_1px_3px_rgba(40,30,20,0.05)]"
          title="Reset timer to allocated target"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-task-timer-toggle-play"
          onClick={toggleTimer}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_2px_8px_rgba(40,30,20,0.12)] active:scale-95 ${
            timer.isRunning
              ? 'bg-[#FCFAF6] hover:bg-[#F0EAE1] text-[#C84B31] border border-[#E2DBD0]'
              : 'bg-[#C84B31] hover:bg-[#B53F27] text-[#FCFAF6]'
          }`}
        >
          {timer.isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Task</span>
            </>
          ) : timer.isCompleted ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Restart Task</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Start Task</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
