"use client";

import React from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SPEED_PRESETS = [0.8, 0.9, 1.0, 1.2, 1.5, 2.0];

export function Toolbar() {
  const { state, dispatch } = useSubtitleEditor();
  const { speed, subtitles } = state;

  const handleSpeedChange = (newSpeed: number) => {
    dispatch({ type: 'CHANGE_SPEED', payload: newSpeed });
  };
  
  if (subtitles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border-b bg-card p-2 px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground ml-2">Tốc độ:</span>
        <TooltipProvider>
          <div className='flex items-center gap-1 rounded-md bg-muted p-1'>
            {SPEED_PRESETS.map(preset => (
              <Tooltip key={preset}>
                <TooltipTrigger asChild>
                  <Button
                    variant={speed === preset ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleSpeedChange(preset)}
                    className="h-7 w-12 text-xs"
                  >
                    {preset}x
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chỉnh tốc độ thành {preset}x</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
