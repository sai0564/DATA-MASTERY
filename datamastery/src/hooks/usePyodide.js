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

  // Promise resolver for the current worker operation
  const pendingRef = useRef(null);
  const firstLoadingLoggedRef = useRef(false);

  const failWorkerOperation = useCallback((message) => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setStatus('error');
    setError(message);
    if (pending) {
      pending.reject(new Error(message));
    }
  }, []);

  const handleMessage = useCallback((event) => {
    const msg = event.data;

    switch (msg.type) {
      case 'loading':
        if (!firstLoadingLoggedRef.current) {
          console.info('[Pyodide] First loading message received', msg);
          firstLoadingLoggedRef.current = true;
        }
        setStatus(msg.stage === 'pyodide' ? 'loading-pyodide' : 'loading-packages');
        setLoadingMessage(msg.message || '');
        break;

      case 'ready':
        console.info('[Pyodide] Ready');
        setStatus('ready');
        setLoadingMessage('');
        setError(null);
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
            lastExpressionResult: msg.lastExpressionResult,
          });
          pendingRef.current = null;
        }
        break;

      case 'error': {
        const message = msg.message || 'Unknown Pyodide worker error';
        console.error('[Pyodide] Worker error message received', message);
        const pending = pendingRef.current;

        if (pending?.type === 'init') {
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
          failWorkerOperation(message);
        } else if (pending?.type === 'load-datasets') {
          failWorkerOperation(message);
        } else if (pending?.type === 'run') {
          setStatus('ready');
          pending.resolve({
            stdout: '',
            stderr: '',
            error: message,
            traceback: msg.traceback,
            variables: {},
          });
          pendingRef.current = null;
        } else {
          setStatus('error');
          setError(message);
        }
        break;
      }

      case 'reset-done':
        if (pendingRef.current?.type === 'reset') {
          pendingRef.current.resolve();
          pendingRef.current = null;
        }
        break;
    }
  }, [failWorkerOperation]);

  const handleWorkerFailure = useCallback((event, kind) => {
    const detail = event?.message || event?.type || 'Unknown worker failure';
    const message = `Pyodide worker ${kind}: ${detail}`;
    console.error(`[Pyodide] ${message}`, event);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    failWorkerOperation(message);
  }, [failWorkerOperation]);

  // Initialize Pyodide
  const init = useCallback(() => {
    if (workerRef.current) return Promise.resolve();

    return new Promise((resolve, reject) => {
      let worker;
      try {
        worker = new Worker('/pyodideWorker.js');
        console.info('[Pyodide] Worker created');
        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', (event) => handleWorkerFailure(event, 'error'));
        worker.addEventListener('messageerror', (event) => handleWorkerFailure(event, 'messageerror'));
        workerRef.current = worker;
        pendingRef.current = { type: 'init', resolve, reject };
        firstLoadingLoggedRef.current = false;
        worker.postMessage({ type: 'init' });
        console.info('[Pyodide] Init message sent');
      } catch (err) {
        console.error('[Pyodide] Failed to create or start worker', err);
        if (worker) worker.terminate();
        workerRef.current = null;
        setStatus('error');
        setError(err.message);
        reject(err);
      }
    });
  }, [handleMessage, handleWorkerFailure]);

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

    return new Promise((resolve, reject) => {
      pendingRef.current = { type: 'reset', resolve, reject };
      workerRef.current.postMessage({ type: 'reset' });
    });
  }, []);

  // Cleanup on unmount. Reject any in-flight operation so it cannot wait forever.
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        console.info('[Pyodide] Worker terminated');
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending) {
          pending.reject(new Error('Pyodide worker terminated during operation'));
        }
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
