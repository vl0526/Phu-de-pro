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
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
            className="w-full bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring p-0 resize-none overflow-hidden"
            rows={text.split('\n').length}
        />
    );
};


export function SubtitleTable() {
  const { state, dispatch } = useSubtitleEditor();
  const { subtitles, currentPage, searchTerm, selectedIds, isProMode } = state;

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
  
  if (subtitles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card m-6">
        <FileText className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold mt-4 font-headline">Trình chỉnh sửa trống</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">Tải lên tệp .SRT để bắt đầu. Kéo và thả hoặc nhấp vào nút 'Tải lên' ở trên cùng.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border m-6">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo STT, thời gian hoặc nội dung..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              {isProMode && (
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={isAllOnPageSelected}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  />
                </TableHead>
              )}
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead className="w-[200px]">Thời gian</TableHead>
              <TableHead>Nội dung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSubtitles.map(sub => (
              <TableRow key={sub.id} data-state={selectedIds.has(sub.id) ? 'selected' : ''}>
                {isProMode && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(sub.id)}
                      onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECTION', payload: sub.id })}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{sub.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatMsToTime(sub.start)}</span>
                    <span className="text-muted-foreground">{formatMsToTime(sub.end)}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-pre-wrap">
                  <EditableCell subId={sub.id} initialText={sub.text} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          Hiển thị {paginatedSubtitles.length} trên {filteredSubtitles.length} kết quả.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={validCurrentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Trang {validCurrentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
           <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={validCurrentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
