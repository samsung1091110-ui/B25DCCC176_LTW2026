import { configureStore } from '@reduxjs/toolkit';
import matchesSliceReducer from './features/matchesSlice';
import goalReducer from './features/goalSlice';
import { loadSaved, saveMatches } from './storage';

const savedMatches = loadSaved();
export const hasSavedMatches = savedMatches !== null;

const store = configureStore({
  reducer: {
    matches: matchesSliceReducer,
    goal: goalReducer,
  },
  preloadedState: hasSavedMatches ? { matches: savedMatches } : undefined,
});

let currentMatches = store.getState().matches;
store.subscribe(() => {
  const nextMatches = store.getState().matches;
  if (nextMatches !== currentMatches) {
    saveMatches(nextMatches);
    currentMatches = nextMatches;
  }
});

export default store;
