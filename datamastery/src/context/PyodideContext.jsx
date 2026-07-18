/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';
import { usePyodide } from '../hooks/usePyodide.js';

const PyodideContext = createContext(null);

export function PyodideProvider({ children }) {
  const pyodide = usePyodide();
  const { init } = pyodide;

  useEffect(() => {
    // init() is idempotent while a worker exists and recreates one after
    // Strict Mode's development cleanup has removed the previous worker.
    init().catch((err) => {
      console.error('Pyodide init failed:', err);
    });
  }, [init]);

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
