# Mission Schema

DataMastery levels are defined in standard JavaScript/JSON configuration files under `src/content/levels/`. You never need to write React code to create new content.

## Schema Definition
Each sub-level object has the following shape:

```javascript
{
  id: "1.1", // String
  type: "guided" | "challenge",
  conversation: {
    situation: ["String array of conversational context"],
    concept: { name: "Concept Name", explanation: "Business reason why" },
    task: "The specific instruction for the user"
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
