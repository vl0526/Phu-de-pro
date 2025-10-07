"use client";

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';

interface AudioContextType {
  play: (sound: 'click' | 'success' | 'error') => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRefs = {
    click: useRef<HTMLAudioElement | null>(null),
    success: useRef<HTMLAudioElement | null>(null),
    error: useRef<HTMLAudioElement | null>(null),
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
        audioRefs.click.current = new Audio('/sounds/click.mp3');
        audioRefs.success.current = new Audio('/sounds/success.mp3');
        audioRefs.error.current = new Audio('/sounds/error.mp3');
    }
  }, []);

  const play = useCallback((sound: 'click' | 'success' | 'error') => {
    const audio = audioRefs[sound].current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => console.error(`Error playing ${sound} sound:`, error));
    }
  }, [audioRefs]);

  return (
    <AudioContext.Provider value={{ play }}>
      {children}
    </AudioContext.Provider>
  );
};
