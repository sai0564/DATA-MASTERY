/**
 * Level 2: The Data Quality Team
 */
export const level2 = {
  id: 'level-2',
  title: 'The Data Quality Team',
  description: 'Clean, filter, and validate messy files. Address duplicates and missing values.',
  mentor: 'maya',
  icon: '🧹',
  subLevels: [
    // ─── 2.1 Missing Values ──────────────────────────────
    {
      id: '2.1',
      level: 'level-2',
      subLevel: '2.1',
      type: 'guided',
      mentor: 'maya',
      title: 'Identifying Missing Values',
      subtitle: 'Where is the data hiding?',
      learningObjective: 'Learn to use isna().sum() to find missing data in columns.',
      estDuration: '3m',
      datasetCard: {
        filename: 'leads.csv',
        rows: '850',
        columns: '6',
        department: 'Sales',
        description: 'New sales leads with some missing phone numbers, emails, and salaries.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['df.isna().sum()', 'df.info()'],
        why: 'In the real world, data is rarely perfect. Before running analysis, you must know what is missing.',
        next: 'Learn how to locate exactly which rows have the missing data.'
      },
      businessSituation: [
        "Welcome to the Data Quality team!",
        "Sales just sent us a batch of new leads. Their automated email tool is crashing when trying to process it.",
        "I bet some of these leads are missing email addresses, and possibly other fields.",
        "Let's count how many missing values exist in each column so we know what we're dealing with."
      ],
      datasets: {
        'leads.csv': {
          generator: 'customers',
          count: 850,
          injections: [
            { injector: 'missingValues', config: { columns: ['email'], rate: 0.15 } },
            { injector: 'missingValues', config: { columns: ['annual_salary'], rate: 0.05 } }
          ]
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('leads.csv')\n\n# Count the missing values in each column\n`,
      expectedConcepts: ['isna', 'sum'],
      conversation: {
        situation: [
          "Use `df.isna().sum()` to get a quick summary of missing data per column.",
          "This chains two methods: `isna()` returns True/False for every cell, and `sum()` counts the True values per column."
        ],
        success: [
          "Yikes. Looks like over 100 leads are missing emails.",
          "Good catch. Knowing the extent of the damage is half the battle."
        ],
        hints: [
          "Try chaining the `.isna()` method with `.sum()` on your DataFrame.",
          "The code should look exactly like: `df.isna().sum()`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 2.2 Detect Missing Data ───────────────────────────────────
    {
      id: '2.2',
      level: 'level-2',
      subLevel: '2.2',
      type: 'guided',
      mentor: 'maya',
      title: 'Detecting Missing Rows',
      subtitle: 'Isolating the problem',
      learningObjective: 'Learn to use boolean indexing to filter rows with missing data.',
      estDuration: '4m',
      datasetCard: {
        filename: 'leads.csv',
        rows: '850',
        columns: '6',
        department: 'Sales',
        description: 'New sales leads with some missing emails.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ["df[df['col'].isna()]"],
        why: 'Sometimes you need to inspect the broken rows manually to understand WHY they are broken. Are they all from the same city? The same date?',
        next: 'Learn how to fill missing data.'
      },
      businessSituation: [
        "Now we know there are missing emails, but Sales wants to see EXACTLY which leads are broken so they can call them.",
        "We need to filter the DataFrame to show only the rows where the 'email' column is NaN.",
        "We can use boolean indexing combined with `.isna()`."
      ],
      datasets: {
        'leads.csv': {
          generator: 'customers',
          count: 850,
          injections: [
            { injector: 'missingValues', config: { columns: ['email'], rate: 0.15 } }
          ]
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('leads.csv')\n\n# Filter the dataframe to show ONLY rows where email is missing\nbroken_leads = `,
      expectedConcepts: ['isna'],
      conversation: {
        situation: [
          "Create a condition `df['email'].isna()`",
          "Pass that condition into the brackets to filter the dataframe: `df[ df['email'].isna() ]`"
        ],
        success: [
          "Perfect. Now we can export that list and send it back to Sales.",
          "Being able to isolate broken data is just as important as fixing it."
        ],
        hints: [
          "Code: `broken_leads = df[df['email'].isna()]`"
        ]
      },
      validator: { fn: 'validateLevel2_2' }
    },

    // ─── 2.3 Fill Missing Data ────────────────────────────────
    {
      id: '2.3',
      level: 'level-2',
      subLevel: '2.3',
      type: 'guided',
      mentor: 'maya',
      title: 'Filling Missing Data',
      subtitle: 'Plugging the holes',
      learningObjective: 'Learn to use fillna() to replace missing values with defaults.',
      estDuration: '4m',
      datasetCard: {
        filename: 'leads.csv',
        rows: '850',
        columns: '6',
        department: 'Sales',
        description: 'Leads with missing annual salaries.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['df.fillna()'],
        why: 'Dropping data causes data loss. Often, it is better to provide a sensible default value for missing non-critical data.',
        next: 'Learn to remove unfixable data.'
      },
      businessSituation: [
        "What about the missing salaries?",
        "Unlike emails, we don't want to drop a lead just because we don't know their salary.",
        "Instead, let's fill the missing salaries with the average (median) salary of the dataset."
      ],
      datasets: {
        'leads.csv': {
          generator: 'customers',
          count: 850,
          injections: [
            { injector: 'missingValues', config: { columns: ['annual_salary'], rate: 0.10 } }
          ]
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('leads.csv')\n\n# Calculate the median salary\nmedian_salary = df['annual_salary'].median()\n\n# Fill missing annual_salary with the median\n`,
      expectedConcepts: ['fillna'],
      conversation: {
        situation: [
          "Target just the salary column using `df['annual_salary']`.",
          "Then chain `.fillna(median_salary)` to it, and assign it back to `df['annual_salary']`."
        ],
        success: [
          "Excellent! Now the Finance team can run their aggregations without errors.",
          "This is called 'imputation', and it's a standard practice in data science."
        ],
        hints: [
          "You need to overwrite the column: `df['annual_salary'] = df['annual_salary'].fillna(median_salary)`",
          "Alternatively, you can use `df['annual_salary'].fillna(median_salary, inplace=True)`."
        ]
      },
      validator: { fn: 'validateLevel2_3' }
    },

    // ─── 2.4 Remove Missing Data ───────────────────────────────────
    {
      id: '2.4',
      level: 'level-2',
      subLevel: '2.4',
      type: 'guided',
      mentor: 'maya',
      title: 'Removing Missing Data',
      subtitle: 'Trimming the fat',
      learningObjective: 'Learn to use dropna() to remove incomplete records.',
      estDuration: '3m',
      datasetCard: {
        filename: 'leads.csv',
        rows: '850',
        columns: '6',
        department: 'Sales',
        description: 'New sales leads with missing emails.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['df.dropna()'],
        why: 'Sometimes data without a primary key (like an email) is useless and must be discarded.',
        next: 'Learn to handle duplicate records.'
      },
      businessSituation: [
        "Now for the missing emails.",
        "For an email marketing campaign, a lead without an email is totally useless.",
        "Let's drop any row that has a missing value in the 'email' column using `dropna()`."
      ],
      datasets: {
        'leads.csv': {
          generator: 'customers',
          count: 850,
          injections: [
            { injector: 'missingValues', config: { columns: ['email'], rate: 0.15 } }
          ]
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('leads.csv')\n\n# Drop rows where 'email' is missing\n# Hint: use subset=['email']\nclean_df = `,
      expectedConcepts: ['dropna'],
      conversation: {
        situation: [
          "Use the `dropna()` method.",
          "You can specify exactly which columns to check by passing `subset=['email']`."
        ],
        success: [
          "Perfect. The useless leads are gone.",
          "It's generally safe to drop data when it lacks the exact identifier you need."
        ],
        hints: [
          "Assign the result to `clean_df`.",
          "Use `clean_df = df.dropna(subset=['email'])`."
        ]
      },
      validator: { fn: 'validateLevel2_4' }
    },

    // ─── 2.5 Duplicate Records ─────────────────────────────────────
    {
      id: '2.5',
      level: 'level-2',
      subLevel: '2.5',
      type: 'guided',
      mentor: 'maya',
      title: 'Duplicate Records',
      subtitle: 'Seeing double',
      learningObjective: 'Learn to use drop_duplicates() to clean repeated records.',
      estDuration: '3m',
      datasetCard: {
        filename: 'leads.csv',
        rows: '850',
        columns: '6',
        department: 'Sales',
        description: 'Leads that were accidentally imported twice.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['df.drop_duplicates()'],
        why: 'System glitches or human error often result in duplicate data, which skews analytics and leads to spamming customers.',
        next: 'Learn to fix incorrect data types.'
      },
      businessSituation: [
        "Oh no. The Sales intern accidentally ran the import script twice.",
        "We now have exact duplicate rows in our dataset. If we leave them, we'll email people twice and annoy them.",
        "Let's clean this up."
      ],
      datasets: {
        'leads.csv': {
          generator: 'customers',
          count: 800,
          injections: [
            { injector: 'duplicates', config: { rate: 0.20 } }
          ]
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('leads.csv')\n\n# Drop exact duplicate rows\nclean_df = `,
      expectedConcepts: ['drop_duplicates'],
      conversation: {
        situation: [
          "Use the `drop_duplicates()` method.",
          "By default, this removes rows where all column values are identical to another row."
        ],
        success: [
          "Phew, crisis averted.",
          "I run `drop_duplicates()` on almost every raw file I receive. It's a good habit."
        ],
        hints: [
          "Assign the result to `clean_df`.",
          "Use `clean_df = df.drop_duplicates()`."
        ]
      },
      validator: { fn: 'validateLevel2_5' }
    },

    // ─── 2.6 Data Types ────────────────────────────────────────────
    {
      id: '2.6',
      level: 'level-2',
      subLevel: '2.6',
      type: 'guided',
      mentor: 'maya',
      title: 'Fixing Data Types',
      subtitle: 'Text vs Numbers',
      learningObjective: 'Learn to use astype() to convert column data types.',
      estDuration: '4m',
      datasetCard: {
        filename: 'products.csv',
        rows: '150',
        columns: '4',
        department: 'Inventory',
        description: 'Product catalog where prices were imported as strings.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['df.astype()', 'Data types'],
        why: 'You cannot perform mathematical operations (like finding the average price) if numbers are stored as text.',
        next: 'Put it all together in the Data Quality Challenge.'
      },
      businessSituation: [
        "Inventory sent over a product list, but they exported it weirdly.",
        "The 'price' column is showing up as text (object) instead of a number (float), because some rows had quotes around them.",
        "We need to cast 'price' to a float so we can do math on it later."
      ],
      datasets: {
        'products.csv': {
          generator: 'products',
          count: 150,
          injections: [
            { injector: 'wrongDataTypes', config: { columns: ['price'], targetType: 'string' } }
          ]
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('products.csv')\n\n# Convert the 'price' column to float\n`,
      expectedConcepts: ['astype'],
      conversation: {
        situation: [
          "Use `df['price'].astype(float)` to convert the column."
        ],
        success: [
          "Nice work.",
          "Data types are the silent killers in analytics. Always check your `dtypes`!"
        ],
        hints: [
          "Overwrite the column: `df['price'] = df['price'].astype(float)`"
        ]
      },
      validator: { fn: 'validateLevel2_6' }
    },

    // ─── 2.7 Challenge ───────────────────────────────────────────────
    {
      id: '2.7',
      level: 'level-2',
      subLevel: '2.7',
      type: 'challenge',
      mentor: 'maya',
      title: 'The Messy CRM Export',
      subtitle: 'Data Quality Challenge',
      learningObjective: 'Combine dropna, fillna, drop_duplicates, and astype in a single pipeline.',
      estDuration: '10m',
      datasetCard: {
        filename: 'crm_dump.csv',
        rows: '1,500',
        columns: '6',
        department: 'All',
        description: 'A completely raw, chaotic dump from the legacy CRM system.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['Data Cleaning Pipeline'],
        why: 'Real-world data cleaning rarely involves just one step. Analysts must chain multiple cleaning operations to produce a usable dataset.',
        next: 'Proceed to Level 3 to learn Filtering and Selection.'
      },
      businessSituation: [
        "Alright, it's time to prove you belong on the Data Quality team.",
        "I've got a raw export from our legacy CRM. It's a disaster.",
        "Requirements:",
        "1. Drop all exact duplicates.",
        "2. Drop any row missing an 'email'.",
        "3. Fill any missing 'city' values with the text 'Unknown'.",
        "4. Convert 'age' to a float.",
        "Save your final, fully cleaned dataframe as `final_df`."
      ],
      datasets: {
        'crm_dump.csv': {
          generator: 'customers',
          count: 1500,
          injections: [
            { injector: 'duplicates', config: { rate: 0.15 } },
            { injector: 'missingValues', config: { columns: ['email'], rate: 0.10 } },
            { injector: 'missingValues', config: { columns: ['city'], rate: 0.10, value: ' ' } }, // simulating blank strings
            { injector: 'wrongDataTypes', config: { columns: ['age'], targetType: 'string' } }
          ]
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('crm_dump.csv')\n\n# Clean the dataframe according to the requirements\n# Make sure the result is in final_df\n\nfinal_df = df.copy()`,
      expectedConcepts: ['drop_duplicates', 'dropna', 'fillna', 'astype'],
      conversation: {
        situation: [
          "This is your final test for Level 2.",
          "I'm not giving you explicit commands. Remember what you learned!"
        ],
        success: [
          "Outstanding work!",
          "You took a completely broken dataset and made it analytics-ready.",
          "You've officially passed your Data Quality training."
        ],
        hints: [
          "Step 1: final_df = final_df.drop_duplicates()",
          "Step 2: final_df = final_df.dropna(subset=['email'])",
          "Step 3: Since 'city' might be a blank string ' ', use replace(' ', pd.NA) then fillna, or just run final_df.loc[final_df['city'] == ' ', 'city'] = 'Unknown'",
          "Step 4: final_df['age'] = final_df['age'].astype(float)"
        ]
      },
      validator: { fn: 'validateLevel2_7' }
    }
  ]
};
