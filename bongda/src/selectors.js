import { createSelector } from '@reduxjs/toolkit';
import { calcStandings } from './utils';

export const selectStandings = createSelector(
  [(state) => state.matches],
  (matches) => calcStandings(matches),
);
