"use client";

import React, { useRef } from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { stringifySrt } from '@/lib/srt-utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from '../ui/separator';
import { Upload, Download, Undo2, Redo2, Moon, Sun } from 'lucide-react';

export function AppHeader() {
  const { state, dispatch, history, currentIndex } = useSubtitleEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.srt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        dispatch({ type: 'LOAD_SRT', payload: { content, fileName: file.name } });
        toast({ variant: "success", title: `Đã tải lên tệp: ${file.name}` });
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Không thể đọc tệp" });
      };
      reader.readAsText(file);
    } else {
      toast({ variant: "destructive", title: "Vui lòng chọn tệp .srt hợp lệ" });
    }
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleExport = () => {
    if (state.subtitles.length === 0) {
      toast({ variant: "destructive", title: "Không có phụ đề để xuất" });
      return;
    }
    try {
      const srtContent = stringifySrt(state.subtitles);
      const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const newFileName = state.fileName.replace('.srt', `_x${state.speed}.srt`);
      link.href = url;
      link.download = newFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ variant: "success", title: "Xuất tệp thành công", description: `Đã lưu với tên: ${newFileName}` });
    } catch (error) {
      console.error("Export failed:", error);
      toast({ variant: "destructive", title: "Xuất tệp thất bại" });
    }
  };

  return (
    <TooltipProvider>
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <AppLogo className="h-8 w-8" />
          <h1 className="text-lg font-bold font-headline text-foreground tracking-tight">Sub Edit Pro</h1>
        </div>
        
        <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => dispatch({ type: 'UNDO' })}
                  disabled={currentIndex === 0}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hoàn tác (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => dispatch({ type: 'REDO' })}
                  disabled={currentIndex >= history.length - 1}
                 >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Làm lại (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-1" />
            
             <Tooltip>
              <TooltipTrigger asChild>
                 <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                 >
                  <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đổi giao diện</p>
              </TooltipContent>
            </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload-input"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".srt"
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Tải lên
          </Button>
          <Button onClick={handleExport} disabled={state.subtitles.length === 0} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất file
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
}
