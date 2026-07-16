import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Hook to manage the Pyodide Web Worker lifecycle and communication.
 *
 * States: 'idle' | 'loading-pyodide' | 'loading-packages' | 'ready' | 'running' | 'error'
 */
export function usePyodide() {
  const workerRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  // Promise resolvers for async operations
  const pendingRef = useRef(null);

  const handleMessage = useCallback((event) => {
    const msg = event.data;

    switch (msg.type) {
      case 'loading':
        setStatus(msg.stage === 'pyodide' ? 'loading-pyodide' : 'loading-packages');
        setLoadingMessage(msg.message || '');
        break;

      case 'ready':
        setStatus('ready');
        setLoadingMessage('');
        if (pendingRef.current?.type === 'init') {
          pendingRef.current.resolve();
          pendingRef.current = null;
        }
        break;

      case 'datasets-loaded':
        if (pendingRef.current?.type === 'load-datasets') {
          pendingRef.current.resolve(msg.files);
          pendingRef.current = null;
        }
        break;

      case 'result':
        setStatus('ready');
        if (pendingRef.current?.type === 'run') {
          pendingRef.current.resolve({
            stdout: msg.stdout,
            stderr: msg.stderr,
            variables: msg.variables,
          });
          pendingRef.current = null;
        }
        break;

      case 'error':
        if (pendingRef.current?.type === 'init') {
          setStatus('error');
          setError(msg.message);
          pendingRef.current.reject(new Error(msg.message));
          pendingRef.current = null;
        } else if (pendingRef.current?.type === 'run') {
          setStatus('ready');
          pendingRef.current.resolve({
            stdout: '',
            stderr: '',
            error: msg.message,
            traceback: msg.traceback,
            variables: {},
          });
          pendingRef.current = null;
        }
        break;

      case 'reset-done':
        if (pendingRef.current?.type === 'reset') {
          pendingRef.current.resolve();
          pendingRef.current = null;
        }
        break;
    }
  }, []);

  // Initialize Pyodide
  const init = useCallback(() => {
    if (workerRef.current) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const worker = new Worker('/pyodideWorker.js');
      worker.addEventListener('message', handleMessage);
      workerRef.current = worker;
      pendingRef.current = { type: 'init', resolve, reject };
      worker.postMessage({ type: 'init' });
    });
  }, [handleMessage]);

  // Load CSV datasets into Pyodide's virtual filesystem
  const loadDatasets = useCallback((files) => {
    if (!workerRef.current) return Promise.reject(new Error('Worker not initialized'));

    return new Promise((resolve, reject) => {
      pendingRef.current = { type: 'load-datasets', resolve, reject };
      workerRef.current.postMessage({ type: 'load-datasets', files });
    });
  }, []);

  // Run Python code
  const runCode = useCallback((code) => {
    if (!workerRef.current) return Promise.reject(new Error('Worker not initialized'));

    setStatus('running');
    return new Promise((resolve, reject) => {
      pendingRef.current = { type: 'run', resolve, reject };
      workerRef.current.postMessage({ type: 'run', code });
    });
  }, []);

  // Reset the Python namespace
  const resetNamespace = useCallback(() => {
    if (!workerRef.current) return Promise.resolve();

    return new Promise((resolve) => {
      pendingRef.current = { type: 'reset', resolve };
      workerRef.current.postMessage({ type: 'reset' });
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    status,
    loadingMessage,
    error,
    isReady: status === 'ready',
    isRunning: status === 'running',
    isLoading: status === 'loading-pyodide' || status === 'loading-packages',
    init,
    loadDatasets,
    runCode,
    resetNamespace,
  };
}
