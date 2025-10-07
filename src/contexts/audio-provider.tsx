"use client";

import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';

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
  const audioRefs = useRef<{ [key in 'click' | 'success' | 'error']?: HTMLAudioElement }>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      audioRefs.current = {
        click: new Audio('/sounds/click.mp3'),
        success: new Audio('/sounds/success.mp3'),
        error: new Audio('/sounds/error.mp3'),
      };
      
      // Preload audio
      Object.values(audioRefs.current).forEach(audio => audio?.load());
    }
  }, [isMounted]);

  const play = useCallback((sound: 'click' | 'success' | 'error') => {
    if (isMounted) {
      const audio = audioRefs.current[sound];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(error => {
          // Ignore errors in case the files are not fully loaded or supported
          console.warn(`Could not play ${sound} sound:`, error.message);
        });
      }
    }
  }, [isMounted]);

  return (
    <AudioContext.Provider value={{ play }}>
      {children}
    </AudioContext.Provider>
  );
};
