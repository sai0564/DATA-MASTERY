/**
 * Level 1: First Week at NovaMetrics
 *
 * Mentor: Maya — Senior Data Analyst
 * Dataset: customers.csv
 * Focus: DataFrame inspection fundamentals
 *
 * 6 guided sub-levels + 1 level challenge = 7 total
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
      title: 'Your First Dataset',
      type: 'guided',
      mentor: 'maya',

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

      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },

      starterCode: `import pandas as pd

# Load the customer data
df = pd.read_csv('customers.csv')

# Show the first few rows
`,

      hints: {
        taskReminder: "Maya asked you to load the file and show the first few records.",
        conceptReminder: "Use pd.read_csv() to load the file, then head() to preview it.",
        syntaxClue: "Try: df.head()",
      },

      skills: {
        introduces: ['read_csv', 'DataFrame', 'head'],
        reuses: [],
      },

      validation: {
        type: 'semantic',
        fn: 'validateHead',
      },

      points: { base: 50, bonus: 10 },
      estimatedMinutes: 3,
    },

    // ─── 1.2 How Big Is This File? ────────────────────────────────────
    {
      id: '1.2',
      title: 'How Big Is This File?',
      type: 'guided',
      mentor: 'maya',

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

      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },

      starterCode: `import pandas as pd

df = pd.read_csv('customers.csv')

# Check the size of this dataset
`,

      hints: {
        taskReminder: "Maya needs to know the number of rows and columns.",
        conceptReminder: "shape gives you (rows, columns) as a tuple.",
        syntaxClue: "Try: df.shape",
      },

      skills: {
        introduces: ['shape'],
        reuses: ['read_csv'],
      },

      validation: {
        type: 'semantic',
        fn: 'validateShape',
      },

      points: { base: 50, bonus: 10 },
      estimatedMinutes: 2,
    },

    // ─── 1.3 What Fields Are We Tracking? ─────────────────────────────
    {
      id: '1.3',
      title: 'What Fields Are We Tracking?',
      type: 'guided',
      mentor: 'maya',

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

      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },

      starterCode: `import pandas as pd

df = pd.read_csv('customers.csv')

# Show the column names
`,

      hints: {
        taskReminder: "Maya wants to see what columns exist in the dataset.",
        conceptReminder: "columns gives you the list of field names.",
        syntaxClue: "Try: df.columns",
      },

      skills: {
        introduces: ['columns'],
        reuses: ['read_csv'],
      },

      validation: {
        type: 'semantic',
        fn: 'validateColumns',
      },

      points: { base: 50, bonus: 10 },
      estimatedMinutes: 2,
    },

    // ─── 1.4 What Types Did Pandas Detect? ────────────────────────────
    {
      id: '1.4',
      title: 'What Types Did Pandas Detect?',
      type: 'guided',
      mentor: 'maya',

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

      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },

      starterCode: `import pandas as pd

df = pd.read_csv('customers.csv')

# Check the data types
`,

      hints: {
        taskReminder: "Maya wants to see the data type of each column.",
        conceptReminder: "dtypes shows column names and their types. info() gives a broader summary.",
        syntaxClue: "Try: df.dtypes",
      },

      skills: {
        introduces: ['dtypes', 'info'],
        reuses: ['read_csv'],
      },

      validation: {
        type: 'semantic',
        fn: 'validateDtypes',
      },

      points: { base: 50, bonus: 10 },
      estimatedMinutes: 2,
    },

    // ─── 1.5 Don't Only Look at the Top ──────────────────────────────
    {
      id: '1.5',
      title: "Don't Only Look at the Top",
      type: 'guided',
      mentor: 'maya',

      conversation: {
        situation: [
          "Here's something I learned the hard way.",
          "The first few rows might look clean, but the bottom or middle of the file could be completely different.",
          "Always check more than just the top.",
        ],
        concept: {
          name: 'tail() and sample()',
          explanation: "`tail()` shows the last rows — useful for checking recent imports. `sample()` picks random rows, giving you a broader view of the data.",
          why: "If new data was appended to the file, the bottom rows may have different formatting or quality issues.",
        },
        task: "Show me the last few rows, then a random sample of 5 rows.",
        resultReaction: "See? The bottom of the file can look quite different.",
        resultExplanation: "By checking the top, bottom, and random samples, you get a much better sense of the real data. This is a habit worth building early.",
      },

      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },

      starterCode: `import pandas as pd

df = pd.read_csv('customers.csv')

# Show the last few rows

# Show a random sample of 5 rows
`,

      hints: {
        taskReminder: "Maya wants to see the last rows and a random sample.",
        conceptReminder: "tail() shows the bottom, sample() picks random rows.",
        syntaxClue: "Try: df.tail() and then df.sample(5)",
      },

      skills: {
        introduces: ['tail', 'sample'],
        reuses: ['read_csv'],
      },

      validation: {
        type: 'semantic',
        fn: 'validateTailSample',
      },

      points: { base: 50, bonus: 10 },
      estimatedMinutes: 3,
    },

    // ─── 1.6 Give Me the Quick Picture ────────────────────────────────
    {
      id: '1.6',
      title: 'Give Me the Quick Picture',
      type: 'guided',
      mentor: 'maya',

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

      datasets: {
        'customers.csv': {
          generator: 'customers',
          count: 1247,
          injections: [],
        },
      },

      starterCode: `import pandas as pd

df = pd.read_csv('customers.csv')

# Generate a statistical summary
`,

      hints: {
        taskReminder: "Maya needs a statistical summary for the meeting.",
        conceptReminder: "describe() gives count, mean, std, min, 25%, 50%, 75%, max.",
        syntaxClue: "Try: df.describe()",
      },

      skills: {
        introduces: ['describe'],
        reuses: ['read_csv'],
      },

      validation: {
        type: 'semantic',
        fn: 'validateDescribe',
      },

      points: { base: 50, bonus: 10 },
      estimatedMinutes: 2,
    },

    // ─── 1.7 First Week Review (LEVEL CHALLENGE) ─────────────────────
    {
      id: '1.7',
      title: 'First Week Review',
      type: 'challenge',
      mentor: 'maya',

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
          'summarized': "Nice work. You didn't need me to tell you what to check.\n\nThat's a solid first week.",
        },
      },

      datasets: {
        'sales_sample.csv': {
          generator: 'customers', // Reuses customer generator for now — will be sales in later phases
          count: 500,
          injections: [],
        },
      },

      starterCode: `import pandas as pd

# A new file has arrived — investigate it
`,

      hints: {
        workplaceThinking: "If someone hands you an unfamiliar data file, what would you want to know first?",
        analyticalDirection: "Start with the basics: how big is it, what columns does it have, what types are the columns.",
        methodClue: "This week you learned: head(), shape, columns, dtypes, tail(), sample(), describe(). Which ones help here?",
      },

      skills: {
        introduces: [],
        reuses: ['read_csv', 'head', 'shape', 'columns', 'dtypes', 'tail', 'sample', 'describe'],
      },

      validation: {
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

      points: { base: 100, bonus: 50 },
      estimatedMinutes: 8,

      requires: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'],
    },
  ],
};
