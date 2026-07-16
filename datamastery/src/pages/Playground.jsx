import './Playground.css';

function Playground() {
  return (
    <div className="playground" id="playground-page">
      <div className="playground__header animate-fade-in-up">
        <div className="playground__header-text">
          <h1 className="playground__title">
            <span className="playground__title-icon">🧪</span>
            Data Playground
          </h1>
          <p className="playground__subtitle">
            Free-form Python environment. Load any dataset, experiment with Pandas 
            and NumPy, and practice at your own pace.
          </p>
        </div>
      </div>

      <div className="playground__workspace animate-fade-in-up stagger-2">
        <div className="playground__editor-panel">
          <div className="playground__editor-header">
            <span className="playground__editor-tab">
              <span className="playground__editor-dot" />
              playground.py
            </span>
            <button className="playground__run-btn" id="playground-run-btn" disabled>
              ▶ Run
            </button>
          </div>
          <div className="playground__editor-body">
            <div className="playground__placeholder">
              <div className="playground__placeholder-icon">🐍</div>
              <p>Code editor coming in Phase 3</p>
              <p className="playground__placeholder-hint">
                You&apos;ll be able to write and run Python code freely here
              </p>
            </div>
          </div>
        </div>

        <div className="playground__output-panel">
          <div className="playground__output-header">
            <span>Output</span>
          </div>
          <div className="playground__output-body">
            <div className="playground__placeholder">
              <p>Results appear here when you run code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playground;
