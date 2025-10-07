"use client";

import React, { createContext, useContext, useReducer, Dispatch, useMemo } from 'react';
import type { Subtitle, EditorState, Action } from '@/types';
import { parseSrt, stringifySrt } from '@/lib/srt-utils';

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
  theme: 'light',
};

type HistoryState = {
  history: EditorState[];
  currentIndex: number;
};

const initialHistoryState: HistoryState = {
  history: [initialState],
  currentIndex: 0,
};

// Helper to re-number subtitle IDs
const renumberSubtitles = (subtitles: Subtitle[]): Subtitle[] => {
  return subtitles.map((sub, index) => ({ ...sub, id: index + 1 }));
};


const reducer = (state: HistoryState, action: Action): HistoryState => {
  const currentEditorState = state.history[state.currentIndex];

  const updateHistory = (newEditorState: EditorState): HistoryState => {
    // Only add to history if there's a meaningful change in subtitles or speed
    const oldState = JSON.stringify({subtitles: currentEditorState.subtitles, speed: currentEditorState.speed});
    const newState = JSON.stringify({subtitles: newEditorState.subtitles, speed: newEditorState.speed});
    
    if (oldState === newState) {
        return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? newEditorState : s) };
    }

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
        theme: currentEditorState.theme, // Preserve theme
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
    case 'UPDATE_SUBTITLE_TEXT': {
        const { id, text } = action.payload;
        
        let changed = false;
        const newSubtitles = currentEditorState.subtitles.map(sub => {
            if (sub.id === id && sub.text !== text) {
                changed = true;
                return { ...sub, text };
            }
            return sub;
        });

        if (!changed) return state;

        const newOriginalSubtitles = currentEditorState.originalSubtitles.map(sub =>
            sub.id === id ? { ...sub, text } : sub
        );
        
        return updateHistory({ 
            ...currentEditorState, 
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles
        });
    }
    case 'SET_SEARCH_TERM':
      // This is a UI-only state change, does not affect history
      return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? {...s, searchTerm: action.payload, currentPage: 1} : s) };
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
        
        const newSubtitles = renumberSubtitles(subtitles.filter(sub => !selectedIds.has(sub.id)));
        const newOriginalSubtitles = renumberSubtitles(originalSubtitles.filter(sub => !selectedIds.has(sub.id)));
        
        return updateHistory({
            ...currentEditorState,
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles,
            selectedIds: new Set(),
        });
    }
    case 'BATCH_REPLACE': {
        const { find, replace } = action.payload;
        if (!find) return state;

        const findRegex = new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        
        const newSubtitles = currentEditorState.subtitles.map(sub => ({
            ...sub,
            text: sub.text.replace(findRegex, replace),
        }));
        const newOriginalSubtitles = currentEditorState.originalSubtitles.map(sub => ({
            ...sub,
            text: sub.text.replace(findRegex, replace),
        }));
        
        return updateHistory({ 
            ...currentEditorState, 
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles
        });
    }
    case 'MERGE_SUBTITLES': {
        const { selectedIds, subtitles, originalSubtitles } = currentEditorState;
        if (selectedIds.size !== 2) return state;

        const sortedSelected = subtitles
            .filter(sub => selectedIds.has(sub.id))
            .sort((a, b) => a.start - b.start);
        
        const [first, second] = sortedSelected;

        const mergedSub: Subtitle = {
            id: first.id,
            start: first.start,
            end: second.end,
            text: `${first.text}\n${second.text}`
        };

        const newSubtitles = renumberSubtitles(subtitles.filter(sub => !selectedIds.has(sub.id)).concat(mergedSub).sort((a,b) => a.start - b.start));
        const newOriginalSubtitles = renumberSubtitles(originalSubtitles.filter(sub => !selectedIds.has(sub.id)).concat(mergedSub).sort((a,b) => a.start - b.start));

        return updateHistory({
            ...currentEditorState,
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles,
            selectedIds: new Set(),
        });
    }
    case 'SPLIT_SUBTITLE': {
        const { selectedIds, subtitles, originalSubtitles } = currentEditorState;
        if (selectedIds.size !== 1) return state;

        const subToSplit = subtitles.find(sub => selectedIds.has(sub.id));
        if (!subToSplit || !subToSplit.text.includes('\n')) return state;

        const parts = subToSplit.text.split('\n');
        const midpointTime = subToSplit.start + Math.round((subToSplit.end - subToSplit.start) / 2);

        const firstPart: Subtitle = {
            ...subToSplit,
            text: parts.slice(0, 1).join('\n'),
            end: midpointTime,
        };
        const secondPart: Subtitle = {
            ...subToSplit,
            start: midpointTime,
            text: parts.slice(1).join('\n'),
        };

        const otherSubs = subtitles.filter(sub => sub.id !== subToSplit.id);
        const newSubtitles = renumberSubtitles([...otherSubs, firstPart, secondPart].sort((a, b) => a.start - b.start));
        const newOriginalSubtitles = renumberSubtitles([...originalSubtitles.filter(sub => sub.id !== subToSplit.id), firstPart, secondPart].sort((a,b)=>a.start-b.start));

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
    
    case 'TOGGLE_THEME': {
      const newTheme = currentEditorState.theme === 'light' ? 'dark' : 'light';
      return { ...state, history: state.history.map((s, i) => i === state.currentIndex ? {...s, theme: newTheme} : s) };
    }

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
