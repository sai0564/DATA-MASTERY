import { useState, useCallback, useEffect } from 'react';

/**
 * Singleton service to manage a single Pyodide Web Worker instance across the application lifecycle.
 */
class PyodideService {
  constructor() {
    this.worker = null;
    this.status = 'idle';
    this.loadingMessage = '';
    this.error = null;
    
    this.listeners = new Set();
    this.pending = null;
    this.initCallbacks = [];
    this.firstLoadingLogged = false;

    this.handleMessage = this.handleMessage.bind(this);
    this.handleWorkerFailure = this.handleWorkerFailure.bind(this);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit() {
    this.listeners.forEach((listener) => listener());
  }

  updateState(updates) {
    if (updates.status !== undefined) this.status = updates.status;
    if (updates.loadingMessage !== undefined) this.loadingMessage = updates.loadingMessage;
    if (updates.error !== undefined) this.error = updates.error;
    this.emit();
  }

  handleMessage(event) {
    const msg = event.data;

    switch (msg.type) {
      case 'loading':
        if (!this.firstLoadingLogged) {
          console.info('[Pyodide] First loading message received', msg);
          this.firstLoadingLogged = true;
        }
        this.updateState({
          status: msg.stage === 'pyodide' ? 'loading-pyodide' : 'loading-packages',
          loadingMessage: msg.message || ''
        });
        break;

      case 'ready':
        console.info('[Pyodide] Ready');
        this.updateState({
          status: 'ready',
          loadingMessage: '',
          error: null
        });
        if (this.pending?.type === 'init') {
          this.initCallbacks.forEach(cb => cb.resolve());
          this.initCallbacks = [];
          this.pending = null;
        }
        break;

      case 'datasets-loaded':
        if (this.pending?.type === 'load-datasets') {
          this.pending.resolve(msg.files);
          this.pending = null;
        }
        break;

      case 'result':
        this.updateState({ status: 'ready' });
        if (this.pending?.type === 'run') {
          this.pending.resolve({
            stdout: msg.stdout,
            stderr: msg.stderr,
            variables: msg.variables,
            lastExpressionResult: msg.lastExpressionResult,
            stateDelta: msg.stateDelta,
          });
          this.pending = null;
        }
        break;

      case 'error': {
        const message = msg.message || 'Unknown Pyodide worker error';
        console.error('[Pyodide] Worker error message received', message);
        const pending = this.pending;

        if (pending?.type === 'init') {
          if (this.worker) {
            this.worker.terminate();
            this.worker = null;
          }
          this.failWorkerOperation(message);
        } else if (pending?.type === 'load-datasets') {
          this.failWorkerOperation(message);
        } else if (pending?.type === 'run') {
          this.updateState({ status: 'ready' });
          pending.resolve({
            stdout: '',
            stderr: '',
            error: message,
            traceback: msg.traceback,
            variables: {},
          });
          this.pending = null;
        } else {
          this.updateState({ status: 'error', error: message });
        }
        break;
      }

      case 'reset-done':
        if (this.pending?.type === 'reset') {
          this.pending.resolve();
          this.pending = null;
        }
        break;
    }
  }

  handleWorkerFailure(event, kind) {
    const detail = event?.message || event?.type || 'Unknown worker failure';
    const message = `Pyodide worker ${kind}: ${detail}`;
    console.error(`[Pyodide] ${message}`, event);
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.failWorkerOperation(message);
  }

  failWorkerOperation(message) {
    const pending = this.pending;
    this.pending = null;
    const err = new Error(message);
    
    this.updateState({
      status: 'error',
      error: message
    });
    
    if (pending) {
      if (pending.type === 'init') {
        this.initCallbacks.forEach(cb => cb.reject(err));
        this.initCallbacks = [];
      } else {
        pending.reject(err);
      }
    }
  }

  init() {
    if (this.worker) {
      if (this.status === 'ready') {
        return Promise.resolve();
      }
      if (this.pending?.type === 'init') {
        return new Promise((resolve, reject) => {
          this.initCallbacks.push({ resolve, reject });
        });
      }
      return Promise.resolve();
    }
    
    this.initCallbacks = [];

    return new Promise((resolve, reject) => {
      this.initCallbacks.push({ resolve, reject });
      let worker;
      try {
        worker = new Worker('/pyodideWorker.js');
        console.info('[Pyodide] Singleton Worker created');
        worker.addEventListener('message', this.handleMessage);
        worker.addEventListener('error', (event) => this.handleWorkerFailure(event, 'error'));
        worker.addEventListener('messageerror', (event) => this.handleWorkerFailure(event, 'messageerror'));
        this.worker = worker;
        this.pending = { type: 'init' };
        this.firstLoadingLogged = false;
        worker.postMessage({ type: 'init' });
        console.info('[Pyodide] Init message sent');
      } catch (err) {
        console.error('[Pyodide] Failed to create or start worker', err);
        if (worker) worker.terminate();
        this.worker = null;
        this.updateState({ status: 'error', error: err.message });
        this.initCallbacks.forEach(cb => cb.reject(err));
        this.initCallbacks = [];
      }
    });
  }

  loadDatasets(files) {
    if (!this.worker) return Promise.reject(new Error('Worker not initialized'));

    return new Promise((resolve, reject) => {
      this.pending = { type: 'load-datasets', resolve, reject };
      this.worker.postMessage({ type: 'load-datasets', files });
    });
  }

  runCode(code) {
    if (!this.worker) return Promise.reject(new Error('Worker not initialized'));

    this.updateState({ status: 'running' });
    return new Promise((resolve, reject) => {
      this.pending = { type: 'run', resolve, reject };
      this.worker.postMessage({ type: 'run', code });
    });
  }

  resetNamespace() {
    if (!this.worker) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.pending = { type: 'reset', resolve, reject };
      this.worker.postMessage({ type: 'reset' });
    });
  }
  
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    const pending = this.pending;
    this.pending = null;
    if (pending) {
      if (pending.type === 'init') {
        this.initCallbacks.forEach(cb => cb.reject(new Error('Pyodide worker terminated manually')));
        this.initCallbacks = [];
      } else {
        pending.reject(new Error('Pyodide worker terminated manually'));
      }
    }
    this.updateState({
      status: 'idle',
      loadingMessage: '',
      error: null
    });
  }
}

const pyodideService = new PyodideService();

/**
 * Hook to interface with the singleton Pyodide Service state.
 */
export function usePyodide() {
  const [state, setState] = useState({
    status: pyodideService.status,
    loadingMessage: pyodideService.loadingMessage,
    error: pyodideService.error,
  });

  useEffect(() => {
    const unsubscribe = pyodideService.subscribe(() => {
      setState({
        status: pyodideService.status,
        loadingMessage: pyodideService.loadingMessage,
        error: pyodideService.error,
      });
    });
    return unsubscribe;
  }, []);

  const init = useCallback(() => pyodideService.init(), []);
  const loadDatasets = useCallback((files) => pyodideService.loadDatasets(files), []);
  const runCode = useCallback((code) => pyodideService.runCode(code), []);
  const resetNamespace = useCallback(() => pyodideService.resetNamespace(), []);

  return {
    status: state.status,
    loadingMessage: state.loadingMessage,
    error: state.error,
    isReady: state.status === 'ready',
    isRunning: state.status === 'running',
    isLoading: state.status === 'loading-pyodide' || state.status === 'loading-packages',
    init,
    loadDatasets,
    runCode,
    resetNamespace,
  };
}
