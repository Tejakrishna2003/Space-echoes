import React from 'react';

export default function StartOverlay({ onEnter }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-700">
      <div className="text-center max-w-lg px-6 animate-scaleUp">
        <div className="inline-flex p-5 rounded-full border border-emerald-400/50 bg-emerald-500/10 text-emerald-400 mb-6 shadow-[0_0_30px_rgba(0,225,171,0.4)] animate-pulse">
          <span className="material-symbols-outlined text-5xl">public</span>
        </div>
        <h2 className="font-display-xl text-4xl md:text-6xl text-white tracking-widest mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
          COSMOS 3D
        </h2>
        <p className="font-label-sm text-xs text-emerald-400 tracking-[0.3em] mb-6 uppercase font-bold">
          Hyper-Realistic 3D Universe Navigator
        </p>
        <p className="font-body-md text-sm text-gray-300 mb-8 leading-relaxed">
          Drag to orbit 3D space • Scroll to zoom • Click any celestial body to warp into orbit. Experience procedural NASA textures, volumetric solar coronal flares, and orbital mechanics!
        </p>
        <button
          onClick={onEnter}
          className="px-10 py-4 bg-emerald-400 text-black font-label-sm font-bold text-xs tracking-[0.3em] rounded hover:bg-emerald-300 transition-all transform hover:scale-105 shadow-[0_0_35px_rgba(0,225,171,0.8)] uppercase"
        >
          LAUNCH INTO UNIVERSE
        </button>
      </div>
    </div>
  );
}
