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
    setGoals: (state, action) => state.map((match) => (
      match.id === action.payload.id
        ? { ...match, homeGoals: action.payload.homeGoals, awayGoals: action.payload.awayGoals }
        : match
    )),
    restoreMatch: (state, action) => [...state, { ...action.payload }].sort((a, b) => a.id - b.id),
  },
});

export const { setMatches, addMatch, removeMatch, setGoals, restoreMatch } = matchesSlice.actions;
export default matchesSlice.reducer;
