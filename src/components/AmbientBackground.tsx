import React from 'react';
import { BackgroundThemeId, BackgroundMode } from '../types';

interface AmbientBackgroundProps {
  mode?: BackgroundMode;
  theme?: BackgroundThemeId;
  customBackgroundUrl?: string | null;
  customOverlay?: number; // 0 to 100
  videoBackgroundId?: string | null;
  videoMuted?: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  mode = 'theme',
  theme = 'mangaKissaten',
  customBackgroundUrl = null,
  customOverlay = 0,
  videoBackgroundId = null,
  videoMuted = true,
}) => {
  // 1. If Video Background is active
  if (mode === 'video' && videoBackgroundId) {
    const embedUrl = `https://www.youtube.com/embed/${videoBackgroundId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoBackgroundId}&playsinline=1&rel=0&enablejsapi=1`;

    return (
      <div id="ambient-canvas-root" className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#F6F3EB]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <iframe
            src={embedUrl}
            title="Video Background"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[100vw] h-[56.25vw] min-w-[177.78vh] min-h-screen object-cover border-0 select-none"
          />
        </div>

        {/* User-controlled contrast overlay */}
        {customOverlay > 0 && (
          <div
            className="absolute inset-0 bg-[#211F1C] transition-opacity duration-300 pointer-events-none"
            style={{ opacity: customOverlay / 100 }}
          />
        )}
      </div>
    );
  }

  // 2. If Custom Background Image is active
  if (mode === 'custom' && customBackgroundUrl) {
    return (
      <div id="ambient-canvas-root" className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#F6F3EB]">
        <img
          src={customBackgroundUrl}
          alt="Custom Theme Background"
          className="w-full h-full object-cover select-none"
        />
        {/* User-controlled contrast overlay */}
        <div
          className="absolute inset-0 bg-[#211F1C] transition-opacity duration-300 pointer-events-none"
          style={{ opacity: customOverlay / 100 }}
        />
      </div>
    );
  }

  // Render presets
  const renderThemeAtmosphere = () => {
    switch (theme) {
      case 'tankobonPages':
        return (
          <div className="absolute inset-0 bg-[#F5EFEB]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#F2EDE2] to-[#E6DEC0] opacity-90" />
            <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-[#EADDC9]/60 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-[#DFD0B8]/50 blur-3xl" />
          </div>
        );

      case 'cedarStudy':
        return (
          <div className="absolute inset-0 bg-[#EFEAE0]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E6DCCB] via-[#EFE8DC] to-[#DCCBB4] opacity-95" />
            <div className="absolute top-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-[#D4BC9B]/50 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[45vw] h-[45vw] rounded-full bg-[#C8AE8A]/40 blur-3xl" />
          </div>
        );

      case 'washiSumi':
        return (
          <div className="absolute inset-0 bg-[#F5F2EA]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FCFAF5] via-[#EBE5D8] to-[#D9D1C2] opacity-90" />
            <div className="absolute top-1/3 left-1/4 w-[45vw] h-[45vw] rounded-full bg-[#D3CBC0]/40 blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[50vw] h-[50vw] rounded-full bg-[#C8BFAF]/35 blur-3xl animate-aura-pulse" />
          </div>
        );

      case 'matchaReading':
        return (
          <div className="absolute inset-0 bg-[#F3F5ED]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E3EAD8] via-[#F1F4EB] to-[#D0DEC0] opacity-95" />
            <div className="absolute top-1/4 left-1/3 w-[55vw] h-[55vw] rounded-full bg-[#C2D6B0]/45 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/4 right-1/3 w-[45vw] h-[45vw] rounded-full bg-[#D8E4CB]/50 blur-3xl" />
          </div>
        );

      case 'shinjukuRain':
        return (
          <div className="absolute inset-0 bg-[#EEF2F6]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E4ECF4] via-[#EEF3F8] to-[#D2DEEA] opacity-95" />
            <div className="absolute top-1/5 right-1/4 w-[50vw] h-[50vw] rounded-full bg-[#C5D5E6]/50 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/5 left-1/4 w-[45vw] h-[45vw] rounded-full bg-[#DFE7F0]/60 blur-3xl" />
          </div>
        );

      case 'archivalLibrary':
        return (
          <div className="absolute inset-0 bg-[#F7F3E9]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E8DEC8] via-[#F6F1E3] to-[#DECFA8] opacity-95" />
            <div className="absolute top-1/3 right-1/3 w-[50vw] h-[50vw] rounded-full bg-[#DCC89F]/45 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[45vw] h-[45vw] rounded-full bg-[#EADBB8]/50 blur-3xl" />
          </div>
        );

      case 'hankoVermilion':
        return (
          <div className="absolute inset-0 bg-[#F6F2EA]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F6F1E6] via-[#EFE7D8] to-[#E5D7C2] opacity-95" />
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#E8CCA6]/40 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#DDBB8D]/35 blur-3xl" />
          </div>
        );

      case 'crimsonRipples':
        return <div className="absolute inset-0 pattern-crimson-ripples" />;

      case 'draftingGrid':
        return <div className="absolute inset-0 pattern-drafting-grid" />;

      case 'pastelDiamond':
        return <div className="absolute inset-0 pattern-pastel-diamond" />;

      case 'wheatWeave':
        return <div className="absolute inset-0 pattern-wheat-weave" />;

      case 'dynamicTiles':
        return <div className="absolute inset-0 pattern-dynamic-tiles" />;

      case 'badSnakeSunset':
        return <div className="absolute inset-0 pattern-bad-snake-sunset" />;

      case 'modernSkunkPine':
        return <div className="absolute inset-0 pattern-modern-skunk-pine" />;

      case 'fluffyBearClouds':
        return <div className="absolute inset-0 pattern-fluffy-bear-clouds" />;

      case 'niceGrasshopperGrid':
        return <div className="absolute inset-0 pattern-nice-grasshopper-grid" />;

      case 'thinBulldogContour':
        return <div className="absolute inset-0 pattern-thin-bulldog-contour" />;

      case 'greatFishScales':
        return <div className="absolute inset-0 pattern-great-fish-scales" />;

      case 'mangaKissaten':
      default:
        return (
          <div className="absolute inset-0 bg-[#F6F3EB]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F0] via-[#F2EDE1] to-[#E3D8C3] opacity-95" />
            <div className="absolute top-1/4 left-1/3 w-[55vw] h-[55vw] rounded-full bg-[#E2D2B8]/45 blur-3xl animate-aura-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-[#D6C4A6]/40 blur-3xl" />
          </div>
        );
    }
  };

  return (
    <div id="ambient-canvas-root" className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#F6F3EB]">
      {renderThemeAtmosphere()}

      {/* Subtle Archival Washi Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.035] bg-repeat bg-[radial-gradient(#211F1C_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* User Contrast Overlay */}
      {customOverlay > 0 && (
        <div
          className="absolute inset-0 bg-[#211F1C] transition-opacity duration-300 pointer-events-none"
          style={{ opacity: customOverlay / 100 }}
        />
      )}
    </div>
  );
};

