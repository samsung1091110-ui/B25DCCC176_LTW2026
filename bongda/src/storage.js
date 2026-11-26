const STORAGE_KEY = 'ltw_bongda_matches';

export const loadSaved = () => {
  try {
    const savedValue = localStorage.getItem(STORAGE_KEY);
    if (savedValue === null) return null;

    const matches = JSON.parse(savedValue);
    return Array.isArray(matches) ? matches : null;
  } catch {
    return null;
  }
};

export const saveMatches = (matches) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch {
    // Keep the in-memory schedule usable if browser storage is full or disabled.
  }
};
