import React from 'react';

export default function KeyboardHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1 – 9', label: 'Jump Directly to Planet (Sun to Neptune)' },
    { key: '0', label: 'Jump to Milky Way Galaxy' },
    { key: 'C', label: 'Toggle 3D Internal Core Cutaway Mode' },
    { key: 'K', label: 'Toggle 3D Constellation Starlight Overlay' },
    { key: 'M', label: 'Toggle Ambient Audio Synth' },
    { key: 'Z', label: 'Toggle HUD Zen Mode (Hide Interface)' },
    { key: 'Drag', label: 'Orbit 3D Scene (Rotate Camera)' },
    { key: 'Scroll', label: 'Zoom In / Zoom Out' },
    { key: 'ESC', label: 'Close Active Modal / Reset View' }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all duration-300 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full glass-panel p-6 relative shadow-[0_0_50px_rgba(0,225,171,0.2)] border border-emerald-400/30 rounded-2xl animate-scaleUp"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
            <span className="material-symbols-outlined text-xl">keyboard</span>
          </div>
          <div>
            <h3 className="font-display-xl text-xl text-white font-bold tracking-wide">
              KEYBOARD CONTROLS
            </h3>
            <p className="font-label-sm text-[10px] text-emerald-400 uppercase tracking-widest">
              Navigation & Interaction Shortcuts
            </p>
          </div>
        </div>

        <div className="space-y-2.5 my-5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10 text-xs"
            >
              <span className="font-label-sm text-gray-300">{s.label}</span>
              <kbd className="px-2 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/50 rounded font-mono text-[11px] font-bold shadow-[0_0_8px_rgba(0,225,171,0.3)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-400 text-black font-label-sm text-xs tracking-widest font-bold uppercase rounded hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(0,225,171,0.5)]"
        >
          GOT IT
        </button>
      </div>
    </div>
  );
}
