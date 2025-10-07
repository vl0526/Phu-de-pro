
"use client"

import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useSubtitleEditor();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(state.theme);
  }, [state.theme]);

  return <>{children}</>;
}
