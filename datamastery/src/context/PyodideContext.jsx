import { createContext, useContext, useEffect, useRef } from 'react';
import { usePyodide } from '../hooks/usePyodide.js';

const PyodideContext = createContext(null);

export function PyodideProvider({ children }) {
  const pyodide = usePyodide();
  const initStarted = useRef(false);

  useEffect(() => {
    if (!initStarted.current) {
      initStarted.current = true;
      pyodide.init().catch((err) => {
        console.error('Pyodide init failed:', err);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PyodideContext.Provider value={pyodide}>
      {children}
    </PyodideContext.Provider>
  );
}

export function usePyodideContext() {
  const ctx = useContext(PyodideContext);
  if (!ctx) {
    throw new Error('usePyodideContext must be used within a PyodideProvider');
  }
  return ctx;
}
