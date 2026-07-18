/**
 * Level 1: First Week at NovaMetrics
 *
 * Configured using the generic Sprint 2 data-driven schema.
 */
export const level1 = {
  id: 'level-1',
  title: 'First Week at NovaMetrics',
  description: 'Your first week as a Junior Data Analyst. Learn to inspect and explore data.',
  mentor: 'maya',
  icon: '🏢',
  subLevels: [
    // ─── 1.1 Your First Dataset ───────────────────────────────────────
    {
      id: '1.1',
      level: 'level-1',
      subLevel: '1.1',
      type: 'guided',
      mentor: 'maya',
      title: 'Your First Dataset',
      subtitle: 'Loading and previewing a DataFrame',
      learningObjective: 'Learn basic DataFrame loading with pd.read_csv() and previewing with df.head()',
      estDuration: '3m',
      
      datasetCard: {
        filename: 'customers.csv',
        rows: '1,247',
        columns: '9',
        department: 'Marketing Analytics',
        description: 'Raw CRM customer profiles containing contact info, geographical region, and sign-up timestamp.',
        difficulty: 'Beginner'
      },

      summary: {
        concepts: ['pd.read_csv()', 'df.head()', 'Previewing datasets'],
        why: 'Professional analysts inspect the top rows of data first to verify column layout and confirm files loaded correctly before querying them.',
        next: 'Check the exact size and dimensions of the dataset.'
      },

      businessSituation: [
        "Morning! Welcome to the analytics team. 👋",
        "I'm Maya — I'll be walking you through your first few tasks.",
        "When someone sends me a CSV, I never trust it immediately.",
        "The first thing I do is peek inside. Pandas gives us a quick way to do that."
      ],
      
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\n# Load the customer data\ndf = pd.read_csv('customers.csv')\n\n# Show the first few rows\n`,
      
      expectedConcepts: ['read_csv', 'DataFrame', 'head'],
      
      conversation: {
        situation: [
          "Morning! Welcome to the analytics team. 👋",
          "I'm Maya — I'll be walking you through your first few tasks.",
          "When someone sends me a CSV, I never trust it immediately.",
          "The first thing I do is peek inside. Pandas gives us a quick way to do that."
        ],
        concept: {
          name: 'head()',
          explanation: "In Pandas, we load CSV files with `pd.read_csv()` and preview the first rows with `head()`.",
          why: "It gives us a quick look at the data without crashing our browser by printing thousands of rows.",
        },
        task: "Load the customer file and show me the first few records.",
        // Shown on the first guided step when the starter code already
        // satisfies the instruction, so the learner isn't told to do work
        // that's already scaffolded for them.
        scaffoldNote: "The code has been scaffolded for you. Click `Run` to execute it.",
        resultReaction: "Perfect. There's our data.",
        resultExplanation: "Each row is one customer. We have their ID, name, email, location, and signup date. Now we know exactly what the shape of the data looks like.",
      },
      
      hints: {
        workplaceThinking: "What's the first thing you want to see when someone hands you a new data file?",
        conceptReminder: "Use pd.read_csv() to load the file, then call the head() method to preview it.",
        technicalDirection: "Try: df.head()",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDataFrame',
        config: {
          checkLoaded: true,
          checkHead: true,
          loadFeedback: "Make sure you load the CSV file with pd.read_csv() first.",
          headMissingFeedback: "You've loaded the data, but I can't see it. Try calling df.head() so we can take a look."
        }
      },
      
      rewards: {
        base: 50,
        bonus: 10,
        firstTry: 15,
        noHint: 10,
        challenge: 0,
        levelCompletion: 0
      },
      
      points: { base: 50, bonus: 10 }, // legacy compatibility fallback
      
      completionConditions: {
        checkVariables: ['df'],
        checkOutput: ['customer_id', 'first_name'],
      },
      
      unlockRules: {
        requiresCompleted: [],
      },
      
      nextMission: '1.2',
    },

    // ─── 1.2 How Big Is This File? ────────────────────────────────────
    {
      id: '1.2',
      level: 'level-1',
      subLevel: '1.2',
      type: 'guided',
      mentor: 'maya',
      title: 'How Big Is This File?',
      subtitle: 'DataFrame size and dimensions',
      learningObjective: 'Inspect rows and columns count using df.shape attribute',
      estDuration: '3m',

      datasetCard: {
        filename: 'customers.csv',
        rows: '1,247',
        columns: '9',
        department: 'Marketing Analytics',
        description: 'Raw CRM customer profiles containing contact info, geographical region, and sign-up timestamp.',
        difficulty: 'Beginner'
      },

      summary: {
        concepts: ['df.shape', 'DataFrame dimensions'],
        why: 'Knowing the exact dimensions of your dataset helps verify completeness and spot issues like truncated exports or lost columns.',
        next: 'Identify what columns/fields are actually tracked in this database.'
      },
      
      businessSituation: [
        "Okay, we know it loaded.",
        "But how big is it? Marketing said there's about 1,200 people.",
        "If there's 10,000, or 50... we have a problem.",
        "Let's check the exact size."
      ],
      
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n\n# Check the exact size of this dataset\n`,
      
      expectedConcepts: ['shape'],
      
      conversation: {
        memoryText: "You nailed the preview. But before we get comfortable, we need to verify the size.",
        situation: [
          "Okay, we know it loaded.",
          "But how big is it? Marketing said there's about 1,200 people.",
          "If there's 10,000, or 50... we have a problem.",
          "Let's check the exact size."
        ],
        concept: {
          name: 'shape',
          explanation: "`shape` is an attribute that tells you how many rows and columns a DataFrame has. It returns a tuple like `(rows, columns)`.",
          why: "Before you start writing complex logic, you need to know how much data you're actually processing.",
        },
        task: "Print the shape of the dataset so we can verify the row count.",
        resultReaction: "{{shape_0}} rows and {{shape_1}} columns.",
        resultExplanation: "Marketing was right on the money. We have exactly {{shape_0}} customer records, each with {{shape_1}} fields.",
      },
      
      hints: {
        workplaceThinking: "Before doing anything, you need to know exactly how much data you're dealing with to spot missing data.",
        conceptReminder: "Pandas DataFrames have an attribute that returns the dimensions as a tuple.",
        technicalDirection: "Try: df.shape",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDataFrame',
        config: {
          checkLoaded: true,
          checkShape: true,
          shapeFeedback: "You have the DataFrame loaded. Now check its shape — try printing df.shape."
        }
      },
      
      rewards: {
        base: 50,
        bonus: 10,
        firstTry: 15,
        noHint: 10,
        challenge: 0,
        levelCompletion: 0
      },
      
      points: { base: 50, bonus: 10 },
      
      completionConditions: {
        checkOutputRegex: ['\\b\\d+\\b'],
      },
      
      unlockRules: {
        requiresCompleted: ['1.1'],
      },
      
      nextMission: '1.3',
    },

    // ─── 1.3 What Fields Are We Tracking? ─────────────────────────────
    {
      id: '1.3',
      level: 'level-1',
      subLevel: '1.3',
      type: 'guided',
      mentor: 'maya',
      title: 'What Fields Are We Tracking?',
      subtitle: 'DataFrame column names',
      learningObjective: 'Inspect DataFrame columns list with df.columns attribute',
      estDuration: '3m',

      datasetCard: {
        filename: 'customers.csv',
        rows: '1,247',
        columns: '9',
        department: 'Marketing Analytics',
        description: 'Raw CRM customer profiles containing contact info, geographical region, and sign-up timestamp.',
        difficulty: 'Beginner'
      },

      summary: {
        concepts: ['df.columns', 'Inspecting column headers'],
        why: 'Printing the columns is the first step in planning which variables to use for filters, aggregations, and business metrics.',
        next: 'Check the data types detected by Pandas for these columns.'
      },
      
      businessSituation: [
        "We have the right number of rows.",
        "Now I need to know what fields they actually tracked.",
        "First name? Email? Address?",
        "Print the column headers so we can see what we're working with."
      ],
      
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n\n# Show the column names\n`,
      
      expectedConcepts: ['columns'],
      
      conversation: {
        memoryText: "We know it has 9 columns, but we need to know what they actually are.",
        situation: [
          "We have the right number of rows.",
          "Now I need to know what fields they actually tracked.",
          "First name? Email? Address?",
          "Print the column headers so we can see what we're working with."
        ],
        concept: {
          name: 'columns',
          explanation: "`columns` is an attribute that returns a list of every field name in your dataset.",
          why: "You can't write a query or filter a dataset if you don't know exactly how the column names are spelled.",
        },
        task: "Show me the exact column names in this dataset.",
        resultReaction: "There we go. I see `customer_id`, `email`, and `age`.",
        resultExplanation: "Notice how they use underscores for spaces, like `first_name` instead of `First Name`? That makes it much easier to write code later.",
      },
      
      hints: {
        workplaceThinking: "You can't analyze what you don't have. Always check what fields exist in a new dataset before planning your work.",
        conceptReminder: "DataFrames store their column names in a specific attribute, similar to how they store their shape.",
        technicalDirection: "Try: df.columns",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDataFrame',
        config: {
          checkLoaded: true,
          checkColumns: true,
          requiredColumns: ['customer_id', 'first_name', 'email'],
          columnsFeedback: "The DataFrame is loaded. Try printing df.columns to see the field names."
        }
      },
      
      rewards: {
        base: 50,
        bonus: 10,
        firstTry: 15,
        noHint: 10,
        challenge: 0,
        levelCompletion: 0
      },
      
      points: { base: 50, bonus: 10 },
      
      completionConditions: {
        checkOutput: ['customer_id', 'first_name'],
      },
      
      unlockRules: {
        requiresCompleted: ['1.2'],
      },
      
      nextMission: '1.4',
    },

    // ─── 1.4 What Types Did Pandas Detect? ────────────────────────────
    {
      id: '1.4',
      level: 'level-1',
      subLevel: '1.4',
      type: 'guided',
      mentor: 'maya',
      title: 'What Types Did Pandas Detect?',
      subtitle: 'Data types detection',
      learningObjective: 'Inspect column data types with df.dtypes or df.info()',
      estDuration: '4m',

      datasetCard: {
        filename: 'customers.csv',
        rows: '1,247',
        columns: '9',
        department: 'Marketing Analytics',
        description: 'Raw CRM customer profiles containing contact info, geographical region, and sign-up timestamp.',
        difficulty: 'Beginner'
      },

      summary: {
        concepts: ['df.dtypes', 'df.info()', 'Data types (int64, float64, object)'],
        why: 'Correct data types are critical. For example, dates loaded as objects (strings) prevent date filters and timeline math.',
        next: 'Check random rows in the dataset for anomalies.'
      },
      
      businessSituation: [
        "Here is where a lot of people mess up.",
        "Just because a column is called 'signup_date' doesn't mean Pandas knows it's a date.",
        "It might have loaded it as raw text.",
        "We need to verify the data types for every column."
      ],
      
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n\n# Check the data types\n`,
      
      expectedConcepts: ['dtypes', 'info'],
      
      conversation: {
        memoryText: "You have the column names down, but we don't actually know what kind of data is living inside them.",
        situation: [
          "Here is where a lot of people mess up.",
          "Just because a column is called 'signup_date' doesn't mean Pandas knows it's a date.",
          "It might have loaded it as raw text.",
          "We need to verify the data types for every column."
        ],
        concept: {
          name: 'dtypes',
          explanation: "`dtypes` shows you the data type Pandas assigned to each column. You can also use `info()` for a more detailed summary.",
          why: "If you try to add two numbers together, but they are stored as text, you'll get an error. You have to know the types before calculating anything.",
        },
        task: "Check the data types of each column for me.",
        resultReaction: "Excellent. Let's look closely at what Pandas decided.",
        resultExplanation: "Look at `signup_date`. Pandas assigned it `object`, which means it treated it as a text string instead of a real Date. We will have to convert that before we can do time-based analysis.",
      },
      
      hints: {
        workplaceThinking: "If your dates are text, you can't filter by year. Always verify the data types before analyzing.",
        conceptReminder: "You can check the types of all columns using the dtypes attribute or the info() method.",
        technicalDirection: "Try: df.dtypes",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDataFrame',
        config: {
          checkLoaded: true,
          checkDtypes: true,
          dtypesFeedback: "Check the data types — try df.dtypes or df.info()."
        }
      },
      
      rewards: {
        base: 50,
        bonus: 10,
        firstTry: 15,
        noHint: 10,
        challenge: 0,
        levelCompletion: 0
      },
      
      points: { base: 50, bonus: 10 },
      
      completionConditions: {
        checkOutput: ['int64', 'object'],
      },
      
      unlockRules: {
        requiresCompleted: ['1.3'],
      },
      
      nextMission: '1.5',
    },

    // ─── 1.5 Inspect Random Records ──────────────────────────────
    {
      id: '1.5',
      level: 'level-1',
      subLevel: '1.5',
      type: 'guided',
      mentor: 'maya',
      title: 'Inspect Random Records',
      subtitle: 'Inspecting random rows of a DataFrame',
      learningObjective: 'Inspect a random sample of rows using the df.sample() method',
      estDuration: '3m',

      datasetCard: {
        filename: 'customers.csv',
        rows: '1,247',
        columns: '9',
        department: 'Marketing Analytics',
        description: 'Raw CRM customer profiles containing contact info, geographical region, and sign-up timestamp.',
        difficulty: 'Beginner'
      },

      summary: {
        concepts: ['df.sample()', 'Random sampling'],
        why: 'Inspecting only head() can lead to confirmation bias. Random sampling reveals anomalies hidden deep within the dataset.',
        next: 'Compute standard statistical summaries of the data fields.'
      },
      
      businessSituation: [
        "The top of the file always looks perfectly clean.",
        "That's why I never just rely on `head()`.",
        "I want you to pull a few random records from the middle of the stack.",
        "You'd be surprised what you find when you look where no one expects."
      ],
      
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n\n# Show a random sample of 5 rows\n`,
      
      expectedConcepts: ['sample'],
      
      conversation: {
        memoryText: "We know the shape and types. But remember, the top rows are often misleadingly perfect.",
        situation: [
          "The top of the file always looks perfectly clean.",
          "That's why I never just rely on `head()`.",
          "I want you to pull a few random records from the middle of the stack.",
          "You'd be surprised what you find when you look where no one expects."
        ],
        concept: {
          name: 'sample()',
          explanation: "`sample(n)` picks random rows from your DataFrame. For example, `df.sample(5)` will return 5 random records.",
          why: "Checking random samples is the best way to get an unbiased view of your dataset's layout and spot missing values deep in the file.",
        },
        task: "Pull a random sample of 5 rows from the dataset.",
        resultReaction: "Much better. A completely random slice.",
        resultExplanation: "By inspecting random samples, you avoid confirmation bias. If a system glitch broke the records on row 800, `head()` would never show it to you. `sample()` gives you a real look.",
      },
      
      hints: {
        workplaceThinking: "Don't fall for confirmation bias by only looking at row 1. Always sample randomly to find hidden edge cases.",
        conceptReminder: "Pandas can pick random rows for you using a specific method. Pass the number you want inside the parentheses.",
        technicalDirection: "Try: df.sample(5)",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDataFrame',
        config: {
          checkLoaded: true,
          checkSample: true,
          sampleFeedback: "The DataFrame is loaded. Now inspect a random sample of 5 rows using df.sample(5)."
        }
      },
      
      rewards: {
        base: 50,
        bonus: 10,
        firstTry: 15,
        noHint: 10,
        challenge: 0,
        levelCompletion: 0
      },
      
      points: { base: 50, bonus: 10 },
      
      completionConditions: {},
      
      unlockRules: {
        requiresCompleted: ['1.4'],
      },
      
      nextMission: '1.6',
    },

    // ─── 1.6 Quick Dataset Summary ────────────────────────────────
    {
      id: '1.6',
      level: 'level-1',
      subLevel: '1.6',
      type: 'guided',
      mentor: 'maya',
      title: 'Quick Dataset Summary',
      subtitle: 'Statistical summary of a DataFrame',
      learningObjective: 'Generate statistical descriptions with df.describe()',
      estDuration: '4m',

      datasetCard: {
        filename: 'customers.csv',
        rows: '1,247',
        columns: '9',
        department: 'Marketing Analytics',
        description: 'Raw CRM customer profiles containing contact info, geographical region, and sign-up timestamp.',
        difficulty: 'Beginner'
      },

      summary: {
        concepts: ['df.describe()', 'Descriptive statistics'],
        why: 'Describe summarizes means, ranges, mins, and maxes. You can immediately tell if columns have unreasonable ranges (like negative prices or ages).',
        next: 'Prepare to explore a new file independently in your week-one performance review.'
      },
      
      businessSituation: [
        "I have a meeting with Marketing in 5 minutes.",
        "They want to know the average customer age and if there are any weird outliers.",
        "Generate a quick statistical summary so I have some hard numbers to show them."
      ],
      
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n\n# Generate a statistical summary\n`,
      
      expectedConcepts: ['describe'],
      
      conversation: {
        memoryText: "You've successfully poked around the data. Now let's summarize it.",
        situation: [
          "I have a meeting with Marketing in 5 minutes.",
          "They want to know the average customer age and if there are any weird outliers.",
          "Generate a quick statistical summary so I have some hard numbers to show them."
        ],
        concept: {
          name: 'describe()',
          explanation: "`describe()` generates summary statistics for numerical columns: count, mean, min, max, standard deviation, and quartiles.",
          why: "It's the fastest way to spot obvious problems — like someone with an age of -5 or 250.",
        },
        task: "Give me a statistical summary of the dataset.",
        resultReaction: "Perfect. I can take this directly into the meeting.",
        resultExplanation: "Look at the `age` column. The min, max, and mean tell a complete story. If any of those numbers looked physically impossible, we'd immediately know we had a data quality issue to fix.",
      },
      
      hints: {
        workplaceThinking: "When a stakeholder asks for a quick overview of numerical data, always start with descriptive statistics.",
        conceptReminder: "Pandas has a built-in method that instantly computes count, mean, standard deviation, mins, and maxes.",
        technicalDirection: "Try: df.describe()",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDataFrame',
        config: {
          checkLoaded: true,
          checkDescribe: true,
          describeFeedback: "Generate a statistical summary of the dataset. Try df.describe()."
        }
      },
      
      rewards: {
        base: 50,
        bonus: 10,
        firstTry: 15,
        noHint: 10,
        challenge: 0,
        levelCompletion: 0
      },
      
      points: { base: 50, bonus: 10 },
      
      completionConditions: {},
      
      unlockRules: {
        requiresCompleted: ['1.5'],
      },
      
      nextMission: '1.7',
    },

    // ─── 1.7 First Week Performance Review (LEVEL CHALLENGE) ─────────────────────
    {
      id: '1.7',
      level: 'level-1',
      subLevel: '1.7',
      type: 'challenge',
      mentor: 'maya',
      title: 'Customer Count Mystery',
      subtitle: 'Investigate conflicting reports',
      learningObjective: 'Independently load, size-check, field-check, type-check, and summarize a new dataset',
      estDuration: '10m',

      datasetCard: {
        filename: 'sales_sample.csv',
        rows: '500',
        columns: '6',
        department: 'Sales & Operations',
        description: 'First week sales transactions sample containing transaction IDs, products, quantities, prices, and timestamps.',
        difficulty: 'Intermediate'
      },

      summary: {
        concepts: ['Exploratory Data Analysis (EDA)', 'Notebook inspection flow'],
        why: 'Applying your inspection stack (head, shape, columns, dtypes, describe) on raw files is the exact workflow of real data professionals.',
        next: 'Advance to Level 2 and join the Data Quality team!'
      },
      
      businessSituation: [
        "We have a problem.",
        "Finance says we had 480 paying customers this week.",
        "The CRM dashboard says we had 500. One of them is wrong.",
        "I dropped a new file in your workspace: `sales_sample.csv`.",
        "Don't guess. Investigate it using the tools you learned this week.",
      ],
      
      datasets: {
        'sales_sample.csv': {
          generator: 'customers', // uses same generator structure but generates sales data internally
          count: 500,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\n# Investigate the new file to find the truth\n`,
      
      expectedConcepts: ['read_csv', 'head', 'shape', 'columns', 'dtypes', 'describe'],
      
      conversation: {
        memoryText: "You've survived your first week. Now it's time for a real-world test.",
        situation: [
          "We have a problem.",
          "Finance says we had 480 paying customers this week.",
          "The CRM dashboard says we had 500. One of them is wrong.",
          "I dropped a new file in your workspace: `sales_sample.csv`.",
          "Don't guess. Investigate it using the tools you learned this week.",
        ],
        stateResponses: {
          'loaded': "You loaded the file. Excellent. What does it look like?",
          'checked-size': "Good, you found the row count. Does it match Finance or the CRM?",
          'checked-columns': "You see the fields. What kinds of data are we storing?",
          'checked-types': "Nice catch on the types. Anything stand out about the numbers?",
          'summarized': "Fantastic work.\n\nYou investigated an unfamiliar file from scratch without me holding your hand.\n\nYou're officially ready for the Data Quality team.",
        },
      },
      
      hints: {
        workplaceThinking: "When handed a mystery file, don't just stare at it. Run through your standard inspection checklist to see what you are working with.",
        conceptReminder: "Load it, check the size, look at the columns, verify the types, and run a summary.",
        technicalDirection: "You'll need pd.read_csv(), shape, columns, dtypes, and describe().",
      },
      
      validator: {
        type: 'multi-step',
        fn: 'validateMultiStage',
        config: {
          stages: [
            {
              state: 'loaded',
              type: 'variable_type',
              target: 'DataFrame',
              feedback: 'Start by loading the CSV file with pd.read_csv().'
            },
            {
              state: 'checked-size',
              type: 'regex_or_stdout',
              target: '\\(\\s*\\d+\\s*,\\s*\\d+\\s*\\)|shape|500',
              feedback: 'You loaded the data. What else do you need to know about this file?'
            },
            {
              state: 'checked-columns',
              type: 'regex_or_stdout',
              target: 'customer_id|columns|first_name|email|age|city|state|country|signup_date',
              feedback: 'You know the size. What about the column names?'
            },
            {
              state: 'checked-types',
              type: 'regex_or_stdout',
              target: 'int64|float64|object|dtype',
              feedback: 'You have the columns. What types did Pandas detect?'
            },
            {
              state: 'summarized',
              type: 'regex_or_stdout',
              target: 'mean',
              feedback: 'Types are checked. Can you get a statistical summary?'
            }
          ]
        },
        states: [
          { id: 'loaded', description: 'Loaded the CSV file' },
          { id: 'checked-size', description: 'Checked shape or row count' },
          { id: 'checked-columns', description: 'Inspected column names' },
          { id: 'checked-types', description: 'Checked data types' },
          { id: 'summarized', description: 'Generated a statistical summary' },
        ],
      },
      
      rewards: {
        base: 100,
        bonus: 50,
        firstTry: 20,
        noHint: 20,
        challenge: 50,
        levelCompletion: 100
      },
      
      points: { base: 100, bonus: 50 },
      
      completionConditions: {},
      
      unlockRules: {
        requiresCompleted: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'],
      },
      
      requires: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'], // legacy compatibility
      
      nextMission: null,
    },
  ],
};
