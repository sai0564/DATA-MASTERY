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

      // Business situation introduction messages
      businessSituation: [
        "Morning! Welcome to the analytics team. 👋",
        "I'm Maya — I'll be walking you through your first few tasks.",
        "Marketing just sent us a customer export.",
        "Before we do anything with it, I want you to see what the data looks like.",
      ],
      
      // Seeded datasets definition
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
          "Marketing just sent us a customer export.",
          "Before we do anything with it, I want you to see what the data looks like.",
        ],
        concept: {
          name: 'head()',
          explanation: "In Pandas, we load CSV files with `pd.read_csv()` and preview the first rows with `head()`.",
          why: "It gives us a quick look at the data without printing thousands of rows.",
        },
        task: "Load the customer file and show me the first few records.",
        resultReaction: "There we go — our first customer records.",
        resultExplanation: "Each row is one customer. You can see their ID, name, email, location, and when they signed up. That's the shape of this dataset.",
      },
      
      hints: {
        taskReminder: "Maya asked you to load the file and show the first few records.",
        conceptReminder: "Use pd.read_csv() to load the file, then head() to preview it.",
        syntaxClue: "Try: df.head()",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateHead',
      },
      
      rewards: {
        basePoints: 50,
        bonusPoints: 10,
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
        "Good — you've seen the first few rows.",
        "Now I need to know the size of this dataset.",
        "Marketing says we have around 1,200 customers. Let's check.",
      ],
      
      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n\n# Check the size of this dataset\n`,
      
      expectedConcepts: ['shape'],
      
      conversation: {
        situation: [
          "Good — you've seen the first few rows.",
          "Now I need to know the size of this dataset.",
          "Marketing says we have around 1,200 customers. Let's check.",
        ],
        concept: {
          name: 'shape',
          explanation: "`shape` tells you how many rows and columns a DataFrame has. It returns a pair like `(1247, 9)`.",
          why: "Before you start any analysis, you need to know how much data you're working with.",
        },
        task: "Tell me how many rows and columns this dataset has.",
        resultReaction: "{{shape_0}} rows and {{shape_1}} columns.",
        resultExplanation: "So we have {{shape_0}} customer records, each with {{shape_1}} fields. That matches roughly what Marketing told us.",
      },
      
      hints: {
        taskReminder: "Maya needs to know the number of rows and columns.",
        conceptReminder: "shape gives you (rows, columns) as a tuple.",
        syntaxClue: "Try: df.shape",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateShape',
      },
      
      rewards: {
        basePoints: 50,
        bonusPoints: 10,
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
        "We know how many rows we have.",
        "Now I want to see what information we're actually tracking about each customer.",
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
        situation: [
          "We know how many rows we have.",
          "Now I want to see what information we're actually tracking about each customer.",
        ],
        concept: {
          name: 'columns',
          explanation: "`columns` gives you the list of column names in the DataFrame.",
          why: "You need to know what fields exist before you can start filtering or analyzing.",
        },
        task: "Show me the column names in this dataset.",
        resultReaction: "Right — those are our fields.",
        resultExplanation: "We're tracking customer IDs, names, emails, age, location, and signup dates. That's a standard customer profile.",
      },
      
      hints: {
        taskReminder: "Maya wants to see what columns exist in the dataset.",
        conceptReminder: "columns gives you the list of field names.",
        syntaxClue: "Try: df.columns",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateColumns',
      },
      
      rewards: {
        basePoints: 50,
        bonusPoints: 10,
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
        "One thing I always check early — the data types.",
        "Sometimes dates arrive as text, or numbers get loaded as strings.",
        "That causes problems later if you don't catch it now.",
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
        situation: [
          "One thing I always check early — the data types.",
          "Sometimes dates arrive as text, or numbers get loaded as strings.",
          "That causes problems later if you don't catch it now.",
        ],
        concept: {
          name: 'dtypes',
          explanation: "`dtypes` shows you the data type Pandas assigned to each column. You can also use `info()` for a fuller summary.",
          why: "If Pandas loaded a date column as a string, your time-based analysis won't work until you fix it.",
        },
        task: "Check the data types of each column.",
        resultReaction: "Good. Take a look at those types.",
        resultExplanation: "Numbers show as `int64` or `float64`, text as `object`. Notice that `signup_date` is loaded as `object` — that means Pandas treated it as text, not a proper date. We'll fix that later.",
      },
      
      hints: {
        taskReminder: "Maya wants to see the data type of each column.",
        conceptReminder: "dtypes shows column names and their types. info() gives a broader summary.",
        syntaxClue: "Try: df.dtypes",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDtypes',
      },
      
      rewards: {
        basePoints: 50,
        bonusPoints: 10,
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
        "Here's something I learned the hard way.",
        "The first few rows might look clean, but the bottom or middle of the file could be completely different.",
        "Always check more than just the top.",
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
        situation: [
          "Here's something I learned the hard way.",
          "The first few rows might look clean, but the bottom or middle of the file could be completely different.",
          "Always check more than just the top.",
        ],
        concept: {
          name: 'sample()',
          explanation: "`sample(n)` picks random rows from your DataFrame. For example, `df.sample(5)` will return 5 random rows.",
          why: "Checking random samples is the best way to get an unbiased view of your dataset's layout and content quality.",
        },
        task: "Show me a random sample of 5 rows from the dataset.",
        resultReaction: "Great job — a random sample gives you a good cross-section.",
        resultExplanation: "By inspecting random samples, you can catch outliers or anomalies that don't show up in the top rows.",
      },
      
      hints: {
        taskReminder: "Maya wants to see a random sample of 5 rows.",
        conceptReminder: "sample() picks random rows. You can pass the number of rows as an argument.",
        syntaxClue: "Try: df.sample(5)",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateSample',
      },
      
      rewards: {
        basePoints: 50,
        bonusPoints: 10,
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
        "I'm about to go into a meeting.",
        "I need a quick statistical summary of the customer file — averages, ranges, that kind of thing.",
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
        situation: [
          "I'm about to go into a meeting.",
          "I need a quick statistical summary of the customer file — averages, ranges, that kind of thing.",
        ],
        concept: {
          name: 'describe()',
          explanation: "`describe()` generates summary statistics for all numerical columns: count, mean, min, max, standard deviation, and quartiles.",
          why: "It's the fastest way to spot obvious problems — like ages below 0 or above 200.",
        },
        task: "Give me a statistical summary of the dataset.",
        resultReaction: "Perfect — I can take this into the meeting.",
        resultExplanation: "Look at the age column — the min, max, and mean tell you a lot about your customers. If any of those numbers look wrong, that's a sign of data quality issues. We'll dig into that next week.",
      },
      
      hints: {
        taskReminder: "Maya needs a statistical summary for the meeting.",
        conceptReminder: "describe() gives count, mean, std, min, 25%, 50%, 75%, max.",
        syntaxClue: "Try: df.describe()",
      },
      
      validator: {
        type: 'semantic',
        fn: 'validateDescribe',
      },
      
      rewards: {
        basePoints: 50,
        bonusPoints: 10,
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
      title: 'First Week Performance Review',
      subtitle: 'Explore an unfamiliar dataset independently',
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
        "New file just came in.",
        "This is a sales export — different from the customer data.",
        "📎 sales_sample.csv",
        "Take a look before you touch anything.",
        "Tell me what we're working with.",
      ],
      
      datasets: {
        'sales_sample.csv': {
          generator: 'customers', // uses same generator structure but generates sales data internally
          count: 500,
          injections: [],
        },
      },
      
      starterCode: `import pandas as pd\n\n# A new file has arrived — investigate it\n`,
      
      expectedConcepts: ['read_csv', 'head', 'shape', 'columns', 'dtypes', 'tail', 'sample', 'describe'],
      
      conversation: {
        situation: [
          "New file just came in.",
          "This is a sales export — different from the customer data.",
          "📎 sales_sample.csv",
          "Take a look before you touch anything.",
          "Tell me what we're working with.",
        ],
        stateResponses: {
          'loaded': "Good, you loaded it. What can you tell me about it?",
          'checked-size': "Right. Now what kind of data are we looking at?",
          'checked-columns': "Good — you know the fields. What types did Pandas assign?",
          'checked-types': "Any first impressions from the numbers?",
          'summarized': "You've survived your first week at NovaMetrics.\n\nYou now inspect unfamiliar data like an analyst instead of guessing.\n\nTomorrow you'll join the Data Quality team.",
        },
      },
      
      hints: {
        workplaceThinking: "If someone hands you an unfamiliar data file, what would you want to know first?",
        analyticalDirection: "Start with the basics: how big is it, what columns does it have, what types are the columns.",
        methodClue: "This week you learned: head(), shape, columns, dtypes, tail(), sample(), describe(). Which ones help here?",
      },
      
      validator: {
        type: 'multi-step',
        fn: 'validateFirstWeekChallenge',
        states: [
          { id: 'loaded', description: 'Loaded the CSV file' },
          { id: 'checked-size', description: 'Checked shape or row count' },
          { id: 'checked-columns', description: 'Inspected column names' },
          { id: 'checked-types', description: 'Checked data types' },
          { id: 'summarized', description: 'Generated a statistical summary' },
        ],
      },
      
      rewards: {
        basePoints: 100,
        bonusPoints: 50,
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
