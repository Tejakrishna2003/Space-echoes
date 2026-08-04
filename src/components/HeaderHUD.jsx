import React, { useState } from 'react';
import { SPACE_DATA } from '../data/spaceData';

export default function HeaderHUD({
  selectedBodyKey,
  onSelectBody,
  isAudioMuted,
  onToggleAudio,
  onToggleZen,
  onOpenCodex,
  isCutawayOpen,
  onToggleCutaway
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
        <nav className="hidden xl:flex items-center space-x-3 overflow-x-auto max-w-4xl py-1">
          {Object.values(SPACE_DATA).map(body => {
            const isActive = selectedBodyKey === body.key;
            return (
              <button
                key={body.key}
                onClick={() => onSelectBody(body.key)}
                className={`font-label-sm text-[10px] tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap px-1.5 py-0.5 rounded ${
                  isActive
                    ? 'text-primary-fixed-dim bg-white/10 drop-shadow-[0_0_8px_rgba(0,225,171,0.6)] font-bold border border-emerald-400/40'
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
          {['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(selectedBodyKey) && (
            <button
              onClick={onToggleCutaway}
              className={`px-2 py-1 rounded font-label-sm text-[10px] tracking-wider uppercase transition-all flex items-center space-x-1 border ${
                isCutawayOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)] font-bold'
                  : 'bg-white/5 text-primary border-white/20 hover:bg-white/10'
              }`}
              title="Toggle 3D Internal Core Cutaway (C)"
            >
              <span className="material-symbols-outlined text-sm">layers</span>
              <span>{isCutawayOpen ? 'SURFACE [C]' : 'CUTAWAY [C]'}</span>
            </button>
          )}

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
            className="hidden sm:flex items-center space-x-2 px-md py-xs rounded bg-primary/10 border border-primary/40 hover:bg-primary/20 text-primary transition-all font-label-sm text-xs tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            <span>CODEX</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-1 text-primary focus:outline-none"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-surface-container-lowest/90 backdrop-blur-xl xl:hidden pt-20 px-edge-margin pb-xl overflow-y-auto animate-fadeIn">
          <div className="grid grid-cols-2 gap-md">
            {Object.values(SPACE_DATA).map(body => {
              const isActive = selectedBodyKey === body.key;
              return (
                <button
                  key={body.key}
                  onClick={() => {
                    onSelectBody(body.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-md rounded border text-left font-label-sm text-xs tracking-widest uppercase transition-all ${
                    isActive
                      ? 'border-primary bg-primary/20 text-primary font-bold shadow-[0_0_15px_rgba(0,225,171,0.3)]'
                      : 'border-white/10 bg-white/5 text-on-surface-variant hover:border-white/30'
                  }`}
                >
                  <div className="text-[10px] text-gray-400">{body.category}</div>
                  <div className="text-sm font-bold text-primary mt-1">{body.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
