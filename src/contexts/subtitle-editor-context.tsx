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
    const oldSubs = JSON.stringify(currentEditorState.subtitles);
    const newSubs = JSON.stringify(newEditorState.subtitles);
    
    if (oldSubs === newSubs && currentEditorState.speed === newEditorState.speed) {
        // If only UI state changes, just update the current state without adding to history
        const newHistory = [...state.history];
        newHistory[state.currentIndex] = newEditorState;
        return { ...state, history: newHistory };
    }

    const newHistorySlice = state.history.slice(0, state.currentIndex + 1);
    const newHistory = [...newHistorySlice, newEditorState];
    
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
      if (newSpeed === currentEditorState.speed) return state;
      const newSubtitles = currentEditorState.originalSubtitles.map(sub => ({
        ...sub,
        start: Math.round(sub.start / newSpeed),
        end: Math.round(sub.end / newSpeed),
      }));
      return updateHistory({ ...currentEditorState, subtitles: newSubtitles, speed: newSpeed });
    }
    case 'UPDATE_SUBTITLE_TEXT': {
        const { id, text } = action.payload;
        
        const subToUpdate = currentEditorState.subtitles.find(sub => sub.id === id);
        if (!subToUpdate || subToUpdate.text === text) return state;

        const newSubtitles = currentEditorState.subtitles.map(sub => 
            sub.id === id ? { ...sub, text } : sub
        );

        const newOriginalSubtitles = currentEditorState.originalSubtitles.map((sub, index) => {
            const currentSub = currentEditorState.subtitles[index];
            if(currentSub.id === id) {
                return { ...sub, text };
            }
            return sub;
        });
        
        return updateHistory({ 
            ...currentEditorState, 
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles
        });
    }
    case 'SET_SEARCH_TERM': {
      const newEditorState = { ...currentEditorState, searchTerm: action.payload, currentPage: 1 };
      const newHistory = [...state.history];
      newHistory[state.currentIndex] = newEditorState;
      return { ...state, history: newHistory };
    }
    case 'CHANGE_PAGE': {
        const newEditorState = { ...currentEditorState, currentPage: action.payload };
        const newHistory = [...state.history];
        newHistory[state.currentIndex] = newEditorState;
        return { ...state, history: newHistory };
    }
    case 'TOGGLE_SELECTION': {
      const newSelectedIds = new Set(currentEditorState.selectedIds);
      if (newSelectedIds.has(action.payload)) {
        newSelectedIds.delete(action.payload);
      } else {
        newSelectedIds.add(action.payload);
      }
      const newEditorState = { ...currentEditorState, selectedIds: newSelectedIds };
      const newHistory = [...state.history];
      newHistory[state.currentIndex] = newEditorState;
      return { ...state, history: newHistory };
    }
    case 'TOGGLE_ALL_SELECTION': {
        const { ids, checked } = action.payload;
        const newSelectedIds = new Set(currentEditorState.selectedIds);
        if (checked) {
            ids.forEach(id => newSelectedIds.add(id));
        } else {
            ids.forEach(id => newSelectedIds.delete(id));
        }
        const newEditorState = { ...currentEditorState, selectedIds: newSelectedIds };
        const newHistory = [...state.history];
        newHistory[state.currentIndex] = newEditorState;
        return { ...state, history: newHistory };
    }
    case 'BATCH_DELETE': {
        const { selectedIds, subtitles } = currentEditorState;
        if (selectedIds.size === 0) return state;

        const originalIdsToDelete = new Set<number>();
        const subsToKeep = subtitles.filter(sub => {
            if (selectedIds.has(sub.id)) {
                originalIdsToDelete.add(sub.originalId);
                return false;
            }
            return true;
        });

        const newSubtitles = renumberSubtitles(subsToKeep);
        const newOriginalSubtitles = renumberSubtitles(currentEditorState.originalSubtitles.filter(sub => !originalIdsToDelete.has(sub.id)));
        
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
        let changed = false;

        const newSubtitles = currentEditorState.subtitles.map(sub => {
            if(sub.text.includes(find)) {
                changed = true;
                return { ...sub, text: sub.text.replace(findRegex, replace) };
            }
            return sub;
        });

        if(!changed) return state;

        const newOriginalSubtitles = currentEditorState.originalSubtitles.map((sub, index) => {
            const currentSub = currentEditorState.subtitles[index];
             if(currentSub.text.includes(find)) {
                return { ...sub, text: sub.text.replace(findRegex, replace) };
            }
            return sub;
        });
        
        return updateHistory({ 
            ...currentEditorState, 
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles
        });
    }
    case 'MERGE_SUBTITLES': {
        const { selectedIds, subtitles } = currentEditorState;
        if (selectedIds.size < 2) return state;

        const sortedSelected = subtitles
            .filter(sub => selectedIds.has(sub.id))
            .sort((a, b) => a.start - b.start);
        
        const first = sortedSelected[0];
        const last = sortedSelected[sortedSelected.length - 1];

        const mergedText = sortedSelected.map(s => s.text).join('\n');

        const mergedSub: Subtitle = {
            id: first.id,
            originalId: first.originalId,
            start: first.start,
            end: last.end,
            text: mergedText
        };

        const originalIdsToDelete = new Set(sortedSelected.map(s => s.originalId));
        originalIdsToDelete.delete(first.originalId);

        const otherSubs = subtitles.filter(sub => !selectedIds.has(sub.id));
        const newSubtitles = renumberSubtitles([...otherSubs, mergedSub].sort((a,b) => a.start - b.start));
        
        const newOriginalSubtitles = renumberSubtitles(currentEditorState.originalSubtitles.filter(sub => !originalIdsToDelete.has(sub.id)).map(sub => {
          if (sub.id === first.originalId) {
            return {
              id: sub.id,
              start: first.start,
              end: last.end,
              text: mergedText
            };
          }
          return sub;
        }));
        
        return updateHistory({
            ...currentEditorState,
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles,
            selectedIds: new Set(),
        });
    }
    case 'SPLIT_SUBTITLE': {
        const { selectedIds, subtitles } = currentEditorState;
        if (selectedIds.size !== 1) return state;

        const subToSplit = subtitles.find(sub => selectedIds.has(sub.id));
        if (!subToSplit || !subToSplit.text.includes('\n')) return state;
        
        const originalSubToSplit = currentEditorState.originalSubtitles.find(osub => osub.id === subToSplit.originalId);
        if(!originalSubToSplit) return state;

        const parts = subToSplit.text.split('\n').filter(p => p.trim() !== '');
        if (parts.length < 2) return state;

        const duration = subToSplit.end - subToSplit.start;
        const midpointTime = subToSplit.start + Math.round(duration / parts.length);

        const firstPart: Subtitle = {
            ...subToSplit,
            text: parts[0],
            end: midpointTime,
        };
        const secondPart: Subtitle = {
            ...subToSplit,
            start: midpointTime,
            text: parts.slice(1).join('\n'),
        };

        const otherSubs = subtitles.filter(sub => sub.id !== subToSplit.id);
        const newSubtitles = renumberSubtitles([...otherSubs, firstPart, secondPart].sort((a, b) => a.start - b.start));
        
        const newOriginalSubtitles = renumberSubtitles(
            currentEditorState.originalSubtitles.map(osub => {
                if (osub.id === subToSplit.originalId) {
                    return { ...osub, text: firstPart.text, end: midpointTime };
                }
                return osub;
            }).concat([{
                id: Math.max(...currentEditorState.originalSubtitles.map(s => s.id)) + 1,
                start: midpointTime,
                end: originalSubToSplit.end,
                text: secondPart.text,
            }]).sort((a, b) => a.start - b.start)
        );

        return updateHistory({
            ...currentEditorState,
            subtitles: newSubtitles,
            originalSubtitles: newOriginalSubtitles,
            selectedIds: new Set(),
        });
    }

    case 'TOGGLE_THEME': {
      const newTheme = currentEditorState.theme === 'light' ? 'dark' : 'light';
      const newEditorState = { ...currentEditorState, theme: newTheme };
      const newHistory = [...state.history];
      newHistory[state.currentIndex] = newEditorState;
      return { ...state, history: newHistory };
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
