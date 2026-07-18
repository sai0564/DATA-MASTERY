# Mission Schema

DataMastery levels are defined in standard JavaScript/JSON configuration files under `src/content/levels/`. You never need to write React code to create new content.

## Schema Definition
Each sub-level object has the following shape:

```javascript
{
  id: "1.1", // String
  type: "guided" | "challenge",
  conversation: {
    // Legacy fields are still supported and are adapted into one active task.
    situation: ["String array of conversational context"],
    concept: { name: "Concept Name", explanation: "Business reason why" },
    task: "The specific instruction for the user",

    // Preferred guided-mission format for a live mentor flow.
    // Only the active step is shown. Future steps are locked until the
    // current step's validator passes.
    steps: [
      {
        id: "load",
        mentor: "Morning! Welcome aboard.",
        task: "Load customers.csv using pandas.",
        validator: "loaded",
        success: "Nice! The dataset loaded correctly.",
        explanation: "Always verify a dataset loads before inspecting it.",
        next: "preview" // optional; default ordering is array order
      },
      {
        id: "preview",
        mentor: "Let's look inside.",
        task: "Show the first five rows.",
        validator: "head",
        success: "Perfect.",
        explanation: "head() lets us inspect the structure quickly."
      }
    ]
  },
  hints: {
    workplaceThinking: "Analytical reasoning",
    conceptReminder: "Conceptual approach",
    technicalDirection: "Exact syntax"
  },
  starterCode: "import pandas as pd\n",
  validator: {
    fn: "validateDataFrame", // Mapped to ValidationEngine registry
    expected: { shape: [1000, 5], columns: ['A', 'B'] }
  },
  rewards: { base: 100, noHint: 50 }
}
```

By adding objects of this shape to the `level-1.js` configuration array, they will automatically be parsed, rendered, and validated by the `MissionEngine`.

## Guided Conversation Behavior

Guided missions are state-driven:

1. Maya reveals one active step.
2. The learner writes/runs code.
3. The existing `ValidationEngine` checks only the active step.
4. On success, Maya reacts, explains why the step mattered, and then reveals the next step.
5. Future steps are never rendered early.
6. Existing mission rewards, hints, and save/progress completion logic remain mission-scoped.

`validator` inside a step can be:

- A semantic alias for DataFrame checks: `loaded`, `head`, `shape`, `columns`, `dtypes`, `sample`, or `describe`.
- A full validator object: `{ fn: "validateDataFrame", config: { checkShape: true } }`.
- Omitted, in which case the mission-level validator is used.
