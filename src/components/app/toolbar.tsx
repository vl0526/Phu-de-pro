"use client";

import React from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SPEED_PRESETS = [0.8, 0.9, 1.0, 1.2, 1.5, 2.0];

export function Toolbar() {
  const { state, dispatch, history, currentIndex } = useSubtitleEditor();
  const { speed, selectedIds, isProMode } = state;
  const { toast } = useToast();

  const handleSpeedChange = (newSpeed: number) => {
    if (isNaN(newSpeed) || newSpeed <= 0) {
      toast({ variant: "destructive", title: "Tốc độ không hợp lệ" });
      return;
    }
    dispatch({ type: 'CHANGE_SPEED', payload: newSpeed });
    toast({ title: `Đã áp dụng tốc độ ${newSpeed}x` });
  };
  
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      toast({ variant: "destructive", title: "Chưa chọn mục nào" });
      return;
    }
    dispatch({ type: 'BATCH_DELETE' });
    toast({ title: `Đã xóa ${selectedIds.size} dòng` });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border-b bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Tốc độ:</span>
        {SPEED_PRESETS.map(preset => (
          <Button
            key={preset}
            variant={speed === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSpeedChange(preset)}
          >
            {preset}x
          </Button>
        ))}
      </div>
      
      <div className="ml-auto flex items-center gap-2">
         {isProMode && (
          <Button variant="outline" size="sm" onClick={handleBatchDelete} disabled={selectedIds.size === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa ({selectedIds.size})
          </Button>
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
      </div>
    </div>
  );
}
