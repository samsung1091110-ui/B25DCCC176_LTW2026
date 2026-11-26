import { createSelector } from '@reduxjs/toolkit';
import { calcStandings } from './utils';

export const selectMatches = (state) => state.matches;
export const selectGoal = (state) => state.goal;

export const selectStandings = createSelector(
  [selectMatches],
  (matches) => calcStandings(matches),
);
