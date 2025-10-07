"use client";

import React, { useState, useEffect } from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [customSpeed, setCustomSpeed] = useState(speed.toString());
  const { toast } = useToast();

  useEffect(() => {
    setCustomSpeed(speed.toString());
  }, [speed]);

  const handleSpeedChange = (newSpeed: number) => {
    if (isNaN(newSpeed) || newSpeed <= 0) {
      toast({ variant: "destructive", title: "Tốc độ không hợp lệ", description: "Vui lòng nhập một số dương." });
      return;
    }
    dispatch({ type: 'CHANGE_SPEED', payload: newSpeed });
    toast({ title: `Đã áp dụng tốc độ ${newSpeed}x` });
  };

  const handleCustomSpeedApply = () => {
    handleSpeedChange(parseFloat(customSpeed));
  };
  
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      toast({ variant: "destructive", title: "Chưa chọn mục nào", description: "Vui lòng chọn các dòng phụ đề cần xóa." });
      return;
    }
    dispatch({ type: 'BATCH_DELETE' });
    toast({ title: "Xóa thành công", description: `Đã xóa ${selectedIds.size} dòng phụ đề.` });
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

      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.05"
          value={customSpeed}
          onChange={(e) => setCustomSpeed(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomSpeedApply()}
          className="h-9 w-24"
          placeholder="Tùy chỉnh"
        />
        <Button size="sm" onClick={handleCustomSpeedApply}>Áp dụng</Button>
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
