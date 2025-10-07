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
  const { speed } = state;

  const handleSpeedChange = (newSpeed: number) => {
    dispatch({ type: 'CHANGE_SPEED', payload: newSpeed });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 border-b bg-card p-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground ml-2">Tốc độ:</span>
        <TooltipProvider>
          {SPEED_PRESETS.map(preset => (
            <Tooltip key={preset}>
              <TooltipTrigger asChild>
                <Button
                  variant={speed === preset ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleSpeedChange(preset)}
                  className="h-8 w-12"
                >
                  {preset}x
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chỉnh tốc độ thành {preset}x</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
