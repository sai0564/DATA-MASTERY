/**
 * Level 5: Operations Logistics
 */
export const level5 = {
  id: 'level-5',
  title: 'Operations Logistics',
  description: 'Master dates, strings, and reshaping to untangle complex operational data.',
  mentor: 'maya',
  icon: '🕰️',
  subLevels: [
    // ─── 5.1 Datetime Conversion ─────────────────────────────────────
    {
      id: '5.1',
      level: 'level-5',
      subLevel: '5.1',
      type: 'guided',
      mentor: 'maya',
      title: 'Time is Money',
      subtitle: 'Converting Strings to Dates',
      learningObjective: 'Learn to use pd.to_datetime() to convert text to true dates.',
      estDuration: '3m',
      datasetCard: {
        filename: 'shipping.csv',
        rows: '4,200',
        columns: '5',
        department: 'Logistics',
        description: 'Shipping logs with dates imported as raw text.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['pd.to_datetime()'],
        why: 'If dates are loaded as strings, you cannot sort them chronologically or calculate durations.',
        next: 'Learn to extract months and years from datetime objects.'
      },
      businessSituation: [
        "Welcome to the Logistics department.",
        "We're tracking global shipments, but the 'ship_date' column imported as raw text.",
        "We need to convert it into a true Pandas datetime object so we can actually use it."
      ],
      datasets: {
        'shipping.csv': {
          generator: 'sales', // reuse sales for tracking
          count: 4200,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('shipping.csv')\n\n# Convert 'ship_date' to datetime\n`,
      expectedConcepts: ['to_datetime', 'ship_date'],
      conversation: {
        situation: [
          "Use the `pd.to_datetime()` function and pass it the column you want to convert.",
          "Don't forget to overwrite the original column!"
        ],
        success: [
          "Nice! The data type is now `datetime64[ns]`.",
          "Now Pandas knows exactly what year, month, and day each transaction happened on."
        ],
        hints: [
          "Code: `df['ship_date'] = pd.to_datetime(df['ship_date'])`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 5.2 The .dt accessor ────────────────────────────────────────
    {
      id: '5.2',
      level: 'level-5',
      subLevel: '5.2',
      type: 'guided',
      mentor: 'maya',
      title: 'Extracting Months',
      subtitle: 'The .dt Accessor',
      learningObjective: 'Learn to use the .dt accessor to extract parts of a date.',
      estDuration: '3m',
      datasetCard: {
        filename: 'shipping.csv',
        rows: '4,200',
        columns: '5',
        department: 'Logistics',
        description: 'Shipping logs with datetime columns.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['.dt.month', '.dt.year'],
        why: 'Often you want to group your data by month or year to see seasonality. You must extract these components first.',
        next: 'Learn to manipulate string data.'
      },
      businessSituation: [
        "Now that 'ship_date' is a real datetime object, Logistics wants a monthly breakdown.",
        "To group by month, we first need to extract the month into a new column.",
        "We can use the special `.dt` accessor to reach inside the datetime object."
      ],
      datasets: {
        'shipping.csv': {
          generator: 'sales',
          count: 4200,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('shipping.csv')\ndf['ship_date'] = pd.to_datetime(df['ship_date'])\n\n# Create a new column called 'ship_month' using .dt.month\n`,
      expectedConcepts: ['dt', 'month'],
      conversation: {
        situation: [
          "Access the `.dt.month` property on the datetime column.",
          "Assign it to a new column like this: `df['ship_month'] = ...`"
        ],
        success: [
          "Perfect. Now we can easily run a groupby on the 'ship_month' column to see seasonality!"
        ],
        hints: [
          "Code: `df['ship_month'] = df['ship_date'].dt.month`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 5.3 String Manipulation ─────────────────────────────────────
    {
      id: '5.3',
      level: 'level-5',
      subLevel: '5.3',
      type: 'guided',
      mentor: 'maya',
      title: 'Cleaning Tracking IDs',
      subtitle: 'The .str Accessor',
      learningObjective: 'Learn to use the .str accessor to manipulate text.',
      estDuration: '4m',
      datasetCard: {
        filename: 'tracking.csv',
        rows: '4,200',
        columns: '5',
        department: 'Logistics',
        description: 'Tracking numbers with messy capitalization and whitespace.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['.str.upper()', '.str.replace()'],
        why: 'Human-entered text is messy. You must standardize capitalization and remove invisible whitespace before joining or grouping text.',
        next: 'Learn to reshape wide data into long data.'
      },
      businessSituation: [
        "The warehouse workers enter tracking IDs manually. It's a mess.",
        "Some are lowercase, some have weird dashes. We need them all to be uppercase and have the dashes removed.",
        "Just like `.dt` for dates, Pandas has a `.str` accessor for text."
      ],
      datasets: {
        'tracking.csv': {
          generator: 'sales',
          count: 4200,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('tracking.csv')\n\n# 1. Convert 'tracking_id' to uppercase\n# 2. Replace '-' with '' (empty string)\n`,
      expectedConcepts: ['str', 'upper', 'replace'],
      conversation: {
        situation: [
          "First, use `df['tracking_id'].str.upper()`.",
          "Then, chain another `.str.replace('-', '')` to remove the dashes."
        ],
        success: [
          "Beautiful. Standardizing strings is the only way to ensure `groupby` and merges work correctly down the line."
        ],
        hints: [
          "Code: `df['tracking_id'] = df['tracking_id'].str.upper().str.replace('-', '')`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 5.4 Melting Data ────────────────────────────────────────────
    {
      id: '5.4',
      level: 'level-5',
      subLevel: '5.4',
      type: 'guided',
      mentor: 'maya',
      title: 'Reshaping the Grid',
      subtitle: 'Using pd.melt()',
      learningObjective: 'Learn to use melt() to unpivot wide data into long format.',
      estDuration: '5m',
      datasetCard: {
        filename: 'warehouse_capacity.csv',
        rows: '50',
        columns: '13',
        department: 'Logistics',
        description: 'A wide table showing warehouse capacity for each month across 12 columns.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['pd.melt()'],
        why: 'Many reporting tools produce "wide" data (months as columns). To graph or analyze this data, it must be reshaped into "long" data (one row per month).',
        next: 'Put it all together in the International Shipping Challenge.'
      },
      businessSituation: [
        "The Warehouse Manager sent us a spreadsheet where each month is a separate column.",
        "This is 'wide' format, which is great for humans to read, but terrible for Pandas to analyze.",
        "We need to 'unpivot' or 'melt' this data so that we have a 'Month' column and a 'Capacity' column."
      ],
      datasets: {
        'warehouse_capacity.csv': {
          generator: 'sales',
          count: 50,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('warehouse_capacity.csv')\n\n# Melt the dataframe\nlong_df = `,
      expectedConcepts: ['melt', 'id_vars', 'var_name', 'value_name'],
      conversation: {
        situation: [
          "Call `pd.melt()` to reshape the dataframe.",
          "You must specify `id_vars` (the column(s) to keep untouched), `var_name` (the new column for months), and `value_name` (the new column for capacities)."
        ],
        success: [
          "Look at that. You just turned a 13-column mess into a clean, 3-column, machine-readable dataset.",
          "Melting is tricky to wrap your head around, but incredibly useful."
        ],
        hints: [
          "Try: `long_df = pd.melt(df, id_vars=['warehouse_id'], var_name='Month', value_name='Capacity')`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 5.5 Challenge ───────────────────────────────────────────────
    {
      id: '5.5',
      level: 'level-5',
      subLevel: '5.5',
      type: 'challenge',
      mentor: 'maya',
      title: 'The International Shipping Log',
      subtitle: 'Logistics Challenge',
      learningObjective: 'Combine datetime conversion, string manipulation, and reshaping.',
      estDuration: '10m',
      datasetCard: {
        filename: 'intl_shipping.csv',
        rows: '10,000',
        columns: '6',
        department: 'Logistics',
        description: 'A messy log of international shipments requiring extensive cleanup.',
        difficulty: 'Advanced'
      },
      summary: {
        concepts: ['String cleanup', 'Datetime parsing'],
        why: 'Real operational data is a mix of dates, text, and numbers that all need standardizing before analysis can begin.',
        next: 'Proceed to Level 6 to learn Joins.'
      },
      businessSituation: [
        "Alright, it's time to test your Logistics chops.",
        "Here is the International Shipping Log. The requirements:",
        "1. Convert 'ship_date' to datetime.",
        "2. Create a 'ship_year' column using `.dt.year`.",
        "3. Standardize 'country_code' to be fully UPPERCASE.",
        "4. Remove any whitespace from 'tracking_id' using `.str.replace(' ', '')`.",
        "Assign the final dataframe to `clean_log`."
      ],
      datasets: {
        'intl_shipping.csv': {
          generator: 'sales',
          count: 10000,
          injections: []
        },
      },
      starterCode: `import pandas as pd\n\ndf = pd.read_csv('intl_shipping.csv')\n\n# 1. Convert to datetime\n# 2. Extract year\n# 3. Uppercase country code\n# 4. Remove whitespace from tracking ID\n\nclean_log = `,
      expectedConcepts: ['to_datetime', 'dt', 'str', 'upper', 'replace'],
      conversation: {
        situation: [
          "Follow the comments.",
          "Remember that string methods must be accessed through `.str`, and datetime methods through `.dt`."
        ],
        success: [
          "Fantastic. This data is now pristine.",
          "You're ready for the ultimate data manipulation tool: Joins."
        ],
        hints: [
          "Date: `df['ship_date'] = pd.to_datetime(df['ship_date'])`",
          "Year: `df['ship_year'] = df['ship_date'].dt.year`",
          "Country: `df['country_code'] = df['country_code'].str.upper()`",
          "Tracking: `df['tracking_id'] = df['tracking_id'].str.replace(' ', '')`"
        ]
      },
      validator: { 
        fn: 'validateMultiStage',
        stages: [
          {
            name: "Datetime Conversion",
            check: "pd.api.types.is_datetime64_any_dtype(clean_log['ship_date'])",
            feedback: "The 'ship_date' column is not a datetime object."
          },
          {
            name: "Year Extraction",
            check: "'ship_year' in clean_log.columns",
            feedback: "You did not create the 'ship_year' column."
          },
          {
            name: "Country Code Uppercase",
            check: "all(clean_log['country_code'] == clean_log['country_code'].str.upper())",
            feedback: "Not all country codes are uppercase."
          }
        ]
      }
    }
  ]
};
