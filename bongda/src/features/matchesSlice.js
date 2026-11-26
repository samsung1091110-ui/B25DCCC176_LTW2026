import { createSlice } from '@reduxjs/toolkit';

const matchesSlice = createSlice({
  name: 'matches',
  initialState: [],
  reducers: {
    setMatches: (_state, action) => action.payload.map((match) => ({ ...match })),
    addMatch: (state, action) => {
      const nextId = state.reduce((maxId, match) => Math.max(maxId, match.id), 0) + 1;
      state.push({ ...action.payload, id: nextId });
    },
    removeMatch: (state, action) => state.filter((match) => match.id !== action.payload),
    setGoals: (state, action) => {
      const match = state.find((item) => item.id === action.payload.id);
      if (match) {
        match.homeGoals = action.payload.homeGoals;
        match.awayGoals = action.payload.awayGoals;
      }
    },
    restoreMatch: (state, action) => [...state, { ...action.payload }].sort((a, b) => a.id - b.id),
  },
});

export const { setMatches, addMatch, removeMatch, setGoals, restoreMatch } = matchesSlice.actions;
export default matchesSlice.reducer;
