import React from 'react';
import { SPACE_DATA } from '../data/spaceData';

export default function ScannerPanel({ selectedBodyKey, timeSpeed, setTimeSpeed, onExplore, onNextPlanet }) {
  const body = SPACE_DATA[selectedBodyKey] || SPACE_DATA.earth;

  return (
    <div
      id="hud-right-panel"
      className="fixed right-edge-margin bottom-hud-gutter w-80 glass-panel p-md pointer-events-auto translate-y-[-20px] hud-animate z-30 border border-white/10 shadow-2xl"
      style={{ animationDelay: '1s' }}
    >
      <div className="flex justify-between items-center mb-sm">
        <h3 className="font-label-sm text-label-sm text-primary-fixed tracking-tighter uppercase font-bold flex items-center space-x-2">
          <span>ORBIT CONTROL // {body.name}</span>
        </h3>
        <span className="flex h-3 w-3 relative">
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            style={{ animationDuration: `${Math.max(0.3, 2.0 / (timeSpeed || 1))}s` }}
          ></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>

      {/* Speed Slider */}
      <div className="mb-md space-y-1.5">
        <div className="flex justify-between text-[10px] font-label-sm text-on-surface-variant">
          <span>ORBITAL TIME SPEED</span>
          <span className="text-primary-fixed font-bold tracking-wider">{timeSpeed}x</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={timeSpeed}
          onChange={(e) => setTimeSpeed(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onExplore}
          className="flex-1 py-2 border border-primary-fixed/40 hover:border-primary-fixed transition-colors font-label-sm text-[10px] tracking-widest text-primary-fixed hover:bg-primary-fixed/10 uppercase font-bold"
        >
          EXPLORE LORE
        </button>
        <button
          onClick={onNextPlanet}
          className="py-2 px-4 border border-white/10 hover:border-white/40 text-white font-label-sm text-[10px] tracking-widest transition-all bg-white/5 hover:bg-white/10 font-bold"
        >
          NEXT &rarr;
        </button>
      </div>
    </div>
  );
}
