import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Clock, Target } from 'lucide-react';
import { TaskTimerState, SettingsCategory } from '../../types';
import { playChime } from '../../utils/audio';

interface TaskTimerTabProps {
  timer: TaskTimerState;
  onUpdateTimer: (newTimer: Partial<TaskTimerState>) => void;
  onOpenSettings?: (cat: SettingsCategory) => void;
}

export const TaskTimerTab: React.FC<TaskTimerTabProps> = ({ timer, onUpdateTimer, onOpenSettings }) => {
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

  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.65
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-between w-full space-y-3.5">
      {/* Task Objective Header Input */}
      <div className="w-full relative">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus-within:border-cyan-400/50 transition-colors">
          <Target className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            id="task-timer-objective-input"
            type="text"
            placeholder="What target are you working on right now?"
            value={timer.taskTitle}
            onChange={(e) => onUpdateTimer({ taskTitle: e.target.value })}
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Progress & Countdown Circle Display - Perfectly Centered */}
      <div className="relative flex items-center justify-center my-1">
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/10"
            fill="transparent"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="stroke-cyan-400 transition-all duration-700 ease-out fill-transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <button
            onClick={() => onOpenSettings?.('timer')}
            className="pointer-events-auto px-2.5 py-0.5 mb-2 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all"
            title="Click to configure target duration in settings"
          >
            {timer.isCompleted ? 'Target Achieved' : 'Custom Task Timer'}
          </button>

          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md">
            {formattedDisplay}
          </div>

          <div className="text-[11px] text-neutral-400 mt-2 font-mono flex items-center gap-1.5">
            <span>{Math.round(progress * 100)}%</span>
            <span className="text-neutral-600">•</span>
            <span>Target: {Math.round(timer.duration / 60)}m</span>
          </div>
        </div>
      </div>

      {/* Quick Extension Adjustments (+5m, +15m, +30m, -5m) */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        <button
          id="btn-timer-sub-5m"
          onClick={() => addTime(-5 * 60)}
          disabled={timer.timeLeft <= 300}
          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-neutral-300 transition-all"
          title="Subtract 5 minutes"
        >
          -5m
        </button>
        <button
          id="btn-timer-add-5m"
          onClick={() => addTime(5 * 60)}
          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-300 font-semibold transition-all flex items-center gap-1"
          title="Extend by 5 minutes"
        >
          <Plus className="w-3 h-3" /> 5m
        </button>
        <button
          id="btn-timer-add-15m"
          onClick={() => addTime(15 * 60)}
          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-300 font-semibold transition-all flex items-center gap-1"
          title="Extend by 15 minutes"
        >
          <Plus className="w-3 h-3" /> 15m
        </button>
        <button
          id="btn-timer-add-30m"
          onClick={() => addTime(30 * 60)}
          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-neutral-300 transition-all"
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
          className="p-3 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          title="Reset timer to allocated target"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-task-timer-toggle-play"
          onClick={toggleTimer}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 ${
            timer.isRunning
              ? 'bg-cyan-400 hover:bg-cyan-300 text-neutral-950 shadow-cyan-400/25'
              : 'bg-white hover:bg-neutral-100 text-neutral-950 shadow-white/20'
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
