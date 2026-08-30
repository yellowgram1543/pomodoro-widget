import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  GripHorizontal,
  Timer as TimerIcon,
  Clock,
  CheckSquare,
  Radio,
  Minimize2,
  Maximize2,
  Tv,
  Move,
  Scaling,
  Maximize,
  ExternalLink,
  Pin,
  Sparkles,
  ArrowDownLeft,
  PictureInPicture2,
} from 'lucide-react';
import {
  TabType,
  PomodoroState,
  PomodoroSettings,
  TaskTimerState,
  Task,
  MediaSettings,
  AmbientSource,
  TaskPriority,
  WidgetSizePreset,
} from '../types';
import { PomodoroTab } from './tabs/PomodoroTab';
import { TaskTimerTab } from './tabs/TaskTimerTab';
import { TaskManagerTab } from './tabs/TaskManagerTab';
import { MediaTab } from './tabs/MediaTab';

interface FocusHubProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pomoState: PomodoroState;
  pomoSettings: PomodoroSettings;
  onUpdatePomoState: (s: Partial<PomodoroState>) => void;
  onUpdatePomoSettings: (s: Partial<PomodoroSettings>) => void;
  taskTimer: TaskTimerState;
  onUpdateTaskTimer: (t: Partial<TaskTimerState>) => void;
  tasks: Task[];
  onAddTask: (title: string, priority: TaskPriority) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  media: MediaSettings;
  onUpdateMedia: (m: Partial<MediaSettings>) => void;
  onSelectPreset: (preset: AmbientSource) => void;
}

export const FocusHub: React.FC<FocusHubProps> = ({
  activeTab,
  setActiveTab,
  pomoState,
  pomoSettings,
  onUpdatePomoState,
  onUpdatePomoSettings,
  taskTimer,
  onUpdateTaskTimer,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  media,
  onUpdateMedia,
  onSelectPreset,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [widgetWidth, setWidgetWidth] = useState<number>(440);
  const [sizePreset, setSizePreset] = useState<WidgetSizePreset>('standard');
  const [isResizing, setIsResizing] = useState(false);

  // Picture-in-Picture / Always on Top Window State
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Preset widths mapping
  const PRESET_WIDTHS: Record<WidgetSizePreset, number> = {
    compact: 350,
    standard: 440,
    expanded: 580,
    full: 720,
  };

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'pomodoro', label: 'Pomodoro', icon: TimerIcon },
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'media', label: 'Media', icon: Radio },
  ];

  const handleFocusTaskFromList = (task: Task) => {
    onUpdateTaskTimer({
      taskTitle: task.title,
      duration: 25 * 60,
      timeLeft: 25 * 60,
      isRunning: false,
    });
    setActiveTab('timer');
  };

  const handleApplyPreset = (preset: WidgetSizePreset) => {
    setSizePreset(preset);
    setWidgetWidth(PRESET_WIDTHS[preset]);
  };

  const cycleSizePreset = () => {
    const sequence: WidgetSizePreset[] = ['compact', 'standard', 'expanded', 'full'];
    const currentIdx = sequence.indexOf(sizePreset);
    const nextPreset = sequence[(currentIdx + 1) % sequence.length];
    handleApplyPreset(nextPreset);
  };

  // Helper to copy styles to PiP/Popup window
  const copyStylesToWindow = (targetWin: Window) => {
    // Copy stylesheets
    try {
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          if (styleSheet.cssRules) {
            const rules = [...styleSheet.cssRules].map((r) => r.cssText).join('\n');
            const style = targetWin.document.createElement('style');
            style.textContent = rules;
            targetWin.document.head.appendChild(style);
          }
        } catch {
          if (styleSheet.href) {
            const link = targetWin.document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            targetWin.document.head.appendChild(link);
          }
        }
      });
    } catch {
      // ignore
    }

    // Copy all style & link elements
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      targetWin.document.head.appendChild(node.cloneNode(true));
    });
  };

  // Open Always on Top Floating Window (Document Picture-in-Picture or Popup Fallback)
  const handleTogglePip = async () => {
    if (isPipActive && pipWindowRef.current) {
      pipWindowRef.current.close();
      setIsPipActive(false);
      setPipContainer(null);
      pipWindowRef.current = null;
      return;
    }

    try {
      let win: Window | null = null;

      // 1. Try modern Document Picture-in-Picture API (Chrome, Edge, Brave, Opera)
      const docPip = (window as unknown as { documentPictureInPicture?: { requestWindow: (opts: { width: number; height: number }) => Promise<Window> } }).documentPictureInPicture;

      if (docPip && typeof docPip.requestWindow === 'function') {
        win = await docPip.requestWindow({
          width: Math.max(380, widgetWidth),
          height: isMinimized ? 220 : 640,
        });
      } else {
        // 2. Fallback: Standalone popup window
        win = window.open(
          '',
          'AmbientFocusPopout',
          `width=${Math.max(380, widgetWidth)},height=${isMinimized ? 220 : 640},left=200,top=120,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
        );
      }

      if (!win) {
        alert('Popup permission required to open the floating Always on Top window.');
        return;
      }

      pipWindowRef.current = win;
      win.document.title = '⚡ Ambient Focus Hub (Always on Top)';

      copyStylesToWindow(win);

      win.document.body.className =
        'bg-neutral-950 text-neutral-100 antialiased overflow-y-auto p-3 m-0 select-none custom-scrollbar flex flex-col items-center justify-start min-h-screen';

      const mountPoint = win.document.createElement('div');
      mountPoint.id = 'pip-portal-mount';
      mountPoint.className = 'w-full flex-1 flex flex-col items-center justify-start';
      win.document.body.appendChild(mountPoint);

      setPipContainer(mountPoint);
      setIsPipActive(true);

      win.addEventListener('pagehide', () => {
        setIsPipActive(false);
        setPipContainer(null);
        pipWindowRef.current = null;
      });

      win.addEventListener('beforeunload', () => {
        setIsPipActive(false);
        setPipContainer(null);
        pipWindowRef.current = null;
      });
    } catch (err) {
      console.warn('Could not open PiP window:', err);
    }
  };

  // Close PiP from inside the portal
  const handleClosePip = () => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
    }
    setIsPipActive(false);
    setPipContainer(null);
    pipWindowRef.current = null;
  };

  // Mouse Drag-to-Resize handler
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = widgetWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Clamp width between 320px and 850px
      const newWidth = Math.max(320, Math.min(850, startWidth + deltaX));
      setWidgetWidth(newWidth);

      if (newWidth < 380) setSizePreset('compact');
      else if (newWidth < 500) setSizePreset('standard');
      else if (newWidth < 650) setSizePreset('expanded');
      else setSizePreset('full');
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Mini summary time string for minimized widget
  const getMiniStatus = () => {
    if (activeTab === 'pomodoro') {
      const m = Math.floor(pomoState.timeLeft / 60);
      const s = pomoState.timeLeft % 60;
      return `${pomoState.mode === 'work' ? '🔥 Focus' : '☕ Rest'} ${String(m).padStart(2, '0')}:${String(
        s
      ).padStart(2, '0')}`;
    }
    if (activeTab === 'timer') {
      const m = Math.floor(taskTimer.timeLeft / 60);
      const s = taskTimer.timeLeft % 60;
      return `⏱️ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    if (activeTab === 'tasks') {
      const left = tasks.filter((t) => !t.completed).length;
      return `📋 ${left} Tasks`;
    }
    return `🎵 ${media.currentSource.title || 'Ambient'}`;
  };

  // The complete widget inner card structure
  const renderWidgetCard = (inFloatingPip: boolean = false) => {
    return (
      <div
        style={{
          width: inFloatingPip ? '100%' : isMinimized ? 330 : widgetWidth,
          maxWidth: inFloatingPip ? '100%' : '96vw',
        }}
        className={`pointer-events-auto relative rounded-3xl bg-neutral-900/95 border ${
          inFloatingPip ? 'border-amber-400/40 shadow-2xl w-full' : 'border-white/20'
        } backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col transition-shadow duration-200 ${
          isResizing ? 'select-none ring-2 ring-amber-400/50' : ''
        }`}
      >
        {/* Widget Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/10 rounded-t-3xl ${
            inFloatingPip ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          } select-none`}
        >
          <div className="flex items-center gap-2 text-neutral-300">
            {!inFloatingPip && <GripHorizontal className="w-4 h-4 text-amber-400/80" />}
            <span className="font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {inFloatingPip ? '⚡ Always On Top PiP' : 'Focus Hub'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isMinimized && (
              <span className="text-[11px] font-mono font-medium text-amber-300 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                {getMiniStatus()}
              </span>
            )}

            {/* Quick Size Preset Cycle Button (when not in PiP) */}
            {!isMinimized && !inFloatingPip && (
              <button
                id="btn-widget-cycle-size"
                onClick={cycleSizePreset}
                className="px-2 py-1 text-[10px] font-mono uppercase bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white rounded-lg transition-all flex items-center gap-1"
                title={`Current width: ${widgetWidth}px. Click to cycle sizes (Compact / Standard / Expanded / Full)`}
              >
                <Scaling className="w-3 h-3 text-amber-400" />
                <span>{sizePreset}</span>
              </button>
            )}

            {/* Always on Top Popout / Dock Back Button */}
            <button
              id="btn-widget-toggle-pip"
              onClick={inFloatingPip ? handleClosePip : handleTogglePip}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs font-semibold ${
                inFloatingPip
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md'
                  : 'bg-white/5 hover:bg-white/15 text-amber-300 border-amber-400/30 hover:border-amber-400'
              }`}
              title={
                inFloatingPip
                  ? 'Dock back into dashboard page'
                  : 'Pop Out to Always-on-Top Floating Window (hovers over all tabs & apps)'
              }
            >
              {inFloatingPip ? (
                <>
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Dock Back</span>
                </>
              ) : (
                <>
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Always on Top</span>
                </>
              )}
            </button>

            {/* Minimize / Expand toggle */}
            <button
              id="btn-widget-toggle-minimize"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title={isMinimized ? 'Expand Widget' : 'Minimize Widget'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 space-y-3.5 flex-1 flex flex-col min-h-0">
            {/* 4 Focused Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm border border-white/25'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : ''}`} />
                    <span className="text-[11px]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab View Body */}
            <div className="min-h-[290px] flex-1 flex flex-col justify-center">
              {activeTab === 'pomodoro' && (
                <PomodoroTab
                  state={pomoState}
                  settings={pomoSettings}
                  onUpdateState={onUpdatePomoState}
                  onUpdateSettings={onUpdatePomoSettings}
                />
              )}

              {activeTab === 'timer' && (
                <TaskTimerTab timer={taskTimer} onUpdateTimer={onUpdateTaskTimer} />
              )}

              {activeTab === 'tasks' && (
                <TaskManagerTab
                  tasks={tasks}
                  onAddTask={onAddTask}
                  onToggleTask={onToggleTask}
                  onDeleteTask={onDeleteTask}
                  onClearCompleted={onClearCompleted}
                  onFocusTask={handleFocusTaskFromList}
                />
              )}

              {activeTab === 'media' && (
                <MediaTab
                  media={media}
                  onUpdateMedia={onUpdateMedia}
                  onSelectPreset={onSelectPreset}
                />
              )}
            </div>
          </div>
        )}

        {/* Bottom Resize Handle for Mouse Dragging (when in standard dashboard) */}
        {!isMinimized && !inFloatingPip && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center cursor-se-resize text-neutral-500 hover:text-amber-400 transition-colors z-20 group"
            title="Drag with mouse to customize widget size"
          >
            <svg
              className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="21" y1="9" x2="9" y2="21" />
              <line x1="21" y1="15" x2="15" y2="21" />
              <line x1="21" y1="21" x2="21" y2="21" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  // If PiP is currently active, portal the widget into the floating Always-on-Top window!
  if (isPipActive && pipContainer) {
    return (
      <>
        {/* Placeholder Dock in the main page with a Re-Dock button */}
        <div
          ref={containerRef}
          className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center p-4"
        >
          <div className="pointer-events-auto max-w-md w-full p-6 rounded-3xl bg-neutral-900/90 border border-amber-400/40 backdrop-blur-2xl shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
              <PictureInPicture2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Focus Hub is Floating Always on Top
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Your widget is hovering in a native Picture-in-Picture window over all your browser tabs, documents, and desktop apps.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                id="btn-redock-pip"
                onClick={handleClosePip}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Dock Back Here</span>
              </button>
            </div>
          </div>
        </div>

        {/* Portal complete React state & UI into the Picture-in-Picture window */}
        {createPortal(renderWidgetCard(true), pipContainer)}
      </>
    );
  }

  // Standard in-page Draggable Floating Widget
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center p-4"
    >
      <motion.div
        ref={widgetRef}
        drag
        dragMomentum={false}
        dragConstraints={containerRef}
        dragElastic={0.05}
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
      >
        {renderWidgetCard(false)}
      </motion.div>
    </div>
  );
};

