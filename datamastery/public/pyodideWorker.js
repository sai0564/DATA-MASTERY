/* ============================================================
   Pyodide Web Worker
   Loads Pyodide from CDN, installs pandas/numpy,
   executes Python code, and returns results.
   ============================================================ */

importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');

let pyodide = null;

async function initPyodide() {
  self.postMessage({ type: 'loading', stage: 'pyodide', message: 'Loading Python runtime...' });

  pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });

  self.postMessage({ type: 'loading', stage: 'packages', message: 'Installing Pandas & NumPy...' });
  await pyodide.loadPackage(['pandas', 'numpy']);

  // Set up stdout/stderr capture and Notebook cell execution helper
  pyodide.runPython(`
import sys
from io import StringIO
import json
import pandas as pd
import numpy as np
import ast

def _dm_serialize_value(val):
    if val is None:
        return None
    try:
        if isinstance(val, pd.DataFrame):
            df_display = val.head(20)
            return {
                'type': 'DataFrame',
                'columns': [str(c) for c in df_display.columns],
                'index': [str(i) for i in df_display.index],
                'data': [[str(x) for x in row] for row in df_display.values.tolist()],
                'shape': list(val.shape)
            }
        elif isinstance(val, pd.Series):
            series_display = val.head(20)
            return {
                'type': 'Series',
                'name': str(val.name) if val.name is not None else None,
                'index': [str(i) for i in series_display.index],
                'data': [str(x) for x in series_display.tolist()],
                'dtype': str(val.dtype),
                'shape': list(val.shape)
            }
        elif isinstance(val, np.ndarray):
            return {
                'type': 'ndarray',
                'data': val.tolist(),
                'shape': list(val.shape),
                'dtype': str(val.dtype)
            }
        elif isinstance(val, (int, float, bool, str)):
            return {
                'type': 'scalar',
                'value': val,
                'value_type': type(val).__name__
            }
        else:
            return {
                'type': 'scalar',
                'value': repr(val),
                'value_type': type(val).__name__
            }
    except Exception as e:
        return {
            'type': 'scalar',
            'value': f"<Serialization Error: {str(e)}>",
            'value_type': 'error'
        }

_dm_skip = {'sys', 'StringIO', 'json', 'pd', 'np', 'os', 'io', 'ast',
            'pandas', 'numpy', 'builtins', '__builtins__'}

def _dm_snapshot_vars(globals_dict):
    snapshot = {}
    for name, val in list(globals_dict.items()):
        if name.startswith('_') or name in _dm_skip:
            continue
        try:
            val_type = type(val).__name__
            if isinstance(val, pd.DataFrame):
                snapshot[name] = {
                    'type': 'DataFrame',
                    'id': id(val),
                    'shape': list(val.shape),
                    'cols': [str(c) for c in val.columns]
                }
            elif isinstance(val, pd.Series):
                snapshot[name] = {
                    'type': 'Series',
                    'id': id(val),
                    'shape': list(val.shape),
                    'dtype': str(val.dtype)
                }
            elif isinstance(val, np.ndarray):
                snapshot[name] = {
                    'type': 'ndarray',
                    'id': id(val),
                    'shape': list(val.shape)
                }
            else:
                snapshot[name] = {
                    'type': val_type,
                    'id': id(val),
                    'repr': repr(val) if len(repr(val)) < 200 else str(type(val))
                }
        except Exception:
            pass
    return snapshot

def _dm_detect_imports(code):
    imported_modules = []
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imported_modules.append(alias.asname or alias.name)
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ''
                for alias in node.names:
                    imported_modules.append(f"{module}.{alias.name}" if module else alias.name)
    except Exception:
        pass
    return imported_modules

def _dm_compute_state_delta(before_snapshot, globals_dict, code):
    created = []
    updated = []
    current_snapshot = _dm_snapshot_vars(globals_dict)
    
    for name, curr_info in current_snapshot.items():
        if name not in before_snapshot:
            var_data = {'name': name, 'type': curr_info['type'], 'action': 'created'}
            if curr_info['type'] == 'DataFrame':
                var_data['rows'] = curr_info['shape'][0]
                var_data['cols'] = curr_info['shape'][1]
            elif curr_info['type'] == 'Series':
                var_data['rows'] = curr_info['shape'][0]
            created.append(var_data)
        else:
            prev_info = before_snapshot[name]
            is_changed = (
                curr_info['type'] != prev_info['type'] or
                curr_info['id'] != prev_info['id'] or
                curr_info.get('shape') != prev_info.get('shape') or
                curr_info.get('repr') != prev_info.get('repr')
            )
            if is_changed:
                var_data = {'name': name, 'type': curr_info['type'], 'action': 'updated'}
                if curr_info['type'] == 'DataFrame':
                    var_data['rows'] = curr_info['shape'][0]
                    var_data['cols'] = curr_info['shape'][1]
                elif curr_info['type'] == 'Series':
                    var_data['rows'] = curr_info['shape'][0]
                updated.append(var_data)
                
    imports = _dm_detect_imports(code)
    
    return {
        'created': created,
        'updated': updated,
        'imports': imports
    }

def _dm_run_cell(code, globals_dict):
    tree = ast.parse(code)
    if not tree.body:
        return None
    
    last_node = tree.body[-1]
    if isinstance(last_node, ast.Expr):
        if len(tree.body) > 1:
            exec_tree = ast.Module(body=tree.body[:-1], type_ignores=[])
            exec(compile(exec_tree, '<exec>', 'exec'), globals_dict)
        expr_tree = ast.Expression(body=last_node.value)
        return eval(compile(expr_tree, '<eval>', 'eval'), globals_dict)
    else:
        exec(compile(tree, '<exec>', 'exec'), globals_dict)
        return None
  `);

  self.postMessage({ type: 'ready' });
}

async function loadDatasets(files) {
  const loaded = [];
  for (const file of files) {
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
    // Set up stdout/stderr capture and take global variable snapshot
    pyodide.runPython(`
_dm_stdout = StringIO()
_dm_stderr = StringIO()
sys.stdout = _dm_stdout
sys.stderr = _dm_stderr
_dm_before_snapshot = _dm_snapshot_vars(globals())
    `);

    // Feed user code as global variable to run safely via AST compiler
    pyodide.globals.set("_dm_code_to_run", code);

    // Run the user's code using the AST execution cell helper and compute state changes
    await pyodide.runPythonAsync(`
_dm_last_val = _dm_run_cell(_dm_code_to_run, globals())
_dm_serialized_last_val = _dm_serialize_value(_dm_last_val)
_dm_state_delta = _dm_compute_state_delta(_dm_before_snapshot, globals(), _dm_code_to_run)
    `);

    // Capture stdout/stderr
    const stdout = pyodide.runPython('_dm_stdout.getvalue()');
    const stderr = pyodide.runPython('_dm_stderr.getvalue()');

    // Restore standard streams
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);

    // Read notebook evaluation results and state delta
    const lastResultJson = pyodide.runPython('json.dumps(_dm_serialized_last_val)');
    const lastExpressionResult = JSON.parse(lastResultJson);

    const stateDeltaJson = pyodide.runPython('json.dumps(_dm_state_delta)');
    const stateDelta = JSON.parse(stateDeltaJson);

    // Extract user-defined variables for validation
    const variablesJson = pyodide.runPython(`
_dm_vars = {}
_dm_skip = {'sys', 'StringIO', 'json', 'pd', 'np', 'os', 'io', 'ast',
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
    self.postMessage({ type: 'result', stdout, stderr, variables, lastExpressionResult, stateDelta });

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
    const lines = traceback.split('\n');
    const pyErrorIdx = lines.findIndex(l => l.includes('File "<exec>"') || l.includes('File "<string>"'));
    if (pyErrorIdx >= 0) {
      traceback = lines.slice(pyErrorIdx).join('\n');
    }

    self.postMessage({ type: 'error', message: traceback, traceback });
  }
}

function resetNamespace() {
  if (!pyodide) return;
  pyodide.runPython(`
for _dm_name in list(globals()):
    if not _dm_name.startswith('_') and _dm_name not in ('sys','StringIO','json','pd','np','pandas','numpy','ast'):
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
