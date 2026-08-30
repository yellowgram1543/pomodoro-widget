import React from 'react';
import { BackgroundThemeId } from '../types';

interface AmbientBackgroundProps {
  theme?: BackgroundThemeId;
  customBackgroundUrl?: string | null;
  customOverlay?: number; // 0 to 100
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  theme = 'defaultDark',
  customBackgroundUrl = null,
  customOverlay = 0,
}) => {
  // If user has an active custom background uploaded
  if (customBackgroundUrl) {
    return (
      <div id="ambient-canvas-root" className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-neutral-950">
        <img
          src={customBackgroundUrl}
          alt="Custom Theme Background"
          className="w-full h-full object-cover select-none"
        />
        {/* User-controlled dark contrast overlay */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
          style={{ opacity: customOverlay / 100 }}
        />
      </div>
    );
  }

  // Render presets
  const renderThemeAtmosphere = () => {
    switch (theme) {
      case 'rainbowFlare':
        return (
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-300 via-pink-300 to-yellow-200">
            <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-cyan-400/60 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-pink-400/70 blur-3xl animate-aura-pulse" />
            <div className="absolute top-1/3 right-1/4 w-[45vw] h-[45vw] rounded-full bg-yellow-300/50 blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-purple-400/50 blur-3xl" />
          </div>
        );

      case 'darkFlare':
        return (
          <div className="absolute inset-0 bg-neutral-950">
            <div className="absolute top-1/4 right-1/4 w-[65vw] h-[65vw] rounded-full bg-rose-600/40 blur-[130px] animate-aura-pulse" />
            <div className="absolute bottom-1/4 left-1/5 w-[60vw] h-[60vw] rounded-full bg-amber-600/35 blur-[140px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] rounded-full bg-purple-700/35 blur-[110px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </div>
        );

      case 'heatMap':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-neutral-950 to-black overflow-hidden">
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background:
                  'radial-gradient(ellipse at 80% 20%, #facc15 0%, #f97316 28%, #ec4899 55%, #3b82f6 80%, transparent 100%), radial-gradient(ellipse at 20% 80%, #06b6d4 0%, #a855f7 40%, #e11d48 70%, transparent 100%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        );

      case 'darkPurpleHeart':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-purple-950/80 to-neutral-950 flex items-center justify-center">
            {/* Glowing Neon Heart Shape Aura */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center animate-heart-pulse">
              <svg viewBox="0 0 100 100" className="w-full h-full text-pink-500 fill-current opacity-90 filter blur-xl">
                <path d="M50,85 C50,85 10,55 10,32 C10,18 20,10 32,10 C41,10 47,16 50,22 C53,16 59,10 68,10 C80,10 90,18 90,32 C90,55 50,85 50,85 Z" />
              </svg>
              <div className="absolute inset-0 bg-fuchsia-500/50 rounded-full blur-3xl -z-10" />
            </div>
            <div className="absolute inset-0 bg-black/30" />
          </div>
        );

      case 'flocusViolet':
        return (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 animate-fluid-flow opacity-95">
            <div className="absolute top-1/4 left-1/3 w-[50vw] h-[50vw] rounded-full bg-violet-400/50 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-[45vw] h-[45vw] rounded-full bg-fuchsia-500/40 blur-3xl" />
          </div>
        );

      case 'pastelLofi':
        return (
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-200 via-indigo-200 to-blue-200 animate-fluid-flow opacity-95">
            <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] rounded-full bg-cyan-300/60 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-purple-300/60 blur-3xl animate-aura-pulse" />
            <div className="absolute top-1/2 right-1/3 w-[40vw] h-[40vw] rounded-full bg-pink-200/50 blur-3xl" />
          </div>
        );

      case 'sakura':
        return (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-200 via-pink-300 to-rose-300 animate-fluid-flow opacity-95">
            <div className="absolute top-1/5 right-1/5 w-[55vw] h-[55vw] rounded-full bg-pink-400/55 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/5 left-1/5 w-[50vw] h-[50vw] rounded-full bg-rose-400/50 blur-3xl" />
            <div className="absolute top-1/2 left-1/3 w-[40vw] h-[40vw] rounded-full bg-orange-200/50 blur-3xl" />
          </div>
        );

      case 'lightPurpleHeart':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-200 via-fuchsia-200 to-indigo-100 flex items-center justify-center">
            {/* Soft Radiant Heart Shape */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center animate-heart-pulse">
              <svg viewBox="0 0 100 100" className="w-full h-full text-fuchsia-400 fill-current opacity-80 filter blur-xl">
                <path d="M50,85 C50,85 10,55 10,32 C10,18 20,10 32,10 C41,10 47,16 50,22 C53,16 59,10 68,10 C80,10 90,18 90,32 C90,55 50,85 50,85 Z" />
              </svg>
              <div className="absolute inset-0 bg-purple-400/60 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        );

      case 'grainyGradient':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-rose-600 to-amber-400 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-500/70 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-500/70 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] bg-yellow-400/50 rounded-full blur-3xl" />
            {/* Subtle retro grain overlay */}
            <div className="absolute inset-0 opacity-20 bg-repeat bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:6px_6px]" />
          </div>
        );

      case 'cyberpunk':
        return (
          <div className="absolute inset-0 bg-neutral-950">
            <div className="absolute top-1/4 left-1/4 w-[55vw] h-[55vw] rounded-full bg-cyan-500/40 blur-[130px] animate-aura-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[55vw] h-[55vw] rounded-full bg-fuchsia-600/40 blur-[130px] animate-aura-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] rounded-full bg-purple-600/30 blur-[100px]" />
          </div>
        );

      case 'zenEmerald':
        return (
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-teal-950 to-neutral-950">
            <div className="absolute top-1/3 left-1/4 w-[55vw] h-[55vw] rounded-full bg-emerald-600/30 blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[50vw] h-[50vw] rounded-full bg-teal-500/25 blur-[120px]" />
          </div>
        );

      case 'sunsetGlow':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-amber-950/50 to-neutral-950">
            <div className="absolute top-1/4 right-1/3 w-[60vw] h-[60vw] rounded-full bg-amber-500/35 blur-[130px]" />
            <div className="absolute bottom-1/4 left-1/3 w-[55vw] h-[55vw] rounded-full bg-rose-600/30 blur-[130px]" />
          </div>
        );

      case 'defaultDark':
      default:
        return (
          <div className="absolute inset-0 bg-neutral-950">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-slate-950 to-neutral-900 opacity-95" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        );
    }
  };

  return (
    <div id="ambient-canvas-root" className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-neutral-950">
      {renderThemeAtmosphere()}

      {/* Subtle Micro-Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-repeat bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* User Contrast Overlay when applied on themes */}
      {customOverlay > 0 && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
          style={{ opacity: customOverlay / 100 }}
        />
      )}
    </div>
  );
};
