import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div id="ambient-canvas-root" className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-neutral-950">
      {/* Subtle Ambient Studio Atmosphere Mesh */}
      <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-slate-950 to-neutral-900 opacity-95" />

      {/* Subtle Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Delicate Micro-Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-repeat bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>
  );
};
