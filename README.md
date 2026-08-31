# Ambient Focus & Pomodoro Dashboard

An aesthetic, distraction-free ambient workspace and productivity suite built with **React**, **TypeScript**, and **Tailwind CSS**. Designed for deep work, studying, and creative flow, it brings together customizable Pomodoro workflows, an ambient audio synthesizer, curated video backdrops, draggable floating widgets, and a modular task management hub.

---

## ✨ Features

### ⏱️ Pomodoro & Deep Work Engine
- **Customizable Intervals**: Configurable focus, short break, and long break intervals with automatic cycle progression.
- **Multiple Timer Visual Styles**: Minimalist digits, circular radial progress rings, retro flip clocks, and Japanese woodblock typographic dials.
- **Dedicated Task Stopwatch & Timers**: Track specific task durations independently from Pomodoro intervals.
- **Synthesized Audio Notifications**: Clean audio chime tones built with the native **Web Audio API** (no external audio assets required).

### 🎨 Dynamic Ambient & Visual Backgrounds
- **Curated Video & Lofi Scenes**: High-definition ambient video backgrounds (Rainy Tokyo Cafe, Cozy Library, Campfire Night, Autumn Forest).
- **Procedural CSS Geometric Patterns**: Includes curated patterns with customizable brightness, blur, and opacity overlays:
  - *Pastel Sunset Horizon*, *Geometric Pine Forest*, *Fluffy Cloud Weave*, *Sage Matrix Grid*, *Topographic Contours*, and *Monochrome Scales*.
- **Live Background Controls**: Adjust backdrop blur, darkness overlay, saturation, and contrast in real time.

### 🎵 Ambient Soundscape & Media Hub
- **Multi-Layer Ambient Sound Mixer**: Mix rainfall, crackling fireplace, binaural alpha waves, coffee shop chatter, and forest winds with individual volume sliders.
- **Integrated YouTube & Spotify Players**: Embed lofi radio streams and custom study playlists directly within the workspace.

### 📝 Integrated Task & Goal Management
- **Task Management**: Create, edit, prioritize, and reorder tasks with custom color tags.
- **Local Persistence**: All settings, tasks, and timer preferences persist automatically across sessions via `localStorage`.
- **Keyboard Shortcuts & Fullscreen**: Support for `Space` (play/pause), `F` (toggle fullscreen), and quick hotkeys.

### 🪟 Draggable & Resizable Focus Hub
- **Floating UI Container**: Fluid drag-and-drop position and mouse-resizable container corners.
- **Focus Mode & Minimalist Toggle**: Collapse the widget to an ultra-clean floating clock or hide all interface elements for zero-distraction focus.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS Custom Properties
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API (Tone generation & audio synthesis)
- **Build Tool**: Vite
- **Deployment Target**: Vercel / Cloud Run / Netlify

---

## 📁 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── MediaTab.tsx           # Ambient sounds & media player
│   │   │   ├── PomodoroTab.tsx        # Pomodoro timer view & presets
│   │   │   ├── TaskManagerTab.tsx     # Todo list & task prioritization
│   │   │   └── TaskTimerTab.tsx       # Dedicated task stopwatches
│   │   ├── AmbientBackground.tsx      # Video and CSS backdrop engine
│   │   ├── FocusHub.tsx               # Draggable/resizable floating widget
│   │   ├── MusicModal.tsx             # Quick music selector modal
│   │   ├── SettingsPanel.tsx          # Appearance, sound & timing controls
│   │   └── TopBar.tsx                 # Header controls & quick toggles
│   ├── utils/
│   │   ├── audio.ts                   # Web Audio API chime synthesis
│   │   ├── pomoTimerStyles.ts         # Visual timer presets & styles
│   │   ├── themePresets.ts            # Background pattern configurations
│   │   └── timerThemes.ts             # Color and theme configurations
│   ├── App.tsx                        # Core application state & layout
│   ├── types.ts                       # Shared TypeScript definitions
│   └── index.css                      # Global styles & procedural CSS patterns
├── index.html                         # Entry HTML file
├── vite.config.ts                     # Vite configuration
└── package.json                       # Dependencies & build scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18.0.0 or higher)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ambient-focus-dashboard.git
   cd ambient-focus-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## ☁️ Deployment on Vercel

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com) and click **"Add New" → "Project"**.
3. Import your GitHub repository.
4. Keep the default settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
