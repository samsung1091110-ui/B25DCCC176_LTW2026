import { useEffect, useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = localStorage.getItem(key);
      return savedValue === null ? initialValue : JSON.parse(savedValue);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The app can still work if browser storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
