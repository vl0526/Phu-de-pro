"use client";

import React, { useRef } from 'react';
import { Upload, Download, Settings2 } from 'lucide-react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
        toast({ title: "Tải tệp lên thành công", description: `${file.name} đã được tải lên và xử lý.` });
      };
      reader.onerror = () => {
        dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: false, progress: 0 } });
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể đọc tệp." });
      };
      reader.readAsText(file);
    } else {
      toast({ variant: "destructive", title: "Tệp không hợp lệ", description: "Vui lòng chỉ tải lên tệp có định dạng .srt" });
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
      toast({ variant: "destructive", title: "Không có dữ liệu", description: "Không có phụ đề để xuất." });
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
      toast({ title: "Xuất tệp thành công", description: `Đã tải về ${newFileName}` });
    } catch (error) {
      console.error("Export failed:", error);
      toast({ variant: "destructive", title: "Xuất tệp thất bại", description: "Đã có lỗi xảy ra. Vui lòng thử lại." });
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <AppLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">Sub Edit Pro</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="pro-mode-switch">BẬT MẶC ĐỊNH</Label>
          <Switch
            id="pro-mode-switch"
            checked={state.isProMode}
            onCheckedChange={(checked) => dispatch({ type: 'TOGGLE_PRO_MODE', payload: checked })}
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".srt"
          className="hidden"
        />
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Tải lên
        </Button>
        <Button onClick={handleExport} disabled={state.subtitles.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Xuất file
        </Button>
      </div>
    </header>
  );
}
