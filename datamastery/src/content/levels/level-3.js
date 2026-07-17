/**
 * Level 3: Targeted Campaigns
 */
export const level3 = {
  id: 'level-3',
  title: 'Targeted Campaigns',
  description: 'Master filtering, boolean indexing, and data selection to find exactly what you need.',
  mentor: 'maya',
  icon: '🎯',
  subLevels: [
    // ─── 3.1 Boolean Indexing ─────────────────────────────────────────
    {
      id: '3.1',
      level: 'level-3',
      subLevel: '3.1',
      type: 'guided',
      mentor: 'maya',
      title: 'Finding the High Spenders',
      subtitle: 'Basic Filtering',
      learningObjective: 'Learn to use boolean conditions to filter a DataFrame.',
      estDuration: '3m',
      datasetCard: {
        filename: 'sales.csv',
        rows: '2,500',
        columns: '6',
        department: 'Sales',
        description: 'Global sales transactions from the last quarter.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['Boolean Indexing', 'df[df[col] > val]'],
        why: 'You rarely need to look at an entire database at once. Filtering allows you to drill down into specific segments of interest.',
        next: 'Learn to combine multiple conditions.'
      },
      businessSituation: [
        "Great job on the Data Quality team. We've moved you over to Sales Analytics.",
        "The VP of Sales wants a list of all transactions where the 'amount' was greater than $500.",
        "We can use Pandas boolean indexing to filter the dataframe instantly."
      ],
      datasets: {
        'sales.csv': {
          generator: 'sales',
          count: 2500,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('sales.csv')\n\n# Filter for transactions greater than 500\nhigh_spenders = `,
      expectedConcepts: ['amount', '>', '500'],
      conversation: {
        situation: [
          "Create a boolean mask like this: `df['amount'] > 500`",
          "Then wrap that mask in brackets to filter the dataframe: `df[df['amount'] > 500]`"
        ],
        success: [
          "Nice. You just sliced a massive dataset down to the exact rows we care about.",
          "Boolean indexing is the bread and butter of Pandas."
        ],
        hints: [
          "Assign it: `high_spenders = df[df['amount'] > 500]`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 3.2 Multiple Conditions ─────────────────────────────────────
    {
      id: '3.2',
      level: 'level-3',
      subLevel: '3.2',
      type: 'guided',
      mentor: 'maya',
      title: 'Complex Targeting',
      subtitle: 'Combining Filters',
      learningObjective: 'Learn to use & (AND) and | (OR) to combine filtering conditions.',
      estDuration: '4m',
      datasetCard: {
        filename: 'sales.csv',
        rows: '2,500',
        columns: '6',
        department: 'Sales',
        description: 'Global sales transactions.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['Multiple conditions', '& (AND)', '| (OR)'],
        why: 'Real business questions are rarely simple. You often need to find data that satisfies multiple criteria simultaneously.',
        next: 'Learn to select specific rows and columns by position.'
      },
      businessSituation: [
        "The VP liked the list, but now she's being more specific.",
        "She wants high spenders (amount > 500) BUT only if the transaction occurred in the 'North America' region.",
        "We need to combine two conditions using the `&` operator."
      ],
      datasets: {
        'sales.csv': {
          generator: 'sales',
          count: 2500,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('sales.csv')\n\n# Filter for amount > 500 AND region == 'North America'\ntarget_sales = `,
      expectedConcepts: ['&', 'North America', 'amount'],
      conversation: {
        situation: [
          "When combining conditions in Pandas, you MUST wrap each condition in parentheses.",
          "Like this: `df[(condition1) & (condition2)]`"
        ],
        success: [
          "Spot on. You can chain as many conditions as you want this way.",
          "Just remember those parentheses, otherwise Python will get confused by operator precedence!"
        ],
        hints: [
          "The code is: `target_sales = df[(df['amount'] > 500) & (df['region'] == 'North America')]`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 3.3 loc and iloc ────────────────────────────────────────────
    {
      id: '3.3',
      level: 'level-3',
      subLevel: '3.3',
      type: 'guided',
      mentor: 'maya',
      title: 'Precision Slicing',
      subtitle: 'loc vs iloc',
      learningObjective: 'Learn to use .loc to filter rows and select specific columns simultaneously.',
      estDuration: '4m',
      datasetCard: {
        filename: 'sales.csv',
        rows: '2,500',
        columns: '6',
        department: 'Sales',
        description: 'Global sales transactions.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['.loc', '.iloc'],
        why: 'Filtering rows is great, but often you also want to drop irrelevant columns at the same time to save memory and reduce clutter.',
        next: 'Learn to filter against a list of values.'
      },
      businessSituation: [
        "When we send these reports to Sales, they don't want to see all the backend system columns.",
        "Let's get the same filtered list (North America, amount > 500), but this time, ONLY return the 'customer_id' and 'amount' columns.",
        "We can use `.loc[row_condition, column_list]` to do both at once."
      ],
      datasets: {
        'sales.csv': {
          generator: 'sales',
          count: 2500,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('sales.csv')\n\n# Filter rows and select only ['customer_id', 'amount']\nreport = `,
      expectedConcepts: ['loc', 'customer_id', 'amount'],
      conversation: {
        situation: [
          "The syntax for `.loc` is: `df.loc[rows, columns]`.",
          "Put your boolean mask in the `rows` spot, and a list of column strings in the `columns` spot."
        ],
        success: [
          "Excellent! `.loc` is extremely powerful because it lets you slice both dimensions of the matrix simultaneously."
        ],
        hints: [
          "Code: `report = df.loc[(df['amount'] > 500) & (df['region'] == 'North America'), ['customer_id', 'amount']]`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 3.4 Checking lists with .isin() ─────────────────────────────
    {
      id: '3.4',
      level: 'level-3',
      subLevel: '3.4',
      type: 'guided',
      mentor: 'maya',
      title: 'The VIP List',
      subtitle: 'Filtering with .isin()',
      learningObjective: 'Learn to use .isin() to filter against a list of acceptable values.',
      estDuration: '3m',
      datasetCard: {
        filename: 'sales.csv',
        rows: '2,500',
        columns: '6',
        department: 'Sales',
        description: 'Global sales transactions.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['.isin()'],
        why: 'Writing long chains of OR conditions (`|`) is tedious and error-prone. `.isin()` is much cleaner.',
        next: 'Put it all together in the VIP Sales Filter Challenge.'
      },
      businessSituation: [
        "Marketing wants to run a promo, but only in three specific regions: 'Europe', 'Asia', and 'Oceania'.",
        "Instead of writing `(df['region'] == 'Europe') | (df['region'] == 'Asia')...`, let's use a cleaner method.",
        "The `.isin()` method allows you to pass a list of valid values."
      ],
      datasets: {
        'sales.csv': {
          generator: 'sales',
          count: 2500,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('sales.csv')\n\ntarget_regions = ['Europe', 'Asia', 'Oceania']\n\n# Filter the dataframe for these regions\npromo_sales = `,
      expectedConcepts: ['isin', 'target_regions'],
      conversation: {
        situation: [
          "Use `df['region'].isin(target_regions)` as your boolean mask."
        ],
        success: [
          "Much cleaner, right?",
          "Always use `.isin()` when checking against more than two exact values."
        ],
        hints: [
          "Code: `promo_sales = df[df['region'].isin(target_regions)]`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 3.5 Challenge ───────────────────────────────────────────────
    {
      id: '3.5',
      level: 'level-3',
      subLevel: '3.5',
      type: 'challenge',
      mentor: 'maya',
      title: 'The VIP Sales Campaign',
      subtitle: 'Filtering Challenge',
      learningObjective: 'Combine multiple conditions, .isin(), and .loc in a single query.',
      estDuration: '10m',
      datasetCard: {
        filename: 'sales_q4.csv',
        rows: '5,000',
        columns: '7',
        department: 'Sales',
        description: 'Q4 Sales data including product categories and discounts.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['Advanced Filtering'],
        why: 'In the real world, data extraction requests are highly specific. You must be able to translate business logic into Pandas syntax flawlessly.',
        next: 'Proceed to Level 4 to learn Aggregation.'
      },
      businessSituation: [
        "The CMO just walked in with an urgent request.",
        "We are launching an emergency retention campaign. I need you to extract a very specific list of users.",
        "Requirements:",
        "1. They must have purchased 'Electronics' OR 'Software'.",
        "2. The transaction amount must be over $1000.",
        "3. They must NOT have used a discount (discount == 0).",
        "4. Return ONLY the 'customer_id' and 'email' columns."
      ],
      datasets: {
        'sales_q4.csv': {
          generator: 'sales',
          count: 5000,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('sales_q4.csv')\n\n# Build the VIP list according to the requirements\nvip_list = `,
      expectedConcepts: ['isin', '&', 'loc', 'amount', 'discount'],
      conversation: {
        situation: [
          "Take this one step at a time.",
          "Use `.isin()` for the categories, and `&` to combine the three conditions.",
          "Use `.loc` to restrict the final output to just the two requested columns."
        ],
        success: [
          "Flawless execution! You just saved the Q4 revenue targets.",
          "You've mastered Pandas filtering. Let's move on to Aggregation."
        ],
        hints: [
          "Category condition: `df['category'].isin(['Electronics', 'Software'])`",
          "Amount condition: `df['amount'] > 1000`",
          "Discount condition: `df['discount'] == 0`",
          "Wrap them all in `.loc[(cond1) & (cond2) & (cond3), ['customer_id', 'email']]`"
        ]
      },
      validator: { 
        fn: 'validateMultiStage',
        stages: [
          {
            name: "Category Filter",
            check: "all(c in ['Electronics', 'Software'] for c in df.loc[vip_list.index, 'category'])",
            feedback: "Some rows contain categories other than Electronics or Software."
          },
          {
            name: "Amount Filter",
            check: "all(vip_list.index.map(lambda i: df.loc[i, 'amount'] > 1000))",
            feedback: "Some transactions are not over $1000."
          },
          {
            name: "Discount Filter",
            check: "all(vip_list.index.map(lambda i: df.loc[i, 'discount'] == 0))",
            feedback: "Some transactions used a discount."
          },
          {
            name: "Column Selection",
            check: "list(vip_list.columns) == ['customer_id', 'email']",
            feedback: "You did not select exactly the 'customer_id' and 'email' columns."
          }
        ]
      }
    }
  ]
};
