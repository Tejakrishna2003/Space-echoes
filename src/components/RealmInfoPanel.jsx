import React, { useState, useEffect } from 'react';
import { SPACE_DATA } from '../data/spaceData';

export default function RealmInfoPanel({ selectedBodyKey, fps, isCutawayOpen }) {
  const body = SPACE_DATA[selectedBodyKey] || SPACE_DATA.earth;
  const [keyTrigger, setKeyTrigger] = useState(0);

  useEffect(() => {
    setKeyTrigger(prev => prev + 1);
  }, [selectedBodyKey]);

  return (
    <div
      id="hud-left-panel"
      className="fixed bottom-hud-gutter left-edge-margin pointer-events-auto flex flex-col space-y-xs hud-animate z-30 max-w-sm glass-panel p-4 rounded-xl shadow-2xl border border-white/10 bg-black/60 backdrop-blur-md"
      style={{ animationDelay: '0.8s' }}
    >
      <div className="flex items-center space-x-md text-primary-fixed/80">
        <div className="h-[2px] w-12 bg-primary-fixed-dim shadow-[0_0_8px_rgba(0,225,171,0.8)]" style={{ backgroundColor: body.colorHex }} />
        <span className="font-label-sm text-label-sm tracking-widest uppercase font-bold">{body.category}</span>
        <span className="ml-auto font-label-sm text-[9px] text-emerald-400/70 border border-emerald-500/30 px-1.5 py-0.5 rounded">
          {fps || 60} FPS
        </span>
      </div>

      <h1 
        key={keyTrigger}
        className="font-headline-lg text-3xl md:text-4xl text-primary font-light tracking-wide drop-shadow-md animate-fadeIn"
      >
        {body.name}
      </h1>

      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
        {body.desc}
      </p>

      {/* Universal 3D Cutaway Active Layer Breakdown */}
      {['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(selectedBodyKey) && isCutawayOpen && (
        <div className="mt-3 p-3 rounded bg-black/80 border border-amber-400/50 backdrop-blur-md animate-fadeIn">
          <div className="text-amber-400 font-bold text-xs uppercase tracking-widest flex items-center space-x-2 mb-1.5">
            <span className="material-symbols-outlined text-sm animate-spin-slow">layers</span>
            <span>3D GEOLOGICAL CUTAWAY ACTIVE</span>
          </div>
          <div className="text-[10px] font-label-sm text-emerald-300 leading-relaxed font-semibold">
            {body.structure || 'Internal Core Spheres Exposed'}
          </div>
        </div>
      )}

      <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] font-label-sm text-on-surface-variant uppercase border-t border-white/10 mt-2">
        <div>DISTANCE: <span className="text-primary-fixed font-bold">{body.distance}</span></div>
        <div>DIAMETER: <span className="text-primary-fixed font-bold">{body.diameter}</span></div>
        <div>TEMP: <span className="text-primary-fixed font-bold">{body.temp}</span></div>
        <div>MOONS: <span className="text-primary-fixed font-bold">{body.moons}</span></div>
      </div>
    </div>
  );
}
