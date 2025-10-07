export interface Subtitle {
  id: number;
  start: number; // in milliseconds
  end: number;   // in milliseconds
  text: string;
}

export interface EditorState {
  originalSubtitles: Subtitle[];
  subtitles: Subtitle[];
  speed: number;
  searchTerm: string;
  currentPage: number;
  selectedIds: Set<number>;
  isProcessing: boolean;
  processingProgress: number;
  isProMode: boolean;
  fileName: string;
}

export type Action =
  | { type: 'LOAD_SRT'; payload: { content: string; fileName: string } }
  | { type: 'CHANGE_SPEED'; payload: number }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CHANGE_PAGE'; payload: number }
  | { type: 'TOGGLE_SELECTION'; payload: number }
  | { type: 'TOGGLE_ALL_SELECTION'; payload: { ids: number[], checked: boolean } }
  | { type: 'BATCH_DELETE' }
  | { type: 'SET_PROCESSING'; payload: { isProcessing: boolean; progress: number } }
  | { type: 'UPDATE_SUBTITLE_TEXT'; payload: { id: number; text: string } }
  | { type: 'UNDO' }
  | { type: 'REDO' };
