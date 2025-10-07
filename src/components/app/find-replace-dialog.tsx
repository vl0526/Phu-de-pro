"use client";

import React, { useState } from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Wand2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAudio } from '@/contexts/audio-provider';

export function FindReplaceDialog() {
  const { dispatch } = useSubtitleEditor();
  const { play } = useAudio();
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFindText('');
      setReplaceText('');
    }
  }

  const handleReplaceAll = () => {
    play('click');
    if (!findText) {
      toast({ variant: "destructive", title: "Chưa nhập nội dung cần tìm" });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    dispatch({ type: 'BATCH_REPLACE', payload: { find: findText, replace: replaceText } });
    toast({ variant: "success", title: "Đã thay thế xong" });
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <DialogTrigger asChild>
               <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => play('click')}>
                  <Search className="h-4 w-4" />
                </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tìm & Thay thế</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent 
        className={`sm:max-w-md ${isShaking ? 'animate-shake' : ''}`}
        onAnimationEnd={() => setIsShaking(false)}
      >
        <DialogHeader>
          <DialogTitle>Tìm & Thay thế</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="find">Tìm kiếm</Label>
            <Input
              id="find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Nhập nội dung cần tìm..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="replace">Thay thế bằng</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Nhập nội dung thay thế..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { play('click'); handleOpenChange(false); }} variant="outline">Hủy</Button>
          <Button onClick={handleReplaceAll}>
            <Wand2 className="mr-2 h-4 w-4" />
            Thay thế tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
