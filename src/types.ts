export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
export type AlarmSound = 'bell' | 'marimba' | 'bowl' | 'digital';
export type BuiltInAmbientSound = 'none' | 'rain' | 'forest' | 'waves' | 'binaural' | 'whitenoise' | 'fireplace';

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: AlarmSound;
  soundVolume: number; // 0 to 1
}

export interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  currentCycle: number; // 1 to cyclesBeforeLongBreak
  totalCompletedSessions: number;
}

export interface TaskTimerState {
  duration: number; // total allocated seconds
  timeLeft: number; // remaining seconds
  isRunning: boolean;
  taskTitle: string;
  isCompleted: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  priority: TaskPriority;
  estimatedPomos?: number;
  completedPomos?: number;
}

export interface AmbientSource {
  id: string;
  title: string;
  category: 'Lofi' | 'Rain & Nature' | 'Space & Sci-Fi' | 'Cozy' | 'Atmospheric';
  videoId: string | null;
  listId: string | null;
  description: string;
  thumbnail: string;
  tag: string;
}

export interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  videoId: string | null;
  listId: string | null;
  addedAt: number;
}

export interface MediaSettings {
  currentSource: {
    videoId: string | null;
    listId: string | null;
    title: string;
  };
  playlist: PlaylistItem[];
  currentIndex: number;
  volume: number; // 0 to 100
  isMuted: boolean;
  isPlaying: boolean;
  playbackRate: number;
  ambientSound: BuiltInAmbientSound;
  ambientSoundVolume: number; // 0 to 100
}

export type TabType = 'pomodoro' | 'timer' | 'tasks' | 'media';

export type WidgetSizePreset = 'compact' | 'standard' | 'expanded' | 'full';

export interface WidgetDimensions {
  width: number;
  height: number;
}
