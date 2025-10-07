"use client";

import React, { createContext, useContext, useReducer, Dispatch, useMemo } from 'react';
import type { Subtitle, EditorState, Action } from '@/types';
import { parseSrt } from '@/lib/srt-utils';

const MAX_HISTORY_LENGTH = 50;

const initialState: EditorState = {
  originalSubtitles: [],
  subtitles: [],
  speed: 1.0,
  searchTerm: '',
  currentPage: 1,
  selectedIds: new Set(),
  isProcessing: false,
  processingProgress: 0,
  isProMode: true,
  fileName: '',
};

type HistoryState = {
  history: EditorState[];
  currentIndex: number;
};

const initialHistoryState: HistoryState = {
  history: [initialState],
  currentIndex: 0,
};

const reducer = (state: HistoryState, action: Action): HistoryState => {
  const currentEditorState = state.history[state.currentIndex];

  const updateHistory = (newEditorState: EditorState): HistoryState => {
    const newHistory = [...state.history.slice(0, state.currentIndex + 1), newEditorState];
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.shift();
    }
    return {
      history: newHistory,
      currentIndex: newHistory.length - 1,
    };
  };

  switch (action.type) {
    case 'LOAD_SRT': {
      const { content, fileName } = action.payload;
      const subs = parseSrt(content);
      const newState: EditorState = {
        ...initialState,
        originalSubtitles: subs,
        subtitles: subs,
        fileName,
      };
      return {
        history: [newState],
        currentIndex: 0,
      };
    }
    case 'CHANGE_SPEED': {
      const newSpeed = action.payload;
      const newSubtitles = currentEditorState.originalSubtitles.map(sub => ({
        ...sub,
        start: Math.round(sub.start / newSpeed),
        end: Math.round(sub.end / newSpeed),
      }));
      return updateHistory({ ...currentEditorState, subtitles: newSubtitles, speed: newSpeed });
    }
    case 'SET_SEARCH_TERM':
      // This is a UI-only state change, does not affect history
      return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? {...s, searchTerm: action.payload} : s) };
    case 'CHANGE_PAGE':
      // This is a UI-only state change, does not affect history
      return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? {...s, currentPage: action.payload} : s) };
    case 'TOGGLE_SELECTION': {
      const newSelectedIds = new Set(currentEditorState.selectedIds);
      if (newSelectedIds.has(action.payload)) {
        newSelectedIds.delete(action.payload);
      } else {
        newSelectedIds.add(action.payload);
      }
      return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? {...s, selectedIds: newSelectedIds} : s) };
    }
    case 'TOGGLE_ALL_SELECTION': {
        const { ids, checked } = action.payload;
        const newSelectedIds = new Set(currentEditorState.selectedIds);
        if (checked) {
            ids.forEach(id => newSelectedIds.add(id));
        } else {
            ids.forEach(id => newSelectedIds.delete(id));
        }
        return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? {...s, selectedIds: newSelectedIds} : s) };
    }
    case 'BATCH_DELETE': {
        const { selectedIds, subtitles, originalSubtitles } = currentEditorState;
        if (selectedIds.size === 0) return state;
        
        const newSubtitles = subtitles.filter(sub => !selectedIds.has(sub.id));
        const newOriginalSubtitles = originalSubtitles.filter(sub => !selectedIds.has(sub.id));
        
        return updateHistory({
            ...currentEditorState,
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles,
            selectedIds: new Set(),
        });
    }
    case 'SET_PROCESSING':
      // This is a UI-only state change, does not affect history
      return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? {...s, isProcessing: action.payload.isProcessing, processingProgress: action.payload.progress} : s) };
    
    case 'UNDO': {
      if (state.currentIndex > 0) {
        return { ...state, currentIndex: state.currentIndex - 1 };
      }
      return state;
    }
    case 'REDO': {
      if (state.currentIndex < state.history.length - 1) {
        return { ...state, currentIndex: state.currentIndex + 1 };
      }
      return state;
    }
    default:
      return state;
  }
};

const SubtitleEditorContext = createContext<{
  state: EditorState;
  dispatch: Dispatch<Action>;
  history: EditorState[];
  currentIndex: number;
} | null>(null);

export const SubtitleEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialHistoryState);
  
  const contextValue = useMemo(() => ({
    state: state.history[state.currentIndex],
    dispatch,
    history: state.history,
    currentIndex: state.currentIndex,
  }), [state]);

  return (
    <SubtitleEditorContext.Provider value={contextValue}>
      {children}
    </SubtitleEditorContext.Provider>
  );
};

export const useSubtitleEditor = () => {
  const context = useContext(SubtitleEditorContext);
  if (!context) {
    throw new Error('useSubtitleEditor must be used within a SubtitleEditorProvider');
  }
  return context;
};
