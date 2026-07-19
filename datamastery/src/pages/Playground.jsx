import { useState, useRef, useEffect } from 'react';
import { usePyodideContext } from '../context/PyodideContext.jsx';
import CodeEditor from '../components/editor/CodeEditor.jsx';
import OutputPanel from '../components/editor/OutputPanel.jsx';
import { PLAYGROUND_DATASETS } from '../content/playgroundDatasets.js';
import {
  Flame, Play, Terminal, Loader2, Sparkles, Database, Search,
  Heart, Download, Upload, RefreshCw, Layers, Clock, HelpCircle,
  FileText, Plus, BookOpen, ChevronRight, Bookmark, History, BarChart2,
  Trash2, X, Info
} from 'lucide-react';
import './Playground.css';

function Playground() {
  const pyodide = usePyodideContext();
  const editorRef = useRef(null);

  // --- States ---
  const [code, setCode] = useState(
    "# Welcome to DataMastery Free-form Playground!\n" +
    "import pandas as pd\n" +
    "import numpy as np\n\n" +
    "# 1. Choose a dataset from the left panel\n" +
    "# 2. Click 'Load' to mount it inside the Python filesystem\n" +
    "# 3. Run queries below!\n" +
    "df = pd.read_csv('iris.csv')\n" +
    "print(\"Shape of dataset:\", df.shape)\n" +
    "df.head()\n"
  );
  
  const [output, setOutput] = useState({ stdout: '', stderr: '', error: null });
  const [lastExpressionResult, setLastExpressionResult] = useState(null);
  const [variables, setVariables] = useState({});
  const [activeTab, setActiveTab] = useState('output');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [previewDataset, setPreviewDataset] = useState(null);
  const [loadedDatasets, setLoadedDatasets] = useState(['iris.csv']);
  
  // Local storage based states
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('dm_playground_favorites');
    return saved ? JSON.parse(saved) : ['iris'];
  });
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('dm_playground_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('dm_playground_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Automatically load the default 'iris.csv' into Pyodide FS when ready
  useEffect(() => {
    if (pyodide.isReady) {
      pyodide.loadDatasets([{ name: 'iris.csv', content: PLAYGROUND_DATASETS.iris.csv }])
        .catch(err => console.error('Failed to load default dataset:', err));
    }
  }, [pyodide.isReady]);

  // Sync state helpers
  const saveFavorites = (list) => {
    setFavorites(list);
    localStorage.setItem('dm_playground_favorites', JSON.stringify(list));
  };
  const saveBookmarks = (list) => {
    setBookmarks(list);
    localStorage.setItem('dm_playground_bookmarks', JSON.stringify(list));
  };
  const saveHistory = (list) => {
    setHistory(list);
    localStorage.setItem('dm_playground_history', JSON.stringify(list));
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  // Run script
  const handleRun = async () => {
    if (!pyodide.isReady || pyodide.isRunning) return;

    setOutput({ stdout: '', stderr: '', error: null });
    setLastExpressionResult(null);

    // Add to history list
    const newHistory = [
      { code: code.substring(0, 150) + (code.length > 150 ? '...' : ''), timestamp: new Date().toLocaleTimeString() },
      ...history.slice(0, 19)
    ];
    saveHistory(newHistory);

    try {
      const res = await pyodide.runCode(code);
      setOutput({
        stdout: res.stdout || '',
        stderr: res.stderr || '',
        error: res.error || null,
        stateDelta: res.stateDelta || null
      });
      setLastExpressionResult(res.lastExpressionResult);
      if (res.variables) {
        setVariables(res.variables);
      }
      
      // Auto switch tabs based on outputs
      if (res.error) {
        setActiveTab('errors');
      } else if (res.lastExpressionResult?.type === 'DataFrame') {
        setActiveTab('dataframe');
      } else {
        setActiveTab('output');
      }
    } catch (err) {
      setOutput({
        stdout: '',
        stderr: '',
        error: err.message || 'Execution error.'
      });
      setActiveTab('errors');
    }
  };

  // Reset Environment
  const handleReset = async () => {
    if (pyodide.isRunning) return;
    try {
      await pyodide.resetNamespace();
      setVariables({});
      setLoadedDatasets([]);
      setOutput({ stdout: '', stderr: '', error: null });
      setLastExpressionResult(null);
      alert('Python environment reset successfully.');
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  // Clear Output console
  const handleClearOutput = () => {
    setOutput({ stdout: '', stderr: '', error: null });
    setLastExpressionResult(null);
  };

  // Download code file
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "playground_notebook.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // File Upload custom CSV
  const fileInputRef = useRef(null);
  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const filename = file.name.endsWith('.csv') ? file.name : `${file.name}.csv`;

      try {
        await pyodide.loadDatasets([{ name: filename, content: csvText }]);
        setLoadedDatasets(prev => [...prev, filename]);
        // Insert read_csv snippet
        const loadSnippet = `\n# Custom uploaded dataset\ndf_${filename.replace('.csv', '')} = pd.read_csv('${filename}')\n`;
        if (editorRef.current?.insertCode) {
          editorRef.current.insertCode(loadSnippet);
        } else {
          setCode(prev => prev + loadSnippet);
        }
        alert(`Successfully loaded custom file: ${filename}!`);
      } catch (err) {
        alert(`Upload error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Load a preset dataset into virtual FS
  const loadPresetDataset = async (datasetKey, dataset) => {
    try {
      await pyodide.loadDatasets([{ name: dataset.filename, content: dataset.csv }]);
      if (!loadedDatasets.includes(dataset.filename)) {
        setLoadedDatasets(prev => [...prev, dataset.filename]);
      }
      
      const loadSnippet = `\n# Load ${dataset.name} dataset\ndf = pd.read_csv('${dataset.filename}')\ndf.head()\n`;
      if (editorRef.current?.insertCode) {
        editorRef.current.insertCode(loadSnippet);
      } else {
        setCode(prev => prev + loadSnippet);
      }
    } catch (err) {
      alert(`Failed to load dataset: ${err.message}`);
    }
  };

  // Insert code snippet helper
  const insertSnippet = (snippetText) => {
    if (editorRef.current?.insertCode) {
      editorRef.current.insertCode(snippetText);
    } else {
      setCode(prev => prev + snippetText);
    }
  };

  // Filter datasets
  const datasetKeys = Object.keys(PLAYGROUND_DATASETS).filter(key => {
    const ds = PLAYGROUND_DATASETS[key];
    const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ds.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ds.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || ds.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || ds.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleFavorite = (key, e) => {
    e.stopPropagation();
    if (favorites.includes(key)) {
      saveFavorites(favorites.filter(k => k !== key));
    } else {
      saveFavorites([...favorites, key]);
    }
  };

  // Snippets repository
  const snippets = {
    pandas: [
      { name: "Read CSV", code: "df = pd.read_csv('filename.csv')\n" },
      { name: "Head Rows", code: "df.head(5)\n" },
      { name: "Tail Rows", code: "df.tail(5)\n" },
      { name: "Summary Info", code: "df.info()\n" },
      { name: "Stats summary", code: "df.describe()\n" },
      { name: "Value counts", code: "df['column'].value_counts()\n" },
      { name: "Group By mean", code: "df.groupby('category_column')['numeric_column'].mean()\n" },
      { name: "Filter Rows", code: "filtered_df = df[df['numeric_column'] > 50]\n" },
      { name: "Sort values", code: "df.sort_values(by='column_name', ascending=False)\n" },
      { name: "Fill NA", code: "df['column'] = df['column'].fillna(0)\n" },
      { name: "Drop columns", code: "df = df.drop(columns=['column1', 'column2'])\n" },
      { name: "Merge dfs", code: "merged_df = pd.merge(df1, df2, on='key_column', how='inner')\n" },
      { name: "Pivot Table", code: "df.pivot_table(index='row_col', columns='col_col', values='val_col', aggfunc='mean')\n" },
      { name: "Correlation Matrix", code: "df.select_dtypes(include='number').corr()\n" }
    ],
    numpy: [
      { name: "Numpy Array", code: "arr = np.array([1, 2, 3, 4, 5])\n" },
      { name: "Random values", code: "rand_arr = np.random.rand(5, 5)\n" },
      { name: "Matrix mult", code: "res = np.dot(matrix_a, matrix_b)\n" },
      { name: "Calculate mean", code: "mean_val = np.mean(arr)\n" },
      { name: "Standard dev", code: "std_val = np.std(arr)\n" },
      { name: "Reshape Matrix", code: "matrix = arr.reshape(2, 3)\n" }
    ],
    visualization: [
      {
        name: "Histogram",
        code: "import matplotlib.pyplot as plt\n\ndf['column_name'].plot(kind='hist', bins=20, edgecolor='black')\nplt.title('Histogram Distribution')\nplt.show()\n"
      },
      {
        name: "Scatter Plot",
        code: "import matplotlib.pyplot as plt\n\ndf.plot(kind='scatter', x='x_column', y='y_column', alpha=0.7)\nplt.title('Scatter analysis')\nplt.show()\n"
      },
      {
        name: "Line Chart",
        code: "import matplotlib.pyplot as plt\n\ndf.plot(kind='line', x='date_column', y='value_column')\nplt.title('Timeline evolution')\nplt.show()\n"
      },
      {
        name: "Bar Chart",
        code: "import matplotlib.pyplot as plt\n\ndf.groupby('category_column')['value_column'].sum().plot(kind='bar', color='#3b82f6')\nplt.title('Category comparisons')\nplt.show()\n"
      },
      {
        name: "Box Plot",
        code: "import matplotlib.pyplot as plt\n\ndf.boxplot(column='numeric_value', by='category_value')\nplt.title('Boxplot dispersion')\nplt.show()\n"
      }
    ]
  };

  const bookmarkSnippet = (name, codeText) => {
    if (bookmarks.some(b => b.name === name)) return;
    const newBookmarks = [...bookmarks, { name, code: codeText }];
    saveBookmarks(newBookmarks);
  };

  return (
    <div className="playground-v2" id="playground-page">
      {/* LEFT PANEL: Dataset Explorer */}
      <aside className="playground-left">
        <div className="playground-panel-header">
          <Database className="w-4 h-4 text-blue-500" />
          <span>Dataset Explorer</span>
        </div>

        {/* Search and Filters */}
        <div className="dataset-explorer__filters">
          <div className="search-bar-container">
            <Search className="w-3.5 h-3.5 search-icon" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dataset-search"
            />
          </div>

          <div className="filter-selects">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="dataset-explorer__select"
            >
              <option value="All">All Categories</option>
              <option value="Classification">Classification</option>
              <option value="Regression">Regression</option>
              <option value="Business">Business</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>

        {/* Dataset list */}
        <div className="dataset-explorer__list">
          {datasetKeys.length === 0 ? (
            <div className="dataset-explorer__empty">No datasets matched your query.</div>
          ) : (
            datasetKeys.map(key => {
              const ds = PLAYGROUND_DATASETS[key];
              const isFavorite = favorites.includes(key);
              const isLoaded = loadedDatasets.includes(ds.filename);

              return (
                <div key={key} className={`dataset-card ${isLoaded ? 'loaded' : ''}`}>
                  <div className="dataset-card__header">
                    <h4>{ds.name}</h4>
                    <button
                      onClick={(e) => toggleFavorite(key, e)}
                      className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                  <span className="dataset-card__filename font-mono">{ds.filename}</span>
                  <p className="dataset-card__desc">{ds.description}</p>
                  
                  <div className="dataset-card__meta">
                    <span>{ds.rows} Rows</span>
                    <span>·</span>
                    <span>{ds.columns} Cols</span>
                    <span>·</span>
                    <span className={`difficulty-badge ${ds.difficulty.toLowerCase()}`}>
                      {ds.difficulty}
                    </span>
                  </div>

                  <div className="dataset-card__actions">
                    <button
                      onClick={() => setPreviewDataset(ds)}
                      className="dataset-btn dataset-btn--preview"
                    >
                      <Info className="w-3 h-3" /> Profile
                    </button>
                    <button
                      onClick={() => loadPresetDataset(key, ds)}
                      className="dataset-btn dataset-btn--load"
                    >
                      <Plus className="w-3 h-3" /> Load File
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* CENTER PANEL: Notebook Workspace */}
      <main className="playground-center">
        {/* Top Toolbar */}
        <div className="playground-toolbar">
          <div className="playground-toolbar__left">
            <span className="playground-toolbar__title">Notebook Workspace</span>
            <div className="loaded-files-dropdown">
              <span className="loaded-label">Loaded:</span>
              <select className="loaded-files-select" value={loadedDatasets[loadedDatasets.length - 1] || ''} readOnly>
                {loadedDatasets.length === 0 ? (
                  <option>No files loaded</option>
                ) : (
                  loadedDatasets.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="playground-toolbar__actions">
            <button onClick={handleRun} disabled={!pyodide.isReady || pyodide.isRunning} className="toolbar-btn btn--run">
              {pyodide.isRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Run Script</span>
            </button>
            
            <button onClick={handleReset} title="Reset Python environment" className="toolbar-btn">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button onClick={handleClearOutput} title="Clear terminal outputs" className="toolbar-btn">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button onClick={handleDownload} title="Download python script" className="toolbar-btn">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button onClick={() => fileInputRef.current.click()} title="Upload custom CSV" className="toolbar-btn">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadCSV}
              accept=".csv"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="playground-editor-container">
          <CodeEditor
            ref={editorRef}
            initialCode={code}
            onChange={handleCodeChange}
          />
        </div>

        {/* Bottom Output Tabs */}
        <div className="playground-output-tabs-container">
          <div className="output-tabs-header">
            <button
              onClick={() => setActiveTab('output')}
              className={`output-tab-btn ${activeTab === 'output' ? 'active' : ''}`}
            >
              Console Output
            </button>
            <button
              onClick={() => setActiveTab('dataframe')}
              className={`output-tab-btn ${activeTab === 'dataframe' ? 'active' : ''}`}
            >
              DataFrame View
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`output-tab-btn ${activeTab === 'variables' ? 'active' : ''}`}
            >
              Variables Explorer
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`output-tab-btn ${activeTab === 'errors' ? 'active' : ''}`}
            >
              {output.error && <span className="tab-error-dot" />}
              Exceptions
            </button>
          </div>

          <div className="output-tab-body">
            {activeTab === 'output' && (
              <div className="output-tab-scroll">
                {pyodide.isRunning && (
                  <div className="output-panel__loading">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="animate-pulse">Evaluating code cells...</span>
                  </div>
                )}
                {!pyodide.isRunning && !output.stdout && !lastExpressionResult && (
                  <div className="output-panel__empty">
                    <Terminal className="w-6 h-6 text-zinc-500" />
                    <p>Run your script to capture printed stdout results here.</p>
                  </div>
                )}
                {output.stdout && (
                  <pre className="output-panel__stdout font-mono">{output.stdout}</pre>
                )}
                {lastExpressionResult && lastExpressionResult.type === 'scalar' && (
                  <div className="notebook-scalar animate-fade-in font-mono mt-2">
                    <span className="notebook-scalar__label">Out: </span>
                    <span className={`notebook-scalar__value notebook-scalar__value--${lastExpressionResult.value_type}`}>
                      {lastExpressionResult.value_type === 'str' ? `"${lastExpressionResult.value}"` : String(lastExpressionResult.value)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dataframe' && (
              <div className="output-tab-scroll">
                {lastExpressionResult?.type === 'DataFrame' ? (
                  <div className="notebook-df animate-fade-in">
                    <div className="notebook-df__table-container">
                      <table className="notebook-df__table">
                        <thead>
                          <tr>
                            <th className="notebook-df__index-header">Index</th>
                            {lastExpressionResult.columns.map((col, idx) => (
                              <th key={idx}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lastExpressionResult.data.map((row, rIdx) => (
                            <tr key={rIdx}>
                              <td className="notebook-df__index font-semibold">{lastExpressionResult.index[rIdx]}</td>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>{cell === null || cell === undefined ? 'NaN' : String(cell)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="notebook-df__meta font-mono mt-2 text-xs text-zinc-400">
                      Shape: {lastExpressionResult.shape[0]} rows x {lastExpressionResult.shape[1]} columns
                    </div>
                  </div>
                ) : (
                  <div className="output-panel__empty">
                    <Database className="w-6 h-6 text-zinc-500" />
                    <p>No active DataFrame returned. Return a DataFrame (e.g. write `df` at the end of the cell) to preview table structures.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'variables' && (
              <div className="output-tab-scroll">
                {Object.keys(variables).length === 0 ? (
                  <div className="output-panel__empty">
                    <Layers className="w-6 h-6 text-zinc-500" />
                    <p>No variables defined in local Python namespace. Define variables (e.g. `x = 5`) and execute to view shapes.</p>
                  </div>
                ) : (
                  <table className="variables-table">
                    <thead>
                      <tr>
                        <th>Variable Name</th>
                        <th>Type</th>
                        <th>Shape / Value Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(variables).map(([name, info]) => (
                        <tr key={name}>
                          <td className="font-mono font-bold text-blue-400">{name}</td>
                          <td className="font-mono text-zinc-400">{info.type}</td>
                          <td className="font-mono text-zinc-200">
                            {info.type === 'DataFrame' && `DataFrame: [${info.shape[0]} rows x ${info.shape[1]} columns]`}
                            {info.type === 'Series' && `Series: [${info.shape[0]} rows]`}
                            {info.type === 'ndarray' && `Array: shape (${info.shape.join(', ')})`}
                            {info.value !== undefined && String(info.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="output-tab-scroll">
                {output.error ? (
                  <pre className="output-panel__error font-mono p-4 text-rose-500">{output.error}</pre>
                ) : (
                  <div className="output-panel__empty">
                    <CheckCircle2 className="w-6 h-6 text-zinc-500" />
                    <p>Clean run. Python exceptions and errors list will be captured here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* RIGHT PANEL: Learning Assistant */}
      <aside className="playground-right">
        <div className="playground-panel-header">
          <BookOpen className="w-4 h-4 text-[#7c3aed]" />
          <span>Notebook Assistant</span>
        </div>

        <div className="learning-assistant__sections">
          {/* Quick Examples snippets */}
          <div className="assistant-section">
            <h4 className="assistant-section__title flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>One-Click Code Snippets</span>
            </h4>
            <p className="assistant-section__subtitle">Click to append code directly to the editor cursor position:</p>
            
            <div className="snippets-grid">
              <div className="snippet-group">
                <span className="snippet-group__name">Pandas Operations</span>
                <div className="snippet-buttons flex flex-wrap gap-1.5 mt-1.5">
                  {snippets.pandas.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertSnippet(item.code)}
                      className="snippet-insert-btn"
                      title="Insert code"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="snippet-group mt-3">
                <span className="snippet-group__name">NumPy Arrays</span>
                <div className="snippet-buttons flex flex-wrap gap-1.5 mt-1.5">
                  {snippets.numpy.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertSnippet(item.code)}
                      className="snippet-insert-btn"
                      title="Insert code"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="snippet-group mt-3">
                <span className="snippet-group__name">Plot Visualizations</span>
                <div className="snippet-buttons flex flex-wrap gap-1.5 mt-1.5">
                  {snippets.visualization.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertSnippet(item.code)}
                      className="snippet-insert-btn"
                      title="Insert code"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bookmarks Section */}
          <div className="assistant-section mt-4">
            <h4 className="assistant-section__title flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Bookmarks</span>
            </h4>
            {bookmarks.length === 0 ? (
              <p className="text-zinc-500 text-xs mt-1">No bookmarked snippets yet. Save snippets to load them instantly.</p>
            ) : (
              <div className="flex flex-col gap-1.5 mt-2">
                {bookmarks.map((bm, idx) => (
                  <div key={idx} className="bookmark-item">
                    <span onClick={() => insertSnippet(bm.code)} className="bookmark-title">{bm.name}</span>
                    <button
                      onClick={() => saveBookmarks(bookmarks.filter((_, i) => i !== idx))}
                      className="bookmark-delete"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Playground Execution History */}
          <div className="assistant-section mt-4">
            <h4 className="assistant-section__title flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>Session History</span>
            </h4>
            {history.length === 0 ? (
              <p className="text-zinc-500 text-xs mt-1">Your recent evaluations history will list here.</p>
            ) : (
              <div className="flex flex-col gap-2 mt-2 font-mono text-[10px] text-zinc-400">
                {history.map((h, idx) => (
                  <div key={idx} className="history-item p-1.5 border border-white/[0.02] bg-zinc-900/40 rounded">
                    <div className="flex justify-between text-zinc-500 mb-1">
                      <span>Evaluation {history.length - idx}</span>
                      <span>{h.timestamp}</span>
                    </div>
                    <pre className="truncate text-zinc-300">{h.code}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* DATASET EXPLORER PROFILE OVERLAY MODAL */}
      {previewDataset && (
        <div className="preview-modal-overlay" onClick={() => setPreviewDataset(null)}>
          <div className="preview-modal-card animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3 className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-500" />
                Profile: {previewDataset.name}
              </h3>
              <button className="preview-modal-close" onClick={() => setPreviewDataset(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="preview-modal-body">
              <p className="preview-modal__description">{previewDataset.description}</p>
              
              <div className="briefing-card__profile-grid">
                <div className="briefing-card__profile-item">
                  <span className="profile-label">Rows</span>
                  <span className="profile-value">{previewDataset.rows}</span>
                </div>
                <div className="briefing-card__profile-item">
                  <span className="profile-label">Columns</span>
                  <span className="profile-value">{previewDataset.columns}</span>
                </div>
                <div className="briefing-card__profile-item">
                  <span className="profile-label">Difficulty</span>
                  <span className="profile-value">{previewDataset.difficulty}</span>
                </div>
              </div>

              {/* Column definitions */}
              <div className="preview-modal__section">
                <h4 className="preview-modal__section-title">Column Definitions & Data Types</h4>
                <div className="preview-columns-list">
                  {previewDataset.columnsInfo.map((col, idx) => (
                    <div key={idx} className="preview-col-row">
                      <span className="col-name font-mono">{col.name}</span>
                      <span className="col-type font-mono">{col.type}</span>
                      <span className="col-missing">Missing: {col.missing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample values preview */}
              <div className="preview-modal__section mt-4">
                <h4 className="preview-modal__section-title">Sample Records (First 4 rows)</h4>
                <div className="preview-sample-container">
                  <table className="preview-sample-table">
                    <thead>
                      <tr>
                        {previewDataset.columnsInfo.map((col, idx) => (
                          <th key={idx}>{col.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewDataset.sampleRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playground;
