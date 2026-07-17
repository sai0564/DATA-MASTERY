# Dataset Engine

The DatasetEngine is responsible for providing data to the Pyodide runtime environment cleanly.

## Core Concepts
- **Generators**: Found in `src/engine/generators/`. These scripts generate synthetic datasets on the fly directly inside the user's browser, meaning no backend server is required to download huge CSVs. Example: `ProductGenerator.js`.
- **Injectors**: Found in `src/engine/injectors/`. These parse the payload from Generators and safely inject them into the Pyodide filesystem (`pyodide.FS.writeFile`) before user code runs.

## Usage
When defining a sub-level, include a `dataset` array containing the generators to run:
```javascript
dataset: [{ generator: generateProductData, filename: 'products.csv' }]
```
