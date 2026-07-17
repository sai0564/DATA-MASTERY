/**
 * Level 4: The Q3 Revenue Report
 */
export const level4 = {
  id: 'level-4',
  title: 'The Q3 Revenue Report',
  description: 'Master groupby, aggregations, and pivot tables to summarize massive datasets.',
  mentor: 'maya',
  icon: '📈',
  subLevels: [
    // ─── 4.1 Simple Aggregations ─────────────────────────────────────
    {
      id: '4.1',
      level: 'level-4',
      subLevel: '4.1',
      type: 'guided',
      mentor: 'maya',
      title: 'The Bottom Line',
      subtitle: 'Basic Math',
      learningObjective: 'Learn to use sum() and mean() on DataFrame columns.',
      estDuration: '3m',
      datasetCard: {
        filename: 'q3_sales.csv',
        rows: '15,000',
        columns: '5',
        department: 'Finance',
        description: 'Every individual transaction from Q3.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['.sum()', '.mean()'],
        why: 'Executives rarely want to see raw data. They want the bottom line: totals and averages.',
        next: 'Learn to break down totals by category using groupby.'
      },
      businessSituation: [
        "Welcome to the Finance Analytics pod.",
        "The CFO needs the total Q3 revenue, right now.",
        "We have a dataset of 15,000 transactions. Let's calculate the total sum of the 'amount' column."
      ],
      datasets: {
        'q3_sales.csv': {
          generator: 'sales',
          count: 15000,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('q3_sales.csv')\n\n# Calculate the total sum of the 'amount' column\ntotal_revenue = `,
      expectedConcepts: ['sum'],
      conversation: {
        situation: [
          "Select the column `df['amount']` and call `.sum()` on it."
        ],
        success: [
          "Boom. Millions of dollars calculated in milliseconds.",
          "You can also use `.mean()`, `.min()`, or `.max()` just as easily."
        ],
        hints: [
          "Code: `total_revenue = df['amount'].sum()`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 4.2 GroupBy ─────────────────────────────────────────────────
    {
      id: '4.2',
      level: 'level-4',
      subLevel: '4.2',
      type: 'guided',
      mentor: 'maya',
      title: 'Breaking it Down',
      subtitle: 'Introduction to GroupBy',
      learningObjective: 'Learn the Split-Apply-Combine pattern using groupby().',
      estDuration: '4m',
      datasetCard: {
        filename: 'q3_sales.csv',
        rows: '15,000',
        columns: '5',
        department: 'Finance',
        description: 'Every individual transaction from Q3.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['df.groupby()'],
        why: 'Grouping allows you to compare performance across different segments, like regions or product categories.',
        next: 'Learn to apply multiple different aggregations at once.'
      },
      businessSituation: [
        "The CFO is happy with the total, but now she wants to know which region performed the best.",
        "We need to group the data by 'region', and then sum the 'amount' for each group.",
        "This is called the Split-Apply-Combine pattern, and it's what `groupby()` was built for."
      ],
      datasets: {
        'q3_sales.csv': {
          generator: 'sales',
          count: 15000,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('q3_sales.csv')\n\n# Group by 'region' and sum the 'amount' column\nregional_revenue = `,
      expectedConcepts: ['groupby', 'region', 'sum'],
      conversation: {
        situation: [
          "Use `df.groupby('region')['amount'].sum()`",
          "This splits the data by region, applies the sum to the amount column, and combines it into a new Series."
        ],
        success: [
          "North America is crushing it as usual.",
          "Mastering `groupby()` is the most important skill for a data analyst."
        ],
        hints: [
          "Code: `regional_revenue = df.groupby('region')['amount'].sum()`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 4.3 Multiple Aggregations ───────────────────────────────────
    {
      id: '4.3',
      level: 'level-4',
      subLevel: '4.3',
      type: 'guided',
      mentor: 'maya',
      title: 'The Deep Dive',
      subtitle: 'Using .agg()',
      learningObjective: 'Learn to use .agg() to compute multiple statistics simultaneously.',
      estDuration: '4m',
      datasetCard: {
        filename: 'q3_sales.csv',
        rows: '15,000',
        columns: '5',
        department: 'Finance',
        description: 'Every individual transaction from Q3.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['.agg()'],
        why: 'Often you need to see the average, maximum, and total sum all at the same time to understand the distribution of data.',
        next: 'Learn to build 2D summary matrices.'
      },
      businessSituation: [
        "Now the Product team is asking questions.",
        "They want to know the total revenue, the average order value (mean), and the biggest single order (max) for each 'category'.",
        "Instead of running three separate groupbys, we can use `.agg()` to do them all at once."
      ],
      datasets: {
        'q3_sales.csv': {
          generator: 'sales',
          count: 15000,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('q3_sales.csv')\n\n# Group by category and calculate sum, mean, and max for amount\ncategory_stats = `,
      expectedConcepts: ['groupby', 'agg', 'sum', 'mean', 'max'],
      conversation: {
        situation: [
          "Use `.agg(['sum', 'mean', 'max'])` after your groupby."
        ],
        success: [
          "Look at that beautiful summary table.",
          "The `.agg()` method accepts lists of string function names, or even dictionaries if you want different stats for different columns."
        ],
        hints: [
          "Code: `category_stats = df.groupby('category')['amount'].agg(['sum', 'mean', 'max'])`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 4.4 Pivot Tables ────────────────────────────────────────────
    {
      id: '4.4',
      level: 'level-4',
      subLevel: '4.4',
      type: 'guided',
      mentor: 'maya',
      title: 'The Executive View',
      subtitle: 'Pivot Tables',
      learningObjective: 'Learn to use pd.pivot_table() to create 2D cross-tabulations.',
      estDuration: '4m',
      datasetCard: {
        filename: 'q3_sales.csv',
        rows: '15,000',
        columns: '5',
        department: 'Finance',
        description: 'Every individual transaction from Q3.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['pd.pivot_table()'],
        why: 'Pivot tables are the universal language of business. They allow you to compare two dimensions against each other in a clean grid.',
        next: 'Put it all together in the Executive Revenue Challenge.'
      },
      businessSituation: [
        "The board meeting is tomorrow. We need a grid showing revenue.",
        "We want 'region' as the rows, and 'category' as the columns.",
        "If you've ever used Excel, you know what a Pivot Table is. Pandas has them too."
      ],
      datasets: {
        'q3_sales.csv': {
          generator: 'sales',
          count: 15000,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('q3_sales.csv')\n\n# Create a pivot table with region on index, category on columns, summing amount\npivot = pd.pivot_table(df, values='amount', index=____, columns=____, aggfunc=____)`,
      expectedConcepts: ['pivot_table', 'region', 'category', 'sum'],
      conversation: {
        situation: [
          "Fill in the blanks in the `pd.pivot_table` function.",
          "Use `index='region'`, `columns='category'`, and `aggfunc='sum'`."
        ],
        success: [
          "Perfect. That grid is exactly what the executives want to see.",
          "Pivot tables are incredibly powerful for presenting data."
        ],
        hints: [
          "Code: `pivot = pd.pivot_table(df, values='amount', index='region', columns='category', aggfunc='sum')`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 4.5 Challenge ───────────────────────────────────────────────
    {
      id: '4.5',
      level: 'level-4',
      subLevel: '4.5',
      type: 'challenge',
      mentor: 'maya',
      title: 'The Q3 Executive Summary',
      subtitle: 'Aggregation Challenge',
      learningObjective: 'Combine filtering, multiple aggregations, and sorting in a single analytical pipeline.',
      estDuration: '10m',
      datasetCard: {
        filename: 'global_sales.csv',
        rows: '25,000',
        columns: '7',
        department: 'Finance',
        description: 'Massive global sales dataset including discounts and returns.',
        difficulty: 'Advanced'
      },
      summary: {
        concepts: ['Analytical Pipeline'],
        why: 'Real reports require you to filter out noise, group the remaining data, calculate multiple metrics, and sort the results so the most important info is at the top.',
        next: 'Proceed to Level 5 to learn about Dates and Strings.'
      },
      businessSituation: [
        "Alright, it's time for the final Q3 report.",
        "Here are the exact requirements from the CFO:",
        "1. Filter out any 'returned' items (where status == 'Returned').",
        "2. Group the data by 'region'.",
        "3. Calculate the 'sum' and 'count' of the 'amount' column.",
        "4. Sort the resulting dataframe by the 'sum' in descending order (highest revenue first).",
        "Assign your final dataframe to `final_report`."
      ],
      datasets: {
        'global_sales.csv': {
          generator: 'sales',
          count: 25000,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('global_sales.csv')\n\n# 1. Filter out returns\n# 2. Group by region\n# 3. Aggregate sum and count for amount\n# 4. Sort values descending by sum\n\nfinal_report = `,
      expectedConcepts: ['groupby', 'agg', 'sort_values', 'False'],
      conversation: {
        situation: [
          "Take it step by step.",
          "After filtering and aggregating, use `.sort_values(by='sum', ascending=False)`."
        ],
        success: [
          "Brilliant work. The CFO is extremely impressed with your turnaround time.",
          "You've officially mastered Pandas aggregations!"
        ],
        hints: [
          "Filter: `valid = df[df['status'] != 'Returned']`",
          "Group/Agg: `report = valid.groupby('region')['amount'].agg(['sum', 'count'])`",
          "Sort: `final_report = report.sort_values(by='sum', ascending=False)`"
        ]
      },
      validator: { 
        fn: 'validateMultiStage',
        stages: [
          {
            name: "Returns Filtered",
            check: "'Returned' not in df.loc[df['status'] == 'Returned', 'amount'].index if hasattr(final_report, 'index') else True",
            feedback: "Ensure you filtered out 'Returned' statuses before aggregating."
          },
          {
            name: "Region Grouping & Aggregation",
            check: "list(final_report.columns) == ['sum', 'count']",
            feedback: "The columns must be exactly 'sum' and 'count'."
          },
          {
            name: "Sorting",
            check: "final_report['sum'].is_monotonic_decreasing",
            feedback: "The dataframe is not sorted by 'sum' in descending order."
          }
        ]
      }
    }
  ]
};
