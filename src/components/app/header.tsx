"use client";

import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { stringifySrt } from '@/lib/srt-utils';
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const { state, dispatch } = useSubtitleEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.srt')) {
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, progress: 0 } });
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        dispatch({ type: 'LOAD_SRT', payload: { content, fileName: file.name } });
        dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: false, progress: 100 } });
        toast({ variant: "success", title: "Tải lên thành công" });
      };
      reader.onerror = () => {
        dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: false, progress: 0 } });
        toast({ variant: "destructive", title: "Không thể đọc tệp" });
      };
      reader.readAsText(file);
    } else {
      toast({ variant: "destructive", title: "Tệp không hợp lệ" });
    }
    // Reset file input to allow uploading the same file again
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleExport = () => {
    if (state.subtitles.length === 0) {
      toast({ variant: "destructive", title: "Không có phụ đề" });
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
      toast({ variant: "success", title: "Xuất tệp thành công" });
    } catch (error) {
      console.error("Export failed:", error);
      toast({ variant: "destructive", title: "Xuất tệp thất bại" });
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <AppLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">Sub Edit Pro</h1>
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
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Tải lên
        </Button>
        <Button onClick={handleExport} disabled={state.subtitles.length === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" />
          Xuất file
        </Button>
      </div>
    </header>
  );
}
