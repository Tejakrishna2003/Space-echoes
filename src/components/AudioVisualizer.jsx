import React, { useEffect, useRef } from 'react';
import { spaceAudioEngine } from '../services/spaceAudioEngine';

export default function AudioVisualizer({ isMuted }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 100;
      canvasRef.current.height = 24;
      spaceAudioEngine.drawVisualizer(canvasRef.current);
    }
  }, [isMuted]);

  return (
    <canvas
      ref={canvasRef}
      className="audio-vis fixed top-4 right-24 z-50 w-24 h-6 opacity-70 pointer-events-none"
    />
  );
}
