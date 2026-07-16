/* ============================================================
   Pyodide Web Worker
   Loads Pyodide from CDN, installs pandas/numpy,
   executes Python code, and returns results.
   ============================================================ */

importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');

/**
 * Auto-display helper — emulates Jupyter/IPython behavior.
 *
 * If the last non-empty, non-comment line of the code is a bare expression
 * (not an assignment, import, def, class, for, while, if, with, try, etc.),
 * wraps it in `print(...)` so learners see output without needing explicit
 * print() calls. This is critical for a smooth learning experience where
 * students type `df.head()` and expect to see results.
 */
function autoDisplayLastExpression(code) {
  const lines = code.split('\n');

  // Find the last non-empty, non-comment line
  let lastIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed && !trimmed.startsWith('#')) {
      lastIdx = i;
      break;
    }
  }

  if (lastIdx === -1) return code;

  const lastLine = lines[lastIdx];
  const trimmedLast = lastLine.trim();

  // Skip lines that are already print calls
  if (trimmedLast.startsWith('print(') || trimmedLast.startsWith('print (')) {
    return code;
  }

  // Skip statements (assignments, imports, control flow, etc.)
  const statementPrefixes = [
    'import ', 'from ', 'def ', 'class ', 'return ', 'yield ',
    'for ', 'while ', 'if ', 'elif ', 'else:', 'try:', 'except',
    'finally:', 'with ', 'raise ', 'assert ', 'pass', 'break',
    'continue', 'del ', 'global ', 'nonlocal ', 'async ',
  ];

  for (const prefix of statementPrefixes) {
    if (trimmedLast.startsWith(prefix)) return code;
  }

  // Skip assignments (=, +=, -=, etc.) — but allow == comparisons
  if (/^[^=]+=(?!=)/.test(trimmedLast) && !trimmedLast.startsWith('print')) {
    return code;
  }

  // Skip indented lines (inside blocks)
  if (lastLine.startsWith(' ') || lastLine.startsWith('\t')) {
    return code;
  }

  // It's a bare expression — wrap in print()
  const indent = lastLine.match(/^(\s*)/)[1];
  lines[lastIdx] = `${indent}print(${trimmedLast})`;
  return lines.join('\n');
}

let pyodide = null;

async function initPyodide() {
  self.postMessage({ type: 'loading', stage: 'pyodide', message: 'Loading Python runtime...' });

  pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });

  self.postMessage({ type: 'loading', stage: 'packages', message: 'Installing Pandas & NumPy...' });
  await pyodide.loadPackage(['pandas', 'numpy']);

  // Set up stdout/stderr capture infrastructure
  pyodide.runPython(`
import sys
from io import StringIO
import json
import pandas as pd
import numpy as np
  `);

  self.postMessage({ type: 'ready' });
}

async function loadDatasets(files) {
  const loaded = [];
  for (const file of files) {
    // Support two formats:
    // 1. { name: 'customers.csv', content: '...csv string...' } — from DatasetEngine
    // 2. 'filename.csv' — legacy static file fetch
    if (typeof file === 'object' && file.name && file.content) {
      pyodide.FS.writeFile(file.name, file.content);
      loaded.push(file.name);
    } else {
      const filename = typeof file === 'string' ? file : file.name;
      const response = await fetch(`/datasets/${filename}`);
      if (!response.ok) {
        self.postMessage({ type: 'error', message: `Failed to load dataset: ${filename}`, traceback: '' });
        return;
      }
      const content = await response.text();
      pyodide.FS.writeFile(filename, content);
      loaded.push(filename);
    }
  }
  self.postMessage({ type: 'datasets-loaded', files: loaded });
}

async function runCode(code) {
  if (!pyodide) {
    self.postMessage({ type: 'error', message: 'Pyodide is not initialized', traceback: '' });
    return;
  }

  try {
    // Set up stdout/stderr capture
    pyodide.runPython(`
_dm_stdout = StringIO()
_dm_stderr = StringIO()
sys.stdout = _dm_stdout
sys.stderr = _dm_stderr
    `);

    // Auto-display the last expression (emulates Jupyter/IPython behavior).
    // If the last non-empty, non-comment line is a bare expression (not an
    // assignment, import, def, class, for, if, etc.), wrap it in print() so
    // the learner sees output without needing explicit print().
    const processedCode = autoDisplayLastExpression(code);

    // Run the user's code
    await pyodide.runPythonAsync(processedCode);

    // Capture output
    const stdout = pyodide.runPython('_dm_stdout.getvalue()');
    const stderr = pyodide.runPython('_dm_stderr.getvalue()');

    // Restore stdout/stderr
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);

    // Extract user-defined variables for validation
    const variablesJson = pyodide.runPython(`
_dm_vars = {}
_dm_skip = {'sys', 'StringIO', 'json', 'pd', 'np', 'os', 'io',
            'pandas', 'numpy', 'builtins', '__builtins__'}

for _dm_name, _dm_val in list(globals().items()):
    if _dm_name.startswith('_'):
        continue
    if _dm_name in _dm_skip:
        continue
    try:
        if isinstance(_dm_val, pd.DataFrame):
            _dm_vars[_dm_name] = {
                'type': 'DataFrame',
                'shape': list(_dm_val.shape),
                'columns': list(_dm_val.columns),
                'dtypes': {str(c): str(d) for c, d in _dm_val.dtypes.items()},
                'head': _dm_val.head(5).values.tolist()
            }
        elif isinstance(_dm_val, pd.Series):
            _dm_vars[_dm_name] = {
                'type': 'Series',
                'shape': list(_dm_val.shape),
                'dtype': str(_dm_val.dtype),
                'head': _dm_val.head(5).tolist()
            }
        elif isinstance(_dm_val, np.ndarray):
            _dm_vars[_dm_name] = {
                'type': 'ndarray',
                'shape': list(_dm_val.shape),
                'dtype': str(_dm_val.dtype)
            }
        elif isinstance(_dm_val, (int, float, bool)):
            _dm_vars[_dm_name] = {
                'type': type(_dm_val).__name__,
                'value': _dm_val
            }
        elif isinstance(_dm_val, str) and len(_dm_val) < 1000:
            _dm_vars[_dm_name] = {
                'type': 'str',
                'value': _dm_val
            }
    except Exception:
        pass

json.dumps(_dm_vars)
    `);

    const variables = JSON.parse(variablesJson);
    self.postMessage({ type: 'result', stdout, stderr, variables });

  } catch (error) {
    // Restore stdout/stderr on error
    try {
      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);
    } catch (_) { /* ignore */ }

    // Clean up Python traceback for display
    let traceback = error.message || String(error);
    // Extract just the relevant Python error
    const lines = traceback.split('\\n');
    const pyErrorIdx = lines.findIndex(l => l.includes('File "<exec>"'));
    if (pyErrorIdx >= 0) {
      traceback = lines.slice(pyErrorIdx).join('\\n');
    }

    self.postMessage({ type: 'error', message: traceback, traceback });
  }
}

function resetNamespace() {
  if (!pyodide) return;
  pyodide.runPython(`
for _dm_name in list(globals()):
    if not _dm_name.startswith('_') and _dm_name not in ('sys','StringIO','json','pd','np','pandas','numpy'):
        del globals()[_dm_name]
  `);
  self.postMessage({ type: 'reset-done' });
}

// Message handler
self.onmessage = async (event) => {
  const { type, ...data } = event.data;

  switch (type) {
    case 'init':
      try {
        await initPyodide();
      } catch (err) {
        self.postMessage({ type: 'error', message: `Failed to initialize Pyodide: ${err.message}`, traceback: '' });
      }
      break;
    case 'load-datasets':
      await loadDatasets(data.files);
      break;
    case 'run':
      await runCode(data.code);
      break;
    case 'reset':
      resetNamespace();
      break;
  }
};
