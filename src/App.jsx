import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SPACE_DATA } from './data/spaceData';
import { spaceAudioEngine } from './services/spaceAudioEngine';

import ThreeCanvas from './components/ThreeCanvas';
import HeaderHUD from './components/HeaderHUD';
import RealmSwitcher from './components/RealmSwitcher';
import RealmInfoPanel from './components/RealmInfoPanel';
import ScannerPanel from './components/ScannerPanel';
import CodexModal from './components/CodexModal';
import StartOverlay from './components/StartOverlay';
import AudioVisualizer from './components/AudioVisualizer';

export default function App() {
  const [selectedBodyKey, setSelectedBodyKey] = useState('earth');
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [fps, setFps] = useState(60);

  const handleSelectBody = useCallback((bodyKey) => {
    if (!SPACE_DATA[bodyKey]) return;
    setSelectedBodyKey(bodyKey);
    spaceAudioEngine.setBody(bodyKey);
    spaceAudioEngine.playChime(783.99, 0.35);
  }, []);

  const selectBodyRef = useRef(handleSelectBody);
  useEffect(() => {
    selectBodyRef.current = handleSelectBody;
  }, [handleSelectBody]);

  const handleNextPlanet = useCallback(() => {
    const keys = Object.keys(SPACE_DATA);
    setSelectedBodyKey(prevKey => {
      const idx = keys.indexOf(prevKey);
      const nextKey = keys[(idx + 1) % keys.length];
      spaceAudioEngine.setBody(nextKey);
      spaceAudioEngine.playChime(783.99, 0.35);
      return nextKey;
    });
  }, []);

  const handleToggleAudio = useCallback(() => {
    const unmuted = spaceAudioEngine.toggleMute();
    setIsAudioMuted(!unmuted);
  }, []);

  const handleToggleZen = useCallback(() => {
    setIsZenMode(prev => {
      const next = !prev;
      document.body.classList.toggle('zen-mode', next);
      return next;
    });
  }, []);

  const handleEnter = useCallback(() => {
    setHasStarted(true);
    handleToggleAudio();
  }, [handleToggleAudio]);

  const handleOpenModal = useCallback(() => {
    const data = SPACE_DATA[selectedBodyKey] || SPACE_DATA.earth;
    setModalData(data);
    setIsModalOpen(true);
    spaceAudioEngine.playChime(1046.5, 0.5);
  }, [selectedBodyKey]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Keyboard Shortcuts: M, Z, Esc, and 1-9 for direct planet jump
  useEffect(() => {
    const bodyKeysOrder = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'galaxy'];

    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'm') handleToggleAudio();
      if (e.key.toLowerCase() === 'z') handleToggleZen();
      if (e.key === 'Escape') handleCloseModal();

      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (bodyKeysOrder[idx]) selectBodyRef.current(bodyKeysOrder[idx]);
      } else if (e.key === '0') {
        selectBodyRef.current('galaxy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleAudio, handleToggleZen, handleCloseModal]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-surface-container-lowest text-on-surface select-none cursor-crosshair">
      {/* Film Grain & Vignette */}
      <div className="film-grain" />
      <div className="vignette" />

      {/* Audio Visualizer Canvas */}
      <AudioVisualizer isMuted={isAudioMuted} />

      {/* 3D WebGL Space Canvas */}
      <ThreeCanvas
        selectedBodyKey={selectedBodyKey}
        onPlanetClick={handleSelectBody}
        timeSpeed={timeSpeed}
        setFps={setFps}
      />

      {/* Top Header HUD Navigation */}
      <HeaderHUD
        selectedBodyKey={selectedBodyKey}
        onSelectBody={handleSelectBody}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onToggleZen={handleToggleZen}
        onOpenCodex={handleOpenModal}
      />

      {/* Right Side Planet Switcher Pips */}
      <RealmSwitcher
        selectedBodyKey={selectedBodyKey}
        onSelectBody={handleSelectBody}
      />

      {/* Left Planetary Info Stats */}
      <RealmInfoPanel
        selectedBodyKey={selectedBodyKey}
        fps={fps}
      />

      {/* Right Orbit Speed Control Panel */}
      <ScannerPanel
        selectedBodyKey={selectedBodyKey}
        timeSpeed={timeSpeed}
        setTimeSpeed={setTimeSpeed}
        onExplore={handleOpenModal}
        onNextPlanet={handleNextPlanet}
      />

      {/* Footer Navigation Bar */}
      <footer
        className="fixed bottom-0 w-full z-40 backdrop-blur-xl bg-surface-container-lowest/10 flex justify-center gap-xl items-center pb-hud-gutter h-24 hud-animate"
        style={{ animationDelay: '0.7s' }}
      >
        <button
          onClick={handleOpenModal}
          className="flex flex-col items-center justify-center text-primary-fixed drop-shadow-[0_0_15px_rgba(0,225,171,0.5)] flicker-animation"
        >
          <span className="material-symbols-outlined text-2xl mb-1">public</span>
          <span className="font-label-sm text-[10px] tracking-widest uppercase font-bold">PLANETARY LOG</span>
        </button>

        <button
          onClick={handleNextPlanet}
          className="flex flex-col items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors duration-300"
        >
          <span className="material-symbols-outlined text-2xl mb-1">rocket_launch</span>
          <span className="font-label-sm text-[10px] tracking-widest uppercase font-bold">WARP TO NEXT</span>
        </button>

        <button
          onClick={() => handleSelectBody('galaxy')}
          className="flex flex-col items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors duration-300"
        >
          <span className="material-symbols-outlined text-2xl mb-1">blur_on</span>
          <span className="font-label-sm text-[10px] tracking-widest uppercase font-bold">SPIRAL GALAXY</span>
        </button>
      </footer>

      {/* Planetary Codex Modal */}
      <CodexModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bodyData={modalData}
      />

      {/* Launch Into Space Splash Overlay */}
      {!hasStarted && <StartOverlay onEnter={handleEnter} />}
    </div>
  );
}
