"use client";

import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Progress } from '@/components/ui/progress';

export function StatusBar() {
  const { state } = useSubtitleEditor();
  const { isProcessing, processingProgress, subtitles, selectedIds, fileName } = state;

  return (
    <footer className="sticky bottom-0 z-10 flex h-10 items-center justify-between border-t bg-card px-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        {isProcessing ? (
          <div className="flex items-center gap-2 w-48">
            <span>Đang xử lý...</span>
            <Progress value={processingProgress} className="w-24" />
          </div>
        ) : (
          <span>{fileName ? `Tệp: ${fileName}`: "Sẵn sàng"}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>Tổng số: {subtitles.length} dòng</span>
        <span>Đã chọn: {selectedIds.size} dòng</span>
      </div>
    </footer>
  );
}
