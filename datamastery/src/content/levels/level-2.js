/**
 * Level 2: Data Quality Team (Progression Stub)
 *
 * Locked placeholder level map to allow progression unlocking.
 * Content to be built in future sprints.
 */
export const level2 = {
  id: 'level-2',
  title: 'Data Quality Team',
  description: 'Clean, filter, and validate messy files. Address duplicates and missing values.',
  mentor: 'maya',
  icon: '🧹',
  subLevels: [
    {
      id: '2.1',
      level: 'level-2',
      subLevel: '2.1',
      type: 'guided',
      mentor: 'maya',
      title: 'How Many Do We Really Have?',
      subtitle: 'Introduction to data cleaning',
      learningObjective: 'Learn to use nunique() and value_counts() to count distinct records.',
      businessSituation: [
        "Welcome to the Data Quality team!",
        "Our first task is to check a new customer import for duplicates and inconsistent cities."
      ],
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: []
        }
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n# Check the unique records count\n`,
      expectedConcepts: ['nunique'],
      conversation: {
        situation: [
          "Welcome to the Data Quality team!",
          "Our first task is to check a new customer import for duplicates and inconsistent cities."
        ],
        concept: {
          name: 'nunique()',
          explanation: "`nunique()` returns the number of unique values in a column or DataFrame.",
          why: "It helps verify if ID columns contain duplicate keys."
        },
        task: "Get the count of unique customers in the dataset.",
        resultReaction: "Great, you got the count.",
        resultExplanation: "This matches our expectations. We will dig deeper into duplicate values next."
      },
      hints: {
        taskReminder: "Maya wants to see the unique values count.",
        conceptReminder: "Use nunique() to get the count.",
        syntaxClue: "Try: df['customer_id'].nunique()"
      },
      validator: {
        type: 'semantic',
        fn: 'validateHead' // placeholder validator reference
      },
      rewards: {
        basePoints: 50,
        bonusPoints: 10
      },
      points: { base: 50, bonus: 10 },
      completionConditions: {},
      unlockRules: {
        requiresCompleted: []
      },
      nextMission: null
    }
  ]
};
