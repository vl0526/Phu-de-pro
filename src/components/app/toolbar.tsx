"use client";

import React, { useState } from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Trash2, Combine, Split, Search, Moon, Sun, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from '@/components/ui/separator';

const SPEED_PRESETS = [0.8, 0.9, 1.0, 1.2, 1.5, 2.0];

function FindReplaceDialog() {
  const { state, dispatch } = useSubtitleEditor();
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleReplaceAll = () => {
    if (!findText) {
      toast({ variant: "destructive", title: "Chưa nhập nội dung cần tìm" });
      return;
    }
    dispatch({ type: 'BATCH_REPLACE', payload: { find: findText, replace: replaceText } });
    toast({ variant: "success", title: "Đã thay thế xong" });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <DialogTrigger asChild>
               <Button variant="outline" size="icon" className="h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tìm & Thay thế</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tìm & Thay thế</DialogTitle>
          <DialogDescription>
            Tìm và thay thế hàng loạt nội dung trong tất cả các dòng phụ đề.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="find" className="text-right">
              Tìm kiếm
            </Label>
            <Input
              id="find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="replace" className="text-right">
              Thay thế bằng
            </Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleReplaceAll} className="bg-primary text-primary-foreground">
            <Wand2 className="mr-2 h-4 w-4" />
            Thay thế tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

  const handleMerge = () => {
    if (selectedIds.size !== 2) {
      toast({ variant: "destructive", title: "Cần chọn đúng 2 dòng để gộp" });
      return;
    }
    dispatch({ type: 'MERGE_SUBTITLES' });
    toast({ title: "Đã gộp 2 dòng thành công" });
  };

  const handleSplit = () => {
    if (selectedIds.size !== 1) {
      toast({ variant: "destructive", title: "Cần chọn 1 dòng để tách" });
      return;
    }
    dispatch({ type: 'SPLIT_SUBTITLE' });
     toast({ title: "Đã tách dòng thành công" });
  };
  
  const selectedCount = selectedIds.size;

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
          <>
            <FindReplaceDialog />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleMerge} disabled={selectedCount !== 2}>
                    <Combine className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gộp dòng (chọn 2)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleSplit} disabled={selectedCount !== 1}>
                    <Split className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tách dòng (chọn 1)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="outline" size="sm" onClick={handleBatchDelete} disabled={selectedCount === 0} className="h-9">
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Xóa ({selectedCount})</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xóa các dòng đã chọn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
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
