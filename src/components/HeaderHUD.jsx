import React, { useState } from 'react';
import { SPACE_DATA } from '../data/spaceData';

export default function HeaderHUD({
  selectedBodyKey,
  onSelectBody,
  isAudioMuted,
  onToggleAudio,
  onToggleZen,
  onOpenCodex
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/5 border-b border-white/10 flex justify-between items-center px-edge-margin py-md hud-animate">
        <div
          onClick={() => onSelectBody('sun')}
          className="font-headline-lg text-xl md:text-3xl tracking-[0.2em] text-primary drop-shadow-[0_0_10px_rgba(251,255,250,0.8)] cursor-pointer flex items-center space-x-2"
        >
          <span className="material-symbols-outlined text-amber-400 animate-spin-slow text-2xl md:text-3xl">public</span>
          <span>COSMOS 3D</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center space-x-md overflow-x-auto max-w-4xl py-1">
          {Object.values(SPACE_DATA).map(body => {
            const isActive = selectedBodyKey === body.key;
            return (
              <button
                key={body.key}
                onClick={() => onSelectBody(body.key)}
                className={`font-label-sm text-[11px] tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-primary-fixed-dim drop-shadow-[0_0_8px_rgba(0,225,171,0.6)] font-bold underline underline-offset-4 decoration-primary-fixed-dim'
                    : 'text-on-surface-variant/70 hover:text-primary-fixed hover:scale-105'
                }`}
              >
                {body.name}
              </button>
            );
          })}
        </nav>

        {/* Controls & Mobile Menu Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-md text-primary">
          <button
            onClick={onToggleAudio}
            className="flicker-animation p-1"
            title="Toggle Ambient Audio (M)"
          >
            <span className="material-symbols-outlined text-2xl">
              {isAudioMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          <button
            onClick={onToggleZen}
            className="flicker-animation p-1"
            title="Toggle Zen Mode (Z)"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>

          <button
            onClick={onOpenCodex}
            className="px-3 py-1.5 rounded border border-emerald-400/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-label-sm text-[10px] tracking-wider transition-all flex items-center space-x-1.5"
          >
            <span className="material-symbols-outlined text-sm">travel_explore</span>
            <span className="hidden sm:inline">CODEX</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-1 text-white"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed top-16 inset-x-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 z-40 p-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {Object.values(SPACE_DATA).map(body => (
              <button
                key={body.key}
                onClick={() => {
                  onSelectBody(body.key);
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-left font-label-sm text-xs tracking-wider rounded border ${
                  selectedBodyKey === body.key
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/20'
                    : 'border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                {body.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
