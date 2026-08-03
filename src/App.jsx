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
  const [isCutawayOpen, setIsCutawayOpen] = useState(false);

  const handleSelectBody = useCallback((bodyKey) => {
    if (!SPACE_DATA[bodyKey]) return;
    setSelectedBodyKey(bodyKey);
    if (bodyKey !== 'earth') {
      setIsCutawayOpen(false);
    }
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
      if (nextKey !== 'earth') setIsCutawayOpen(false);
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

  const handleToggleCutaway = useCallback(() => {
    setIsCutawayOpen(prev => !prev);
    spaceAudioEngine.playChime(1200, 0.4);
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

  // Keyboard Shortcuts: M, Z, C (Cutaway), Esc, 1-9 & 0 for direct jump
  useEffect(() => {
    const bodyKeysOrder = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'galaxy', 'kuiperbelt', 'nebula', 'andromeda', 'blackhole'];

    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'm') handleToggleAudio();
      if (e.key.toLowerCase() === 'z') handleToggleZen();
      if (e.key.toLowerCase() === 'c') handleToggleCutaway();
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
  }, [handleToggleAudio, handleToggleZen, handleToggleCutaway, handleCloseModal]);

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
        isCutawayOpen={isCutawayOpen}
      />

      {/* Top Header HUD Navigation */}
      <HeaderHUD
        selectedBodyKey={selectedBodyKey}
        onSelectBody={handleSelectBody}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onToggleZen={handleToggleZen}
        onOpenCodex={handleOpenModal}
        isCutawayOpen={isCutawayOpen}
        onToggleCutaway={handleToggleCutaway}
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
        isCutawayOpen={isCutawayOpen}
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
          className="group flex flex-col items-center space-y-1 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-primary text-xl">globe</span>
          </div>
          <span className="font-label-sm text-[10px] tracking-widest text-on-surface-variant group-hover:text-primary uppercase">
            PLANETARY LOG
          </span>
        </button>

        <button
          onClick={handleNextPlanet}
          className="group flex flex-col items-center space-y-1 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
          </div>
          <span className="font-label-sm text-[10px] tracking-widest text-on-surface-variant group-hover:text-primary uppercase">
            WARP TO NEXT
          </span>
        </button>

        {selectedBodyKey === 'earth' && (
          <button
            onClick={handleToggleCutaway}
            className="group flex flex-col items-center space-y-1 focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isCutawayOpen ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'border-primary/30 group-hover:border-primary group-hover:bg-primary/10'}`}>
              <span className={`material-symbols-outlined text-xl ${isCutawayOpen ? 'text-amber-400' : 'text-primary'}`}>layers</span>
            </div>
            <span className={`font-label-sm text-[10px] tracking-widest uppercase ${isCutawayOpen ? 'text-amber-400 font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>
              {isCutawayOpen ? 'SURFACE VIEW [C]' : '3D CUTAWAY [C]'}
            </span>
          </button>
        )}

        <button
          onClick={() => handleSelectBody('blackhole')}
          className="group flex flex-col items-center space-y-1 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-orange-500/40 flex items-center justify-center group-hover:border-orange-400 group-hover:bg-orange-500/20 transition-all">
            <span className="material-symbols-outlined text-orange-400 text-xl">contrast</span>
          </div>
          <span className="font-label-sm text-[10px] tracking-widest text-orange-300 group-hover:text-orange-200 uppercase">
            SINGULARITY
          </span>
        </button>
      </footer>

      {/* Codex Details Modal */}
      <CodexModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bodyData={modalData}
      />

      {/* Start Audio Prompt Overlay */}
      {!hasStarted && <StartOverlay onEnter={handleEnter} />}
    </div>
  );
}
