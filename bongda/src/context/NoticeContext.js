import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTheme } from './ThemeContext';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const [notice, setNotice] = useState(null);
  const { theme } = useTheme();
  const showNotice = useCallback((text) => {
    setNotice({ text });
  }, []);
  const value = useMemo(() => ({ showNotice }), [showNotice]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeoutId = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      {notice && (
        <div className={`notice-toast ${theme}`} role="status" aria-live="polite">
          {notice.text}
        </div>
      )}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error('useNotice phải được dùng bên trong NoticeProvider');
  }
  return context;
};
