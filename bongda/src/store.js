import { configureStore } from '@reduxjs/toolkit';
import matchesSliceReducer from './features/matchesSlice';
import goalReducer from './features/goalSlice';

const store = configureStore({
  reducer: {
    matches: matchesSliceReducer,
    goal: goalReducer,
  },
});

export default store;
