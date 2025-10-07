"use client";

import React from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Moon, Sun } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from '@/components/ui/separator';
import { FindReplaceDialog } from '@/components/app/find-replace-dialog';

const SPEED_PRESETS = [0.8, 0.9, 1.0, 1.2, 1.5, 2.0];

export function Toolbar() {
  const { state, dispatch, history, currentIndex } = useSubtitleEditor();
  const { speed, isProMode } = state;

  const handleSpeedChange = (newSpeed: number) => {
    dispatch({ type: 'CHANGE_SPEED', payload: newSpeed });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 border-b bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Tốc độ:</span>
        {SPEED_PRESETS.map(preset => (
          <Button
            key={preset}
            variant={speed === preset ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSpeedChange(preset)}
            className="h-8"
          >
            {preset}x
          </Button>
        ))}
      </div>
      
      <div className="ml-auto flex items-center gap-2">
         {isProMode && (
          <>
            <FindReplaceDialog />
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9" 
                onClick={() => dispatch({ type: 'UNDO' })}
                disabled={currentIndex === 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hoàn tác (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
               <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9" 
                onClick={() => dispatch({ type: 'REDO' })}
                disabled={currentIndex >= history.length - 1}
               >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Làm lại (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Separator orientation="vertical" className="h-6" />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
               <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9" 
                onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
               >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Đổi giao diện</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>
    </div>
  );
}
