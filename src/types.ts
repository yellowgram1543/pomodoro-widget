export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
export type AlarmSound = 'bell' | 'marimba' | 'bowl' | 'digital';
export type BuiltInAmbientSound =
  | 'none'
  // Rain & Water
  | 'light_rain'
  | 'heavy_rain'
  | 'rain_on_tent'
  | 'thunderstorm'
  | 'waves'
  | 'waterfall'
  | 'river'
  | 'underwater'
  | 'whales'
  // Nature
  | 'birds'
  | 'summer_night'
  | 'wind'
  // Places & Travel
  | 'street_cafe'
  | 'japanese_library'
  | 'commuter_train'
  // Cozy & Home
  | 'fireplace'
  | 'wind_chimes'
  | 'keyboard'
  | 'record_player'
  | 'clock'
  | 'cat_purr'
  | 'room_fan'
  // Pure Noises
  | 'whitenoise'
  | 'pinknoise'
  | 'brownnoise'
  // Binaural Beats
  | 'binaural_gamma'
  | 'binaural_beta'
  | 'binaural_alpha'
  | 'binaural_theta'
  | 'binaural_delta'
  // Legacy aliases
  | 'campfire'
  | 'rain'
  | 'forest'
  | 'binaural'
  | 'deep_sea'
  | 'air_conditioner'
  | 'central_park'
  | 'countryside'
  | 'office'
  | 'airport'
  | 'home_kitchen'
  | 'bowling_alley'
  | 'outer_space'
  | 'nyc_morning';

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
  category: string;
  videoId: string | null;
  listId: string | null;
  description: string;
  thumbnail: string;
  tag: string;
}

export type MediaServiceType = 'youtube' | 'spotify' | 'custom';
export type SpotifyMediaType = 'track' | 'playlist' | 'album' | 'artist' | 'episode' | 'show';

export interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  videoId?: string | null;
  listId?: string | null;
  spotifyId?: string | null;
  spotifyType?: SpotifyMediaType | null;
  service?: MediaServiceType;
  addedAt: number;
}

export interface MediaSettings {
  currentSource: {
    videoId: string | null;
    listId: string | null;
    spotifyId?: string | null;
    spotifyType?: SpotifyMediaType | null;
    service?: MediaServiceType;
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
  activeAmbientSounds?: Record<string, number>; // Map of soundId -> volume (0 to 100) for multi-sound mixing
}

export type TabType = 'pomodoro' | 'timer' | 'tasks' | 'media';

export type SettingsCategory = 'pomodoro' | 'timer' | 'sound' | 'appearance' | 'shortcuts';

export type ClockTimerStyle = 'default' | 'minimal' | 'serif' | 'handwritten' | 'minimalLight' | 'serifCondensed';

export type PomodoroTimerStyle = 'default' | 'flipClock' | 'progressBar' | 'gauge' | 'dotMatrix' | 'pie';

export type BackgroundThemeId =
  | 'mangaKissaten'
  | 'tankobonPages'
  | 'cedarStudy'
  | 'washiSumi'
  | 'matchaReading'
  | 'shinjukuRain'
  | 'archivalLibrary'
  | 'hankoVermilion'
  | 'crimsonRipples'
  | 'draftingGrid'
  | 'pastelDiamond'
  | 'wheatWeave'
  | 'dynamicTiles'
  | 'badSnakeSunset'
  | 'modernSkunkPine'
  | 'fluffyBearClouds'
  | 'niceGrasshopperGrid'
  | 'thinBulldogContour'
  | 'greatFishScales'
  | 'defaultDark'
  | 'rainbowFlare'
  | 'darkFlare'
  | 'heatMap'
  | 'darkPurpleHeart'
  | 'flocusViolet'
  | 'pastelLofi'
  | 'sakura'
  | 'lightPurpleHeart'
  | 'grainyGradient'
  | 'cyberpunk'
  | 'zenEmerald'
  | 'sunsetGlow';

export interface ThemeOption {
  id: BackgroundThemeId;
  name: string;
  previewClass: string;
  description?: string;
}

export type BackgroundMode = 'theme' | 'video' | 'custom';

export interface AppearanceSettings {
  backgroundMode: BackgroundMode;
  activeTheme: BackgroundThemeId;
  customBackgroundUrl: string | null;
  customBackgroundOverlay: number; // 0 to 100
  videoBackgroundId: string | null; // e.g. YouTube video ID
  videoBackgroundTitle?: string | null;
  videoMuted: boolean;
}

export type WidgetSizePreset = 'compact' | 'standard' | 'expanded' | 'full';

export interface WidgetDimensions {
  width: number;
  height: number;
}
