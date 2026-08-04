import React, { useState, useEffect } from 'react';
import { SPACE_DATA } from '../data/spaceData';

export default function ScannerPanel({ selectedBodyKey, timeSpeed, setTimeSpeed, onExplore, onNextPlanet, renderStats, audioPitch, setAudioPitch }) {
  const body = SPACE_DATA[selectedBodyKey] || SPACE_DATA.earth;
  const [elapsedYears, setElapsedYears] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedYears(prev => parseFloat((prev + 0.02 * (timeSpeed || 1)).toFixed(2)));
    }, 200);
    return () => clearInterval(timer);
  }, [timeSpeed]);

  const simYear = 2026 + Math.floor(elapsedYears);

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

      {/* Simulated Epoch Time Counter */}
      <div className="mb-3 p-2 rounded bg-black/60 border border-emerald-500/30 flex justify-between items-center text-[10px] font-label-sm">
        <div className="text-gray-400 flex items-center space-x-1.5">
          <span className="material-symbols-outlined text-xs text-emerald-400">schedule</span>
          <span>SIMULATED EPOCH</span>
        </div>
        <div className="text-emerald-300 font-mono font-bold">
          YEAR {simYear} (+{elapsedYears.toFixed(1)}y)
        </div>
      </div>

      {/* Speed Slider */}
      <div className="mb-3 space-y-1.5">
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

      {/* Audio Pitch Modulator Slider */}
      {setAudioPitch && (
        <div className="mb-md space-y-1.5">
          <div className="flex justify-between text-[10px] font-label-sm text-on-surface-variant">
            <span>COSMIC SYNTH PITCH</span>
            <span className="text-amber-400 font-bold tracking-wider">{audioPitch || 1.0}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={audioPitch || 1.0}
            onChange={(e) => setAudioPitch(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      )}

      {/* WebGL Telemetry Stats */}
      {renderStats && (
        <div className="mb-3 grid grid-cols-2 gap-1.5 text-[9px] font-mono text-gray-400 bg-white/5 p-2 rounded border border-white/10">
          <div>CALLS: <span className="text-emerald-300 font-bold">{renderStats.drawCalls || 0}</span></div>
          <div>POLYS: <span className="text-emerald-300 font-bold">{((renderStats.triangles || 0) / 1000).toFixed(1)}k</span></div>
        </div>
      )}

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
