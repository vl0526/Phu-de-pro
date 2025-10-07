"use client";

import React, { useState } from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import { Search, Wand2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export function FindReplaceDialog() {
  const { dispatch } = useSubtitleEditor();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tìm & Thay thế</DialogTitle>
          <DialogDescription>
            Tìm và thay thế hàng loạt nội dung trong tất cả phụ đề.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
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
          <Button onClick={() => setIsOpen(false)} variant="outline">Hủy</Button>
          <Button onClick={handleReplaceAll} className="bg-primary text-primary-foreground">
            <Wand2 className="mr-2 h-4 w-4" />
            Thay thế tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
