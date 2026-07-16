import './OutputPanel.css';

/**
 * Displays Python execution output (stdout, stderr, errors).
 * Props:
 *   stdout: string
 *   stderr: string
 *   error: string | null
 *   isRunning: boolean
 */
function OutputPanel({ stdout = '', stderr = '', error = null, isRunning = false }) {
  return (
    <div className="output-panel" id="output-panel">
      <div className="output-panel__header">
        <span className="output-panel__title">Output</span>
        {isRunning && (
          <span className="output-panel__running">
            <span className="output-panel__running-dot" />
            Running...
          </span>
        )}
      </div>
      <div className="output-panel__body">
        {isRunning && (
          <div className="output-panel__loading">
            <span className="animate-pulse">Executing Python code...</span>
          </div>
        )}

        {!isRunning && !stdout && !stderr && !error && (
          <div className="output-panel__empty">
            Run your code to see output here
          </div>
        )}

        {stdout && (
          <pre className="output-panel__stdout">{stdout}</pre>
        )}

        {stderr && (
          <pre className="output-panel__stderr">{stderr}</pre>
        )}

        {error && (
          <pre className="output-panel__error">{error}</pre>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
