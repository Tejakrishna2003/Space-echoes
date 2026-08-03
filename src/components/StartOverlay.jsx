import React, { useState, useEffect } from 'react';

export default function StartOverlay({ onEnter }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

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
        <p className="font-body-md text-sm text-gray-300 mb-6 leading-relaxed">
          Drag to orbit 3D space • Scroll to zoom • Click any celestial body to warp into orbit. Experience procedural NASA textures, volumetric solar flares, 3D Earth internal core cutaways, and orbital mechanics!
        </p>

        {/* Procedural Texture Engine Loading Bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-8 overflow-hidden border border-white/10">
          <div 
            className="bg-emerald-400 h-full transition-all duration-300 shadow-[0_0_10px_#00e1ab]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onEnter}
          disabled={progress < 100}
          className={`px-10 py-4 font-label-sm font-bold text-xs tracking-[0.3em] rounded transition-all transform uppercase shadow-[0_0_35px_rgba(0,225,171,0.8)] ${
            progress >= 100 
              ? 'bg-emerald-400 text-black hover:bg-emerald-300 hover:scale-105 cursor-pointer' 
              : 'bg-emerald-500/40 text-black/60 cursor-not-allowed'
          }`}
        >
          {progress >= 100 ? 'LAUNCH INTO UNIVERSE' : `INITIALIZING 4K TEXTURES ${progress}%`}
        </button>
      </div>
    </div>
  );
}
