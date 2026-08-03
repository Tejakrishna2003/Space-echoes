import React from 'react';

export default function CodexModal({ isOpen, onClose, bodyData }) {
  if (!isOpen) return null;

  const { name, category, desc, lore, distance, diameter, temp, moons, gravity, dayLength, composition, continents, oceans, structure, colorHex } = bodyData || {};
  const themeColor = colorHex || '#00e1ab';

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-surface-container-lowest/75 backdrop-blur-xl transition-all duration-500 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="max-w-2xl w-full glass-panel p-xl relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/20 animate-scaleUp max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: `0 0 40px ${themeColor}22` }}
      >
        <button
          onClick={onClose}
          className="absolute top-md right-md text-on-surface-variant hover:text-primary transition-colors p-1"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>

        <div className="mb-md flex items-center space-x-3">
          <span 
            className="px-2.5 py-1 rounded font-label-sm text-[10px] tracking-widest uppercase font-bold border"
            style={{ 
              backgroundColor: `${themeColor}20`,
              borderColor: `${themeColor}60`,
              color: themeColor
            }}
          >
            {category || 'CELESTIAL LOG'}
          </span>
          <span className="font-label-sm text-[10px] text-gray-400 uppercase tracking-wider">
            DIST: {distance || '1.00 AU'}
          </span>
        </div>

        <h2 
          className="font-display-xl text-3xl md:text-5xl text-primary mb-md leading-tight drop-shadow-md"
          style={{ color: themeColor }}
        >
          {name || 'The Planet'}
        </h2>

        <p className="font-headline-lg text-base md:text-xl text-on-surface-variant italic mb-md leading-relaxed border-l-2 pl-3 border-emerald-400/40">
          "{desc}"
        </p>

        <p className="font-body-md text-xs text-on-surface-variant/90 mb-lg leading-relaxed">
          {lore}
        </p>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] font-label-sm text-gray-400 border-y border-white/10 py-3 mb-6">
          <div>DIAMETER: <span className="text-primary-fixed font-bold block sm:inline">{diameter}</span></div>
          <div>SURFACE TEMP: <span className="text-primary-fixed font-bold block sm:inline">{temp}</span></div>
          <div>GRAVITY: <span className="text-primary-fixed font-bold block sm:inline">{gravity || 'N/A'}</span></div>
          <div>DAY LENGTH: <span className="text-primary-fixed font-bold block sm:inline">{dayLength || 'N/A'}</span></div>
          <div>MOONS: <span className="text-primary-fixed font-bold block sm:inline">{moons}</span></div>
          <div>COMPOSITION: <span className="text-primary-fixed font-bold block sm:inline truncate">{composition || 'Rock'}</span></div>
          {continents && <div className="col-span-2 sm:col-span-3 text-emerald-300">CONTINENTS: <span className="text-white font-bold">{continents}</span></div>}
          {oceans && <div className="col-span-2 sm:col-span-3 text-cyan-300">OCEANS: <span className="text-white font-bold">{oceans}</span></div>}
          {structure && <div className="col-span-2 sm:col-span-3 text-amber-300">INTERNAL STRUCTURE: <span className="text-white font-bold">{structure}</span></div>}
        </div>

        <div className="flex justify-between items-center">
          <div className="font-label-sm text-[10px] text-outline tracking-widest uppercase flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TELEMETRY LINK: STABLE</span>
          </div>
          <button
            onClick={onClose}
            className="group relative px-lg py-md overflow-hidden rounded bg-white/5 hover:bg-white/10 border border-white/20 transition-all"
          >
            <span className="relative z-10 font-label-sm text-label-sm text-primary-fixed-dim group-hover:text-primary transition-colors tracking-[0.2em]">
              CLOSE LOG
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
