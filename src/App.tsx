/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Settings as SettingsIcon } from 'lucide-react';
import {
  PomodoroState,
  PomodoroSettings,
  TaskTimerState,
  Task,
  MediaSettings,
  TabType,
  AmbientSource,
  TaskPriority,
  SettingsCategory,
  ClockTimerStyle,
  PomodoroTimerStyle,
} from './types';
import { AMBIENT_PRESETS } from './utils/youtube';
import { playChime } from './utils/audio';
import { AmbientBackground } from './components/AmbientBackground';
import { FocusHub } from './components/FocusHub';
import { TopBar } from './components/TopBar';
import { SettingsPanel } from './components/SettingsPanel';

const INITIAL_POMO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  alarmSound: 'bell',
  soundVolume: 0.7,
};

const INITIAL_MEDIA_SETTINGS: MediaSettings = {
  currentSource: {
    videoId: 'jfKfPfyJRdk', // Default Tokyo rainy lofi beats
    listId: null,
    title: 'Rainy Tokyo Coffee Shop',
  },
  playlist: [
    {
      id: 'init-1',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      title: 'Rainy Tokyo Coffee Shop',
      videoId: 'jfKfPfyJRdk',
      listId: null,
      addedAt: Date.now(),
    },
    {
      id: 'init-2',
      url: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
      title: 'Cozy Rain & Thunderstorm',
      videoId: 'mPZkdNFkNps',
      listId: null,
      addedAt: Date.now() + 1,
    },
  ],
  currentIndex: 0,
  volume: 50,
  isMuted: true, // Start muted for browser autoplay policy compliance
  isPlaying: true,
  playbackRate: 1,
  ambientSound: 'none',
  ambientSoundVolume: 60,
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Draft Ambient Dashboard Architecture',
    completed: true,
    createdAt: Date.now() - 3600000,
    priority: 'high',
  },
  {
    id: 'task-2',
    title: 'Deep Focus Sprint: Core Feature Implementation',
    completed: false,
    createdAt: Date.now() - 1800000,
    priority: 'high',
  },
  {
    id: 'task-3',
    title: 'Curate relaxing study ambient playlists',
    completed: false,
    createdAt: Date.now() - 900000,
    priority: 'medium',
  },
];

export default function App() {
  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('pomodoro');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>('pomodoro');

  const handleOpenSettings = (cat: SettingsCategory = 'pomodoro') => {
    setSettingsCategory(cat);
    setIsSettingsOpen(true);
  };

  // 1. Pomodoro State & Settings
  const [pomoSettings, setPomoSettings] = useState<PomodoroSettings>(() => {
    try {
      const saved = localStorage.getItem('ambient_pomo_settings');
      return saved ? { ...INITIAL_POMO_SETTINGS, ...JSON.parse(saved) } : INITIAL_POMO_SETTINGS;
    } catch {
      return INITIAL_POMO_SETTINGS;
    }
  });

  const [pomoState, setPomoState] = useState<PomodoroState>({
    mode: 'work',
    timeLeft: pomoSettings.workDuration * 60,
    isRunning: false,
    currentCycle: 1,
    totalCompletedSessions: 0,
  });

  // 2. Task Timer State
  const [taskTimer, setTaskTimer] = useState<TaskTimerState>(() => {
    try {
      const saved = localStorage.getItem('ambient_task_timer');
      return saved
        ? JSON.parse(saved)
        : {
            duration: 25 * 60,
            timeLeft: 25 * 60,
            isRunning: false,
            taskTitle: 'Deep Focus Sprint',
            isCompleted: false,
          };
    } catch {
      return {
        duration: 25 * 60,
        timeLeft: 25 * 60,
        isRunning: false,
        taskTitle: 'Deep Focus Sprint',
        isCompleted: false,
      };
    }
  });

  // 3. Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('ambient_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // 4. Media & Ambient Background State
  const [media, setMedia] = useState<MediaSettings>(() => {
    try {
      const saved = localStorage.getItem('ambient_media_settings');
      return saved ? { ...INITIAL_MEDIA_SETTINGS, ...JSON.parse(saved) } : INITIAL_MEDIA_SETTINGS;
    } catch {
      return INITIAL_MEDIA_SETTINGS;
    }
  });

  // 5. Clock & Timer Textual Typography Style
  const [clockTimerStyle, setClockTimerStyle] = useState<ClockTimerStyle>(() => {
    try {
      const saved = localStorage.getItem('ambient_clock_timer_style');
      return (saved as ClockTimerStyle) || 'default';
    } catch {
      return 'default';
    }
  });

  // 6. Pomodoro Timer Style (Default, Flip Clock, Progress Bar, Gauge, Dot Matrix, Pie)
  const [pomoTimerStyle, setPomoTimerStyle] = useState<PomodoroTimerStyle>(() => {
    try {
      const saved = localStorage.getItem('ambient_pomo_timer_style');
      return (saved as PomodoroTimerStyle) || 'default';
    } catch {
      return 'default';
    }
  });

  // Keep localStorage synchronized
  useEffect(() => {
    localStorage.setItem('ambient_pomo_settings', JSON.stringify(pomoSettings));
  }, [pomoSettings]);

  useEffect(() => {
    localStorage.setItem('ambient_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ambient_media_settings', JSON.stringify(media));
  }, [media]);

  useEffect(() => {
    localStorage.setItem('ambient_task_timer', JSON.stringify(taskTimer));
  }, [taskTimer]);

  useEffect(() => {
    localStorage.setItem('ambient_clock_timer_style', clockTimerStyle);
  }, [clockTimerStyle]);

  useEffect(() => {
    localStorage.setItem('ambient_pomo_timer_style', pomoTimerStyle);
  }, [pomoTimerStyle]);

  // Pomodoro Timer Engine Loop
  useEffect(() => {
    if (!pomoState.isRunning) return;

    const timerInterval = setInterval(() => {
      setPomoState((prev) => {
        if (prev.timeLeft > 1) {
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        }

        // Interval finished! Execute state transition and chime
        let nextMode: PomodoroState['mode'] = 'work';
        let nextCycle = prev.currentCycle;
        let nextTotalSessions = prev.totalCompletedSessions;

        if (prev.mode === 'work') {
          nextTotalSessions += 1;
          if (prev.currentCycle >= pomoSettings.cyclesBeforeLongBreak) {
            nextMode = 'longBreak';
            nextCycle = 1;
            try {
              confetti({
                particleCount: 100,
                spread: 80,
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

        const nextDuration =
          nextMode === 'work'
            ? pomoSettings.workDuration * 60
            : nextMode === 'shortBreak'
            ? pomoSettings.shortBreakDuration * 60
            : pomoSettings.longBreakDuration * 60;

        playChime(pomoSettings.alarmSound, pomoSettings.soundVolume);

        const shouldAutoStart =
          nextMode === 'work'
            ? pomoSettings.autoStartPomodoros
            : pomoSettings.autoStartBreaks;

        return {
          mode: nextMode,
          timeLeft: nextDuration,
          currentCycle: nextCycle,
          totalCompletedSessions: nextTotalSessions,
          isRunning: shouldAutoStart,
        };
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [pomoState.isRunning, pomoSettings]);

  // Dedicated Task Timer Engine Loop
  useEffect(() => {
    if (!taskTimer.isRunning) return;

    const interval = setInterval(() => {
      setTaskTimer((prev) => {
        if (prev.timeLeft > 1) {
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        }

        // Task Timer completed
        playChime(pomoSettings.alarmSound, pomoSettings.soundVolume);
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        return {
          ...prev,
          timeLeft: 0,
          isRunning: false,
          isCompleted: true,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [taskTimer.isRunning, pomoSettings.alarmSound, pomoSettings.soundVolume]);

  // Global Keyboard Shortcuts (Space to play/pause active timer, M to toggle mute, Z for Zen Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is focused inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (activeTab === 'pomodoro') {
          setPomoState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
        } else if (activeTab === 'timer') {
          setTaskTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }));
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMedia((prev) => ({ ...prev, isMuted: !prev.isMuted }));
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Task Action Handlers
  const handleAddTask = (title: string, priority: TaskPriority) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      createdAt: Date.now(),
      priority,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompletedTasks = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handleSelectPreset = (preset: AmbientSource) => {
    setMedia((prev) => ({
      ...prev,
      currentSource: {
        videoId: preset.videoId,
        listId: preset.listId,
        title: preset.title,
      },
      isPlaying: true,
    }));
  };

  const handleUpdatePomoState = (newState: Partial<PomodoroState>) => {
    setPomoState((prev) => ({ ...prev, ...newState }));
  };

  const handleUpdatePomoSettings = (newSettings: Partial<PomodoroSettings>) => {
    setPomoSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdateTaskTimer = (newTimer: Partial<TaskTimerState>) => {
    setTaskTimer((prev) => ({ ...prev, ...newTimer }));
  };

  const handleUpdateMedia = (newMedia: Partial<MediaSettings>) => {
    setMedia((prev) => ({ ...prev, ...newMedia }));
  };

  return (
    <div id="ambient-dashboard-root" className="relative w-screen h-screen overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* Background: Modern Extension Desktop Canvas */}
      <AmbientBackground />

      {/* Top Controls Header Bar */}
      {!isZenMode && (
        <TopBar
          media={media}
          onUpdateMedia={handleUpdateMedia}
          onSelectPreset={handleSelectPreset}
          isZenMode={isZenMode}
          setIsZenMode={setIsZenMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {/* Layer 2: Draggable Glassmorphic Focus Hub Widget */}
      {!isZenMode && (
        <FocusHub
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pomoState={pomoState}
          pomoSettings={pomoSettings}
          onUpdatePomoState={handleUpdatePomoState}
          onUpdatePomoSettings={handleUpdatePomoSettings}
          taskTimer={taskTimer}
          onUpdateTaskTimer={handleUpdateTaskTimer}
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onClearCompleted={handleClearCompletedTasks}
          media={media}
          onUpdateMedia={handleUpdateMedia}
          onSelectPreset={handleSelectPreset}
          onOpenSettings={handleOpenSettings}
          clockTimerStyle={clockTimerStyle}
          pomoTimerStyle={pomoTimerStyle}
        />
      )}

      {/* Zen Mode Overlay Quick Exit Pill */}
      {isZenMode && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <button
            onClick={() => setIsZenMode(false)}
            className="px-5 py-2.5 bg-neutral-950/80 hover:bg-neutral-900 border border-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-xl shadow-2xl transition-all flex items-center gap-2"
          >
            <span>Exit Zen Mode (Press Esc)</span>
          </button>
        </div>
      )}

      {/* Floating Bottom-Right Settings Button */}
      {!isZenMode && (
        <div className="fixed bottom-4 right-6 z-40 flex items-center gap-2 pointer-events-auto">
          <button
            id="btn-bottom-right-settings"
            onClick={() => handleOpenSettings('appearance')}
            className="p-2 bg-neutral-950/60 hover:bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all shadow-lg active:scale-95"
            title="Focus Hub Settings & Themes"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slide-over Two-Part Settings Drawer */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialCategory={settingsCategory}
        pomoSettings={pomoSettings}
        onUpdatePomoSettings={handleUpdatePomoSettings}
        pomoState={pomoState}
        onUpdatePomoState={handleUpdatePomoState}
        taskTimer={taskTimer}
        onUpdateTaskTimer={handleUpdateTaskTimer}
        media={media}
        onUpdateMedia={handleUpdateMedia}
        clockTimerStyle={clockTimerStyle}
        onUpdateClockTimerStyle={setClockTimerStyle}
        pomoTimerStyle={pomoTimerStyle}
        onUpdatePomoTimerStyle={setPomoTimerStyle}
      />

      {/* Keyboard Shortcut Hints Footer Bar */}
      {!isZenMode && (
        <footer className="fixed bottom-3 left-6 right-20 z-10 hidden md:flex items-center justify-between text-[11px] text-neutral-400/80 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-[10px] font-mono text-neutral-300">Space</kbd>
              <span>Play/Pause</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-[10px] font-mono text-neutral-300">M</kbd>
              <span>Mute</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-[10px] font-mono text-neutral-300">Z</kbd>
              <span>Zen Mode</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Ambient Stream Active</span>
          </div>
        </footer>
      )}
    </div>
  );
}
