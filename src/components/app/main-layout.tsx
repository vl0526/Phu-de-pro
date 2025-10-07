"use client";

import { AppHeader } from '@/components/app/header';
import { Toolbar } from '@/components/app/toolbar';
import { SubtitleTable } from '@/components/app/subtitle-table';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { useEffect } from 'react';

export default function MainLayout() {
  const { dispatch } = useSubtitleEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            dispatch({ type: 'UNDO' });
            break;
          case 'y':
          case 'Z':
            e.preventDefault();
            dispatch({ type: 'REDO' });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Toolbar />
        <div className="flex-1 overflow-auto">
          <div className="h-full w-full">
             <SubtitleTable />
          </div>
        </div>
      </main>
    </div>
  );
}
