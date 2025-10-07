export interface Subtitle {
  id: number;
  originalId: number; // To keep track of original subtitle after manipulations
  start: number; // in milliseconds
  end: number;   // in milliseconds
  text: string;
}

export interface EditorState {
  originalSubtitles: Omit<Subtitle, 'originalId'>[];
  subtitles: Subtitle[];
  speed: number;
  searchTerm: string;
  currentPage: number;
  selectedIds: Set<number>;
  isProcessing: boolean;
  processingProgress: number;
  isProMode: boolean;
  fileName: string;
  theme: 'light' | 'dark';
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
  | { type: 'BATCH_REPLACE'; payload: { find: string; replace: string } }
  | { type: 'MERGE_SUBTITLES' }
  | { type: 'SPLIT_SUBTITLE' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'UNDO' }
  | { type: 'REDO' };
