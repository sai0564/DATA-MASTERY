/**
 * Level 6: The Master Database
 */
export const level6 = {
  id: 'level-6',
  title: 'The Master Database',
  description: 'Master relational data by merging and concatenating multiple tables together.',
  mentor: 'maya',
  icon: '🔗',
  subLevels: [
    // ─── 6.1 Concatenation ───────────────────────────────────────────
    {
      id: '6.1',
      level: 'level-6',
      subLevel: '6.1',
      type: 'guided',
      mentor: 'maya',
      title: 'Stacking Data',
      subtitle: 'Using pd.concat()',
      learningObjective: 'Learn to stack DataFrames vertically using pd.concat().',
      estDuration: '3m',
      datasetCard: {
        filename: 'monthly_files.csv',
        rows: '2,000',
        columns: '4',
        department: 'Data Engineering',
        description: 'Two separate dataframes for Jan and Feb sales.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['pd.concat()'],
        why: 'Systems often generate data in daily or monthly chunks. To analyze the whole year, you must stack them together.',
        next: 'Learn to merge tables horizontally based on matching IDs.'
      },
      businessSituation: [
        "Welcome to the big leagues. We are doing Data Engineering today.",
        "We have two files: January sales and February sales.",
        "We need to stack them on top of each other to create a single master DataFrame."
      ],
      datasets: {
        'jan_sales.csv': { generator: 'sales', count: 1000, injections: [] },
        'feb_sales.csv': { generator: 'sales', count: 1000, injections: [] }
      },
      starterCode: `import pandas as pd\n\njan = pd.read_csv('jan_sales.csv')\nfeb = pd.read_csv('feb_sales.csv')\n\n# Stack feb below jan\ncombined = pd.concat([____, ____])`,
      expectedConcepts: ['concat', 'jan', 'feb'],
      conversation: {
        situation: [
          "`pd.concat()` takes a list of DataFrames.",
          "Pass `[jan, feb]` into the function."
        ],
        success: [
          "Perfect. The rows are now stacked vertically.",
          "Note that concat uses the column names to align the data. If the columns don't match exactly, you'll get NaNs!"
        ],
        hints: [
          "Code: `combined = pd.concat([jan, feb])`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 6.2 Inner Joins ─────────────────────────────────────────────
    {
      id: '6.2',
      level: 'level-6',
      subLevel: '6.2',
      type: 'guided',
      mentor: 'maya',
      title: 'Connecting the Dots',
      subtitle: 'Inner Joins',
      learningObjective: 'Learn to use pd.merge() to perform an inner join on a shared key.',
      estDuration: '4m',
      datasetCard: {
        filename: 'multiple',
        rows: 'Varies',
        columns: 'Varies',
        department: 'Data Engineering',
        description: 'Orders and Customers tables.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['pd.merge(how="inner")'],
        why: 'In relational databases, data is split into specialized tables (customers, orders, products). You must join them to see the full picture.',
        next: 'Learn how to keep data even if it has no match using a Left Join.'
      },
      businessSituation: [
        "We have an 'orders' table containing the 'customer_id' who made the purchase.",
        "But we don't know the customer's name! That lives in the 'customers' table.",
        "Let's perform an inner join on the 'customer_id' column to bring them together."
      ],
      datasets: {
        'orders.csv': { generator: 'sales', count: 1000, injections: [] },
        'customers.csv': { generator: 'customers', count: 800, injections: [] }
      },
      starterCode: `import pandas as pd\n\norders = pd.read_csv('orders.csv')\ncustomers = pd.read_csv('customers.csv')\n\n# Perform an inner join on 'customer_id'\nmerged = pd.merge(orders, customers, on='customer_id', how='inner')`,
      expectedConcepts: ['merge', 'on', 'inner'],
      conversation: {
        situation: [
          "I've filled out the syntax for you because it's crucial you understand it.",
          "We specify the left table (`orders`), the right table (`customers`), the key to match on (`on='customer_id'`), and the type of join (`how='inner'`)."
        ],
        success: [
          "Look at that! Now every order row also contains the customer's name and email.",
          "An 'inner' join drops any rows that don't have a match in BOTH tables."
        ],
        hints: [
          "Just hit Run!"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 6.3 Left Joins ──────────────────────────────────────────────
    {
      id: '6.3',
      level: 'level-6',
      subLevel: '6.3',
      type: 'guided',
      mentor: 'maya',
      title: 'Leaving No One Behind',
      subtitle: 'Left Joins',
      learningObjective: 'Learn to use pd.merge() with how="left" to preserve all rows from the left table.',
      estDuration: '4m',
      datasetCard: {
        filename: 'multiple',
        rows: 'Varies',
        columns: 'Varies',
        department: 'Data Engineering',
        description: 'Customers and Orders tables.',
        difficulty: 'Intermediate'
      },
      summary: {
        concepts: ['pd.merge(how="left")'],
        why: 'Sometimes you want a list of all customers, and you want to attach their orders IF they have any. An inner join would drop customers with no orders.',
        next: 'Learn how to handle naming collisions with suffixes.'
      },
      businessSituation: [
        "Marketing wants a list of ALL customers, and they want to see the date of their last order.",
        "If we do an inner join, we'll lose the customers who haven't ordered yet.",
        "We need a 'left' join. This keeps EVERY row from the left table (customers), and just fills in NaNs if the right table (orders) has no match."
      ],
      datasets: {
        'customers.csv': { generator: 'customers', count: 1000, injections: [] },
        'orders.csv': { generator: 'sales', count: 500, injections: [] }
      },
      starterCode: `import pandas as pd\n\ncustomers = pd.read_csv('customers.csv')\norders = pd.read_csv('orders.csv')\n\n# Perform a left join to keep ALL customers\nall_customers = pd.merge(customers, orders, on='customer_id', how='____')`,
      expectedConcepts: ['merge', 'left'],
      conversation: {
        situation: [
          "Change the `how` parameter to `'left'`."
        ],
        success: [
          "Excellent. If you look at the dataframe, you'll see NaNs for the order columns on customers who haven't bought anything.",
          "Left joins are incredibly common in reporting."
        ],
        hints: [
          "Code: `all_customers = pd.merge(customers, orders, on='customer_id', how='left')`"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 6.4 Suffixes ────────────────────────────────────────────────
    {
      id: '6.4',
      level: 'level-6',
      subLevel: '6.4',
      type: 'guided',
      mentor: 'maya',
      title: 'Handling Collisions',
      subtitle: 'Merge Suffixes',
      learningObjective: 'Learn to use the suffixes argument to resolve identical column names.',
      estDuration: '3m',
      datasetCard: {
        filename: 'multiple',
        rows: 'Varies',
        columns: 'Varies',
        department: 'Data Engineering',
        description: 'Tables that both have an "updated_at" column.',
        difficulty: 'Beginner'
      },
      summary: {
        concepts: ['suffixes=("_x", "_y")'],
        why: 'When joining tables, if both tables share a column name (other than the join key), Pandas will append _x and _y to them. You should control this naming.',
        next: 'Put it all together in the Master Join Challenge.'
      },
      businessSituation: [
        "We are joining 'products' and 'orders'.",
        "Both tables have a column called 'updated_at'.",
        "If we join them, Pandas will name them 'updated_at_x' and 'updated_at_y'. That's messy.",
        "Let's use the `suffixes` argument to name them `_prod` and `_order`."
      ],
      datasets: {
        'products.csv': { generator: 'products', count: 100, injections: [] },
        'orders.csv': { generator: 'sales', count: 500, injections: [] }
      },
      starterCode: `import pandas as pd\n\nproducts = pd.read_csv('products.csv')\norders = pd.read_csv('orders.csv')\n\n# Merge with custom suffixes\nmerged = pd.merge(orders, products, on='product_id', how='inner', suffixes=('_order', '_prod'))`,
      expectedConcepts: ['suffixes'],
      conversation: {
        situation: [
          "I've provided the syntax. Just examine it and hit Run."
        ],
        success: [
          "Great. Now the columns are explicitly named `updated_at_order` and `updated_at_prod`.",
          "Always explicitly define your suffixes. Don't rely on `_x` and `_y`!"
        ],
        hints: [
          "Just hit Run!"
        ]
      },
      validator: { fn: 'validateDataFrame' }
    },

    // ─── 6.5 Challenge ───────────────────────────────────────────────
    {
      id: '6.5',
      level: 'level-6',
      subLevel: '6.5',
      type: 'challenge',
      mentor: 'maya',
      title: 'The Unified Customer Table',
      subtitle: 'Data Engineering Challenge',
      learningObjective: 'Combine data loading, cleaning, and multiple left joins.',
      estDuration: '10m',
      datasetCard: {
        filename: 'multiple',
        rows: 'Varies',
        columns: 'Varies',
        department: 'Data Engineering',
        description: 'Customers, Orders, and Web Traffic data.',
        difficulty: 'Advanced'
      },
      summary: {
        concepts: ['Relational Joins'],
        why: 'Building a master dataset for machine learning or BI dashboards requires carefully left-joining multiple supplementary tables onto a primary table.',
        next: 'Proceed to Level 7 for your Performance Review.'
      },
      businessSituation: [
        "The Data Science team needs a 'Unified Master Table' for their new machine learning model.",
        "You need to start with the `customers` table as your base.",
        "Perform a LEFT join to attach the `orders` table.",
        "Then perform another LEFT join to attach the `traffic` (website visits) table.",
        "Assign the final huge table to `unified_df`."
      ],
      datasets: {
        'customers.csv': { generator: 'customers', count: 1500, injections: [] },
        'orders.csv': { generator: 'sales', count: 3000, injections: [] },
        'traffic.csv': { generator: 'site_traffic', count: 5000, injections: [] }
      },
      starterCode: `import pandas as pd\n\ncustomers = pd.read_csv('customers.csv')\norders = pd.read_csv('orders.csv')\ntraffic = pd.read_csv('traffic.csv')\n\n# 1. Left join orders onto customers\n# 2. Left join traffic onto the result\n\nunified_df = `,
      expectedConcepts: ['merge', 'left', 'on'],
      conversation: {
        situation: [
          "You'll need to run `pd.merge()` twice.",
          "Make sure both are `how='left'` so we don't lose any customers."
        ],
        success: [
          "You did it! The Data Science team is thrilled.",
          "You've mastered relational joins in Pandas."
        ],
        hints: [
          "Step 1: `step1 = pd.merge(customers, orders, on='customer_id', how='left')`",
          "Step 2: `unified_df = pd.merge(step1, traffic, on='customer_id', how='left')`"
        ]
      },
      validator: { 
        fn: 'validateMultiStage',
        stages: [
          {
            name: "Orders Joined",
            check: "'amount' in unified_df.columns",
            feedback: "It doesn't look like the orders table was joined successfully."
          },
          {
            name: "Traffic Joined",
            check: "'page_views' in unified_df.columns",
            feedback: "It doesn't look like the traffic table was joined successfully."
          },
          {
            name: "Left Join Maintained",
            check: "len(unified_df) >= 1500",
            feedback: "You lost rows! Make sure you are using a LEFT join."
          }
        ]
      }
    }
  ]
};
