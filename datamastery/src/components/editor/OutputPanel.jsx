import './OutputPanel.css';

/**
 * Notebook-like console output displaying stdout, stderr, errors, dataframes, series,
 * and semantic completion feedback cards.
 */
function OutputPanel({
  stdout = '',
  stderr = '',
  error = null,
  isRunning = false,
  lastExpressionResult = null,
  isComplete = false,
  summary = null,
}) {
  
  // Custom friendly error tips for beginners
  const getFriendlyError = (errorStr) => {
    if (!errorStr) return null;

    if (errorStr.includes('FileNotFoundError')) {
      return {
        title: '📁 File Not Found Error',
        tip: "Python couldn't find the dataset file you requested.",
        action: "Check that the filename is spelled exactly correct (e.g. 'customers.csv') and wrapped in quotation marks."
      };
    }

    if (errorStr.includes('NameError')) {
      const nameMatch = errorStr.match(/name '(\w+)' is not defined/);
      const varName = nameMatch ? nameMatch[1] : '';
      return {
        title: '🔍 Name Error (Undefined Variable)',
        tip: `You used a variable or name '${varName}' that has not been defined in your script.`,
        action: varName === 'pd'
          ? "You forgot to import Pandas! Add 'import pandas as pd' at the top of your code."
          : `Make sure you defined '${varName}' first (e.g. 'df = ...') and that there are no spelling typos.`
      };
    }

    if (errorStr.includes('AttributeError')) {
      const attrMatch = errorStr.match(/object has no attribute '(\w+)'/);
      const attrName = attrMatch ? attrMatch[1] : '';
      return {
        title: '⚙️ Attribute Error (Typo in Method/Property)',
        tip: `The variable or DataFrame doesn't have a property or action named '${attrName}'.`,
        action: `Double-check your spelling! For example, did you type 'shapes' instead of 'shape'? Did you try to call 'head()' on an undefined variable?`
      };
    }

    if (errorStr.includes('TypeError')) {
      return {
        title: '⚡ Type Error (Incorrect Operation)',
        tip: "You tried to run an operation or call a property using the wrong data type.",
        action: "Did you add parentheses to a property that doesn't need them? For example, use 'df.shape' instead of 'df.shape()' because shape is an attribute, not a method."
      };
    }

    if (errorStr.includes('SyntaxError')) {
      return {
        title: '✍️ Syntax Error (Invalid Code Structure)',
        tip: "Python failed to understand the grammar of your code.",
        action: "Look for unmatched parentheses, missing commas, open quotation marks, or hanging operators."
      };
    }

    return null;
  };

  const friendlyError = getFriendlyError(error);

  // DataFrame table renderer
  const renderDataFrame = (df) => {
    return (
      <div className="notebook-df animate-fade-in" id="dataframe-renderer">
        <div className="notebook-df__table-container">
          <table className="notebook-df__table">
            <thead>
              <tr>
                <th className="notebook-df__index-header"></th>
                {df.columns.map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {df.data.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="notebook-df__index">{df.index[rIdx]}</td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{cell === null || cell === undefined ? 'NaN' : String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="notebook-df__meta">
          <span className="notebook-df__shape">
            [{df.shape[0]} rows x {df.shape[1]} columns]
          </span>
        </div>
      </div>
    );
  };

  // Series renderer
  const renderSeries = (series) => {
    return (
      <div className="notebook-series animate-fade-in" id="series-renderer">
        <div className="notebook-series__container">
          <div className="notebook-series__header">
            <span className="notebook-series__index-label">Index</span>
            <span className="notebook-series__value-label">Value</span>
          </div>
          <div className="notebook-series__body">
            {series.data.map((val, idx) => (
              <div key={idx} className="notebook-series__row">
                <span className="notebook-series__index">{series.index[idx]}</span>
                <span className="notebook-series__value">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="notebook-series__meta">
          {series.name && <span>Name: <strong>{series.name}</strong> · </span>}
          <span>Length: {series.shape[0]} · dtype: <code>{series.dtype}</code></span>
        </div>
      </div>
    );
  };

  // NumPy array renderer
  const renderNdarray = (arr) => {
    const formattedData = JSON.stringify(arr.data);
    return (
      <div className="notebook-ndarray animate-fade-in" id="ndarray-renderer">
        <div className="notebook-ndarray__box">
          <pre className="notebook-ndarray__data">{formattedData}</pre>
        </div>
        <div className="notebook-ndarray__meta">
          <span>array · shape: ({arr.shape.join(', ')}) · dtype: <code>{arr.dtype}</code></span>
        </div>
      </div>
    );
  };

  // Scalar renderer
  const renderScalar = (scalar) => {
    const val = scalar.value;
    
    // Simple markdown renderer check
    const isMarkdown = scalar.value_type === 'str' && (
      val.startsWith('#') || 
      val.includes('\n- ') || 
      val.includes('\n* ') || 
      val.includes('**')
    );

    if (isMarkdown) {
      const htmlContent = val
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\n/gim, '<br />');

      return (
        <div className="notebook-markdown animate-fade-in" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      );
    }

    return (
      <div className="notebook-scalar animate-fade-in">
        <span className="notebook-scalar__label">Out:</span>
        <span className={`notebook-scalar__value notebook-scalar__value--${scalar.value_type}`}>
          {scalar.value_type === 'str' ? `"${val}"` : String(val)}
        </span>
        <span className="notebook-scalar__type">{scalar.value_type}</span>
      </div>
    );
  };

  // Main output expression router
  const renderExpressionResult = () => {
    if (!lastExpressionResult) return null;
    const { type } = lastExpressionResult;

    switch (type) {
      case 'DataFrame':
        return renderDataFrame(lastExpressionResult);
      case 'Series':
        return renderSeries(lastExpressionResult);
      case 'ndarray':
        return renderNdarray(lastExpressionResult);
      case 'scalar':
        return renderScalar(lastExpressionResult);
      default:
        return null;
    }
  };

  return (
    <div className="output-panel" id="output-panel">
      <div className="output-panel__header">
        <span className="output-panel__title">Terminal Output</span>
        {isRunning && (
          <span className="output-panel__running">
            <span className="output-panel__running-dot" />
            Computing...
          </span>
        )}
      </div>

      <div className="output-panel__body">
        {isRunning && (
          <div className="output-panel__loading">
            <div className="output-panel__spinner" />
            <span className="animate-pulse">Executing Pyodide thread...</span>
          </div>
        )}

        {!isRunning && !stdout && !stderr && !error && !lastExpressionResult && (
          <div className="output-panel__empty">
            <div className="output-panel__empty-icon">📂</div>
            <p>Run your script to evaluate calculations here.</p>
          </div>
        )}

        {/* Stdout stream log */}
        {stdout && (
          <div className="output-panel__stdout-box">
            <span className="output-panel__stream-label">stdout</span>
            <pre className="output-panel__stdout">{stdout}</pre>
          </div>
        )}

        {/* Jupyter-like formatted returned expression */}
        {lastExpressionResult && (
          <div className="output-panel__expr-box">
            {renderExpressionResult()}
          </div>
        )}

        {/* Stderr stream log */}
        {stderr && (
          <div className="output-panel__stderr-box">
            <span className="output-panel__stream-label">stderr</span>
            <pre className="output-panel__stderr">{stderr}</pre>
          </div>
        )}

        {/* Friendly or Raw Error Card */}
        {error && (
          <div className="output-panel__error-container animate-fade-in-up">
            {friendlyError ? (
              <div className="friendly-error-card">
                <div className="friendly-error-card__header">
                  <h4>{friendlyError.title}</h4>
                </div>
                <div className="friendly-error-card__body">
                  <p className="friendly-error-card__tip"><strong>What happened:</strong> {friendlyError.tip}</p>
                  <p className="friendly-error-card__action"><strong>💡 Analyst Tip:</strong> {friendlyError.action}</p>
                </div>
                <div className="friendly-error-card__raw-toggle">
                  <details>
                    <summary>Show raw Python exception</summary>
                    <pre className="output-panel__error">{error}</pre>
                  </details>
                </div>
              </div>
            ) : (
              <pre className="output-panel__error">{error}</pre>
            )}
          </div>
        )}

        {/* Success / Learning Feedback summary card */}
        {isComplete && summary && (
          <div className="output-panel__success-card animate-fade-in-up">
            <div className="success-card">
              <div className="success-card__badge">🎉 Validation Passed!</div>
              <h3 className="success-card__title">Mission Completed</h3>
              
              <div className="success-card__section">
                <h4>Today you learned</h4>
                <ul className="success-card__list">
                  {summary.concepts.map((concept, idx) => (
                    <li key={idx}>✓ {concept}</li>
                  ))}
                </ul>
              </div>

              <div className="success-card__section">
                <h4>Why this matters</h4>
                <p className="success-card__text">{summary.why}</p>
              </div>

              <div className="success-card__section success-card__section--next">
                <h4>Next Objective</h4>
                <p className="success-card__next-title">👉 {summary.next}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
