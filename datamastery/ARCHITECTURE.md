# Architecture

DataMastery uses a heavily decoupled Engine Architecture to ensure React components remain "dumb" while all business logic is testable, isolated, and generic.

## Core Engines
1. **MissionEngine**: The brain. Ingests JSON/JS configuration from `src/content/` and drives the state of a single mission (Guided or Challenge). It uses Redux-like event dispatching.
2. **ConversationEngine**: The voice. Formats and parses text data. Interpolates context values (like dataset row counts) into natural language.
3. **ValidationEngine**: The judge. Supports Generic DataFrame evaluation (asserting schemas and dtypes) and Multi-Stage challenges without string-matching user code.
4. **DatasetEngine**: The generator. Creates runtime datasets or loads CSVs.
5. **ProgressionEngine**: The gatekeeper. Handles locks and achievements.
6. **RewardEngine**: The scorekeeper. Calculates DP dynamically based on hint penalties.
7. **SaveSystem**: The database. Persists data to `localStorage` safely with fallback boundaries.

## Component Flow
`MissionView.jsx` -> Instantiates `MissionEngine` -> Engine manages `Pyodide` -> Pyodide returns results -> `ValidationEngine` evaluates -> Updates React state -> Renders `OutputPanel.jsx` and `HintDrawer.jsx`.
