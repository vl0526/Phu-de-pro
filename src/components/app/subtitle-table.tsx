"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useSubtitleEditor } from '@/contexts/subtitle-editor-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatMsToTime } from '@/lib/srt-utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UploadCloud, Combine, Split, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { FindReplaceDialog } from './find-replace-dialog';

const ROWS_PER_PAGE = 100;

const EditableCell = ({ subId, initialText }: { subId: number, initialText: string }) => {
    const { dispatch } = useSubtitleEditor();
    const [text, setText] = useState(initialText);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleBlur = () => {
        dispatch({ type: 'UPDATE_SUBTITLE_TEXT', payload: { id: subId, text } });
    };

    return (
        <Textarea
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            className="w-full bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring p-1 resize-none overflow-hidden h-auto leading-relaxed"
            rows={text.split('\n').length || 1}
        />
    );
};

export function SubtitleTable() {
  const { state, dispatch } = useSubtitleEditor();
  const { subtitles, currentPage, searchTerm, selectedIds, isProMode } = state;
  const { toast } = useToast();

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch({ type: 'SET_SEARCH_TERM', payload: localSearchTerm });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, dispatch]);

  const filteredSubtitles = useMemo(() => {
    if (!searchTerm) return subtitles;
    return subtitles.filter(sub =>
      sub.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toString().includes(searchTerm) ||
      formatMsToTime(sub.start).includes(searchTerm)
    );
  }, [subtitles, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredSubtitles.length / ROWS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if(currentPage !== validCurrentPage) {
        dispatch({ type: 'CHANGE_PAGE', payload: validCurrentPage });
    }
  }, [validCurrentPage, currentPage, dispatch]);


  const paginatedSubtitles = useMemo(() => {
    const start = (validCurrentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredSubtitles.slice(start, end);
  }, [filteredSubtitles, validCurrentPage]);

  const handlePageChange = (newPage: number) => {
    dispatch({ type: 'CHANGE_PAGE', payload: newPage });
  };

  const handleSelectAll = (checked: boolean) => {
    const pageIds = paginatedSubtitles.map(sub => sub.id);
    dispatch({ type: 'TOGGLE_ALL_SELECTION', payload: { ids: pageIds, checked } });
  };
  
  const isAllOnPageSelected = useMemo(() => 
    paginatedSubtitles.length > 0 && paginatedSubtitles.every(sub => selectedIds.has(sub.id)),
    [paginatedSubtitles, selectedIds]
  );
  
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      toast({ variant: "destructive", title: "Chưa chọn mục nào" });
      return;
    }
    dispatch({ type: 'BATCH_DELETE' });
    toast({ variant: "success", title: `Đã xóa ${selectedIds.size} dòng` });
  }

  const handleMerge = () => {
    if (selectedIds.size < 2) {
      toast({ variant: "destructive", title: "Cần chọn ít nhất 2 dòng để gộp" });
      return;
    }
    dispatch({ type: 'MERGE_SUBTITLES' });
    toast({ variant: "success", title: `Đã gộp ${selectedIds.size} dòng thành công` });
  };

  const handleSplit = () => {
    if (selectedIds.size !== 1) {
      toast({ variant: "destructive", title: "Cần chọn đúng 1 dòng để tách" });
      return;
    }
    const subToSplit = subtitles.find(sub => selectedIds.has(sub.id));
    if (subToSplit && !subToSplit.text.includes('\n')) {
        toast({ variant: "destructive", title: "Dòng này không thể tách", description: "Nội dung phải chứa ký tự xuống dòng." });
        return;
    }
    dispatch({ type: 'SPLIT_SUBTITLE' });
     toast({ variant: "success", title: "Đã tách dòng thành công" });
  };

  const selectedCount = selectedIds.size;

  if (subtitles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
        <UploadCloud className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold mt-4 font-headline">Bắt đầu chỉnh sửa</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">Tải lên tệp phụ đề .SRT của bạn để bắt đầu chỉnh sửa một cách chuyên nghiệp.</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-card rounded-lg border flex flex-col">
      <div className="p-3 border-b flex items-center gap-2 flex-wrap">
        <div className="relative flex-grow min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm STT, thời gian, nội dung..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        {isProMode && (
          <div className="flex items-center gap-2">
            <FindReplaceDialog />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleMerge} disabled={selectedCount < 2}>
                    <Combine className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gộp dòng (chọn {'>'}= 2)</p>
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
                   <Button variant="destructive" size="sm" onClick={handleBatchDelete} disabled={selectedCount === 0} className="h-9">
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Xóa ({selectedCount})</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xóa các dòng đã chọn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <ScrollArea className="flex-grow">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              {isProMode && (
                <TableHead className="w-[50px] px-3">
                  <Checkbox 
                    checked={isAllOnPageSelected}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  />
                </TableHead>
              )}
              <TableHead className="w-[80px] px-3">STT</TableHead>
              <TableHead className="w-[220px] px-3">Thời gian</TableHead>
              <TableHead className="px-3">Nội dung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSubtitles.map(sub => (
              <TableRow key={sub.id} data-state={selectedIds.has(sub.id) ? 'selected' : ''}>
                {isProMode && (
                  <TableCell className="px-3">
                    <Checkbox
                      checked={selectedIds.has(sub.id)}
                      onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECTION', payload: sub.id })}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium px-3 text-muted-foreground">{sub.id}</TableCell>
                <TableCell className="font-mono text-xs tracking-wider px-3">
                  {`${formatMsToTime(sub.start)} → ${formatMsToTime(sub.end)}`}
                </TableCell>
                <TableCell className="whitespace-pre-wrap px-3 py-1">
                  <EditableCell subId={sub.id} initialText={sub.text} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="flex items-center justify-between p-2 border-t">
        <div className="text-sm text-muted-foreground px-2">
          {selectedCount > 0 ? (
            <Badge variant="secondary">{selectedCount} dòng đã chọn</Badge>
          ) : (
            `Hiển thị ${paginatedSubtitles.length} / ${filteredSubtitles.length} kết quả`
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={validCurrentPage === 1}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium tabular-nums px-2">
            {validCurrentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
           <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={validCurrentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
