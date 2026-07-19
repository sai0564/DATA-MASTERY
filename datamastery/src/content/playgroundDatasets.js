export const PLAYGROUND_DATASETS = {
  iris: {
    name: "Iris Flowers",
    filename: "iris.csv",
    rows: 150,
    columns: 5,
    difficulty: "Beginner",
    category: "Classification",
    tags: ["Biology", "Classics", "Scatter"],
    description: "Measurement records of sepal and petal lengths/widths for three species of Iris flowers.",
    csv: "sepal_length,sepal_width,petal_length,petal_width,species\n5.1,3.5,1.4,0.2,setosa\n4.9,3.0,1.4,0.2,setosa\n4.7,3.2,1.3,0.2,setosa\n4.6,3.1,1.5,0.2,setosa\n5.0,3.6,1.4,0.2,setosa\n7.0,3.2,4.7,1.4,versicolor\n6.4,3.2,4.5,1.5,versicolor\n6.9,3.1,4.9,1.5,versicolor\n5.5,2.3,4.0,1.3,versicolor\n6.5,2.8,4.6,1.5,versicolor\n6.3,3.3,6.0,2.5,virginica\n5.8,2.7,5.1,1.9,virginica\n7.1,3.0,5.9,2.1,virginica\n6.3,2.9,5.6,1.8,virginica\n6.5,3.0,5.8,2.2,virginica",
    columnsInfo: [
      { name: "sepal_length", type: "float", missing: 0 },
      { name: "sepal_width", type: "float", missing: 0 },
      { name: "petal_length", type: "float", missing: 0 },
      { name: "petal_width", type: "float", missing: 0 },
      { name: "species", type: "string", missing: 0 }
    ],
    sampleRows: [
      ["5.1", "3.5", "1.4", "0.2", "setosa"],
      ["4.9", "3.0", "1.4", "0.2", "setosa"],
      ["7.0", "3.2", "4.7", "1.4", "versicolor"],
      ["6.3", "3.3", "6.0", "2.5", "virginica"]
    ]
  },
  titanic: {
    name: "Titanic Passengers",
    filename: "titanic.csv",
    rows: 891,
    columns: 8,
    difficulty: "Intermediate",
    category: "Classification",
    tags: ["History", "CleanUp", "Boolean"],
    description: "Demographic and travel details of Titanic passengers, indicating their survival status.",
    csv: "passenger_id,survived,pclass,sex,age,sibsp,parch,fare\n1,0,3,male,22,1,0,7.25\n2,1,1,female,38,1,0,71.28\n3,1,3,female,26,0,0,7.92\n4,1,1,female,35,1,0,53.1\n5,0,3,male,35,0,0,8.05\n6,0,3,male,,0,0,8.46\n7,0,1,male,54,0,0,51.86\n8,0,3,male,2,3,1,21.07\n9,1,3,female,27,0,2,11.13\n10,1,2,female,14,1,0,30.07\n11,1,3,female,4,1,1,16.7\n12,1,1,female,58,0,0,26.55\n13,0,3,male,20,0,0,8.05",
    columnsInfo: [
      { name: "passenger_id", type: "int", missing: 0 },
      { name: "survived", type: "int", missing: 0 },
      { name: "pclass", type: "int", missing: 0 },
      { name: "sex", type: "string", missing: 0 },
      { name: "age", type: "float", missing: 1 },
      { name: "sibsp", type: "int", missing: 0 },
      { name: "parch", type: "int", missing: 0 },
      { name: "fare", type: "float", missing: 0 }
    ],
    sampleRows: [
      ["1", "0", "3", "male", "22", "1", "0", "7.25"],
      ["2", "1", "1", "female", "38", "1", "0", "71.28"],
      ["3", "1", "3", "female", "26", "0", "0", "7.92"],
      ["6", "0", "3", "male", "NaN", "0", "0", "8.46"]
    ]
  },
  wine: {
    name: "Wine Quality",
    filename: "wine.csv",
    rows: 178,
    columns: 6,
    difficulty: "Intermediate",
    category: "Classification",
    tags: ["Chemistry", "Correlation", "Numeric"],
    description: "Chemical analyses of wines derived from three different cultivars grown in Italy.",
    csv: "alcohol,malic_acid,ash,magnesium,total_phenols,quality\n14.23,1.71,2.43,127,2.8,high\n13.2,1.78,2.14,100,2.65,high\n13.16,2.36,2.67,101,2.8,high\n14.37,1.95,2.5,113,3.85,high\n13.24,2.59,2.87,118,2.8,medium\n14.2,1.76,2.45,112,3.27,medium\n14.39,1.87,2.45,96,2.5,medium\n14.06,2.15,2.61,121,2.6,low\n13.83,1.57,2.62,89,2.8,low",
    columnsInfo: [
      { name: "alcohol", type: "float", missing: 0 },
      { name: "malic_acid", type: "float", missing: 0 },
      { name: "ash", type: "float", missing: 0 },
      { name: "magnesium", type: "int", missing: 0 },
      { name: "total_phenols", type: "float", missing: 0 },
      { name: "quality", type: "string", missing: 0 }
    ],
    sampleRows: [
      ["14.23", "1.71", "2.43", "127", "2.8", "high"],
      ["13.2", "1.78", "2.14", "100", "2.65", "high"],
      ["13.24", "2.59", "2.87", "118", "2.8", "medium"]
    ]
  },
  diabetes: {
    name: "Diabetes Patient Records",
    filename: "diabetes.csv",
    rows: 442,
    columns: 6,
    difficulty: "Advanced",
    category: "Regression",
    tags: ["Health", "Regression", "Numerical"],
    description: "Clinical diagnostic measurements for patients to forecast disease progression indices.",
    csv: "age,sex,bmi,bp,glucose,progression\n59,female,32.1,101.0,87,151\n48,male,21.6,87.0,88,75\n72,female,30.5,93.0,89,141\n24,male,25.3,84.0,84,206\n50,female,23.0,101.0,85,135\n23,male,22.6,89.0,78,97\n36,female,22.0,90.0,95,138",
    columnsInfo: [
      { name: "age", type: "int", missing: 0 },
      { name: "sex", type: "string", missing: 0 },
      { name: "bmi", type: "float", missing: 0 },
      { name: "bp", type: "float", missing: 0 },
      { name: "glucose", type: "int", missing: 0 },
      { name: "progression", type: "int", missing: 0 }
    ],
    sampleRows: [
      ["59", "female", "32.1", "101.0", "87", "151"],
      ["48", "male", "21.6", "87.0", "88", "75"]
    ]
  },
  housing: {
    name: "California Housing",
    filename: "housing.csv",
    rows: 20640,
    columns: 6,
    difficulty: "Advanced",
    category: "Regression",
    tags: ["Geography", "Pricing", "Large"],
    description: "Median house values, average rooms, and demographics for California district groups.",
    csv: "longitude,latitude,housing_median_age,total_rooms,median_income,median_house_value\n-122.23,37.88,41,880,8.32,452600\n-122.22,37.86,21,7099,8.30,358500\n-122.24,37.85,52,1467,7.25,352100\n-122.25,37.85,52,1274,5.64,341300\n-122.25,37.85,52,1627,3.84,342200",
    columnsInfo: [
      { name: "longitude", type: "float", missing: 0 },
      { name: "latitude", type: "float", missing: 0 },
      { name: "housing_median_age", type: "int", missing: 0 },
      { name: "total_rooms", type: "int", missing: 0 },
      { name: "median_income", type: "float", missing: 0 },
      { name: "median_house_value", type: "int", missing: 0 }
    ],
    sampleRows: [
      ["-122.23", "37.88", "41", "880", "8.32", "452600"],
      ["-122.22", "37.86", "21", "7099", "8.30", "358500"]
    ]
  },
  tips: {
    name: "Restaurant Tips",
    filename: "tips.csv",
    rows: 244,
    columns: 6,
    difficulty: "Beginner",
    category: "Regression",
    tags: ["Dining", "Behavior", "Categorical"],
    description: "Tipping amounts recorded in a restaurant, indicating bill amounts, sexes, and days.",
    csv: "total_bill,tip,sex,smoker,day,time,size\n16.99,1.01,Female,No,Sun,Dinner,2\n10.34,1.66,Male,No,Sun,Dinner,3\n21.01,3.5,Male,No,Sun,Dinner,3\n23.68,3.31,Male,No,Sun,Dinner,2\n24.59,3.61,Female,No,Sun,Dinner,4\n25.29,4.71,Male,No,Sun,Dinner,4\n8.77,2.0,Male,No,Sun,Dinner,2",
    columnsInfo: [
      { name: "total_bill", type: "float", missing: 0 },
      { name: "tip", type: "float", missing: 0 },
      { name: "sex", type: "string", missing: 0 },
      { name: "smoker", type: "string", missing: 0 },
      { name: "day", type: "string", missing: 0 },
      { name: "time", type: "string", missing: 0 },
      { name: "size", type: "int", missing: 0 }
    ],
    sampleRows: [
      ["16.99", "1.01", "Female", "No", "Sun", "Dinner", "2"],
      ["10.34", "1.66", "Male", "No", "Sun", "Dinner", "3"],
      ["21.01", "3.5", "Male", "No", "Sun", "Dinner", "3"]
    ]
  },
  penguins: {
    name: "Palmer Penguins",
    filename: "penguins.csv",
    rows: 344,
    columns: 6,
    difficulty: "Beginner",
    category: "Classification",
    tags: ["Biology", "CleanUp", "Scatter"],
    description: "Sizes, bill dimensions, flipper details, and species records for Palmer Station penguins.",
    csv: "species,island,bill_length_mm,bill_depth_mm,flipper_length_mm,body_mass_g,sex\nAdelie,Torgersen,39.1,18.7,181,3750,MALE\nAdelie,Torgersen,39.5,17.4,186,3800,FEMALE\nAdelie,Torgersen,40.3,18.0,195,3250,FEMALE\nAdelie,Torgersen,,19.3,193,3450,FEMALE\nAdelie,Dream,36.7,19.3,193,3450,FEMALE\nAdelie,Dream,39.3,20.6,190,3650,MALE\nChinstrap,Dream,46.5,17.9,192,3500,FEMALE\nChinstrap,Dream,50.0,19.5,196,3900,MALE",
    columnsInfo: [
      { name: "species", type: "string", missing: 0 },
      { name: "island", type: "string", missing: 0 },
      { name: "bill_length_mm", type: "float", missing: 1 },
      { name: "bill_depth_mm", type: "float", missing: 0 },
      { name: "flipper_length_mm", type: "int", missing: 0 },
      { name: "body_mass_g", type: "int", missing: 0 },
      { name: "sex", type: "string", missing: 0 }
    ],
    sampleRows: [
      ["Adelie", "Torgersen", "39.1", "18.7", "181", "3750", "MALE"],
      ["Adelie", "Torgersen", "NaN", "19.3", "193", "3450", "FEMALE"],
      ["Chinstrap", "Dream", "46.5", "17.9", "192", "3500", "FEMALE"]
    ]
  },
  cars: {
    name: "Automobile Specifications",
    filename: "cars.csv",
    rows: 398,
    columns: 6,
    difficulty: "Intermediate",
    category: "Regression",
    tags: ["Engineering", "History", "Scatter"],
    description: "Horsepower, acceleration, weight, and fuel efficiency metrics (MPG) for older car models.",
    csv: "mpg,cylinders,displacement,horsepower,weight,acceleration,origin\n18.0,8,307.0,130.0,3504,12.0,usa\n15.0,8,350.0,165.0,3693,11.5,usa\n18.0,8,318.0,150.0,3436,11.0,usa\n16.0,8,304.0,150.0,3433,12.0,usa\n17.0,8,302.0,140.0,3449,10.5,usa\n15.0,8,429.0,198.0,4341,10.0,usa\n20.0,4,97.0,88.0,2279,19.0,japan",
    columnsInfo: [
      { name: "mpg", type: "float", missing: 0 },
      { name: "cylinders", type: "int", missing: 0 },
      { name: "displacement", type: "float", missing: 0 },
      { name: "horsepower", type: "float", missing: 0 },
      { name: "weight", type: "int", missing: 0 },
      { name: "acceleration", type: "float", missing: 0 },
      { name: "origin", type: "string", missing: 0 }
    ],
    sampleRows: [
      ["18.0", "8", "307.0", "130.0", "3504", "12.0", "usa"],
      ["20.0", "4", "97.0", "88.0", "2279", "19.0", "japan"]
    ]
  },
  sales: {
    name: "Company Retail Sales",
    filename: "sales.csv",
    rows: 500,
    columns: 6,
    difficulty: "Beginner",
    category: "Business",
    tags: ["Transactions", "Retail", "Revenue"],
    description: "Corporate retail transaction records indicating amounts, regions, and dates.",
    csv: "transaction_id,customer_id,amount,region,category,date\n1001,C553,420.50,East,Electronics,2026-01-05\n1002,C221,85.20,West,Clothing,2026-01-06\n1003,C553,1250.00,North,Electronics,2026-01-06\n1004,C881,14.50,South,Office,2026-01-07\n1005,C221,450.00,East,Electronics,2026-01-08\n1006,C334,210.00,West,Office,2026-01-08\n1007,C908,750.80,East,Clothing,2026-01-09",
    columnsInfo: [
      { name: "transaction_id", type: "int", missing: 0 },
      { name: "customer_id", type: "string", missing: 0 },
      { name: "amount", type: "float", missing: 0 },
      { name: "region", type: "string", missing: 0 },
      { name: "category", type: "string", missing: 0 },
      { name: "date", type: "string", missing: 0 }
    ],
    sampleRows: [
      ["1001", "C553", "420.50", "East", "Electronics", "2026-01-05"],
      ["1002", "C221", "85.20", "West", "Clothing", "2026-01-06"]
    ]
  },
  churn: {
    name: "Customer Churn Logs",
    filename: "churn.csv",
    rows: 1000,
    columns: 7,
    difficulty: "Intermediate",
    category: "Business",
    tags: ["Retention", "Marketing", "SaaS"],
    description: "SaaS client log tracking subscription tenure, monthly usage, and churn status.",
    csv: "client_id,tenure_months,monthly_charges,total_charges,contract,churn,support_calls\nC441,12,65.50,786.00,Month-to-month,0,1\nC882,2,45.00,90.00,Month-to-month,1,4\nC901,36,89.90,3236.40,Two-year,0,0\nC554,8,75.00,600.00,One-year,0,2\nC121,1,20.00,20.00,Month-to-month,1,5\nC334,24,110.50,2652.00,One-year,0,2\nC789,18,85.00,1530.00,Month-to-month,0,3",
    columnsInfo: [
      { name: "client_id", type: "string", missing: 0 },
      { name: "tenure_months", type: "int", missing: 0 },
      { name: "monthly_charges", type: "float", missing: 0 },
      { name: "total_charges", type: "float", missing: 0 },
      { name: "contract", type: "string", missing: 0 },
      { name: "churn", type: "int", missing: 0 },
      { name: "support_calls", type: "int", missing: 0 }
    ],
    sampleRows: [
      ["C441", "12", "65.50", "786.00", "Month-to-month", "0", "1"],
      ["C882", "2", "45.00", "90.00", "Month-to-month", "1", "4"]
    ]
  },
  employee: {
    name: "Employee HR Records",
    filename: "employee.csv",
    rows: 250,
    columns: 6,
    difficulty: "Beginner",
    category: "HR",
    tags: ["Operations", "Salaries", "Grouping"],
    description: "Corporate headcount telemetry including salary brackets, departments, and tenure.",
    csv: "emp_id,department,salary,years_exp,perf_rating,gender\nE101,Sales,72000,4,3,Male\nE102,Engineering,98000,6,4,Female\nE103,Marketing,65000,2,3,Female\nE104,Engineering,125000,10,5,Male\nE105,Sales,81000,5,4,Male\nE106,HR,58000,3,3,Female\nE107,Engineering,90000,4,4,Female",
    columnsInfo: [
      { name: "emp_id", type: "string", missing: 0 },
      { name: "department", type: "string", missing: 0 },
      { name: "salary", type: "int", missing: 0 },
      { name: "years_exp", type: "int", missing: 0 },
      { name: "perf_rating", type: "int", missing: 0 },
      { name: "gender", type: "string", missing: 0 }
    ],
    sampleRows: [
      ["E101", "Sales", "72000", "4", "3", "Male"],
      ["E102", "Engineering", "98000", "6", "4", "Female"]
    ]
  },
  movies: {
    name: "Movie Ratings",
    filename: "movies.csv",
    rows: 600,
    columns: 6,
    difficulty: "Intermediate",
    category: "Entertainment",
    tags: ["Recommendations", "Ratings", "Review"],
    description: "Audience sentiment databases featuring ratings, genres, budgets, and releases.",
    csv: "movie_id,title,genre,budget_m,rating,release_year\nM101,Inception,Sci-Fi,160.0,8.8,2010\nM102,Avatar,Action,237.0,7.8,2009\nM103,The Dark Knight,Action,185.0,9.0,2008\nM104,Interstellar,Sci-Fi,165.0,8.6,2014\nM105,Spirited Away,Animation,19.0,8.6,2001\nM106,Pulp Fiction,Crime,8.0,8.9,1994\nM107,Toy Story,Animation,30.0,8.3,1995",
    columnsInfo: [
      { name: "movie_id", type: "string", missing: 0 },
      { name: "title", type: "string", missing: 0 },
      { name: "genre", type: "string", missing: 0 },
      { name: "budget_m", type: "float", missing: 0 },
      { name: "rating", type: "float", missing: 0 },
      { name: "release_year", type: "int", missing: 0 }
    ],
    sampleRows: [
      ["M101", "Inception", "Sci-Fi", "160.0", "8.8", "2010"],
      ["M102", "Avatar", "Action", "237.0", "7.8", "2009"]
    ]
  },
  students: {
    name: "Student Performance",
    filename: "students.csv",
    rows: 395,
    columns: 6,
    difficulty: "Beginner",
    category: "HR",
    tags: ["Academics", "Grades", "Correlation"],
    description: "Academic reports detailing hours studied, test grades, and absences for students.",
    csv: "student_id,hours_studied,absences,grade,math_score,passed\nS1001,15,2,85,78,1\nS1002,8,5,70,64,1\nS1003,12,0,92,88,1\nS1004,4,8,55,42,0\nS1005,18,1,96,94,1\nS1006,6,4,68,60,1\nS1007,2,10,45,35,0",
    columnsInfo: [
      { name: "student_id", type: "string", missing: 0 },
      { name: "hours_studied", type: "int", missing: 0 },
      { name: "absences", type: "int", missing: 0 },
      { name: "grade", type: "int", missing: 0 },
      { name: "math_score", type: "int", missing: 0 },
      { name: "passed", type: "int", missing: 0 }
    ],
    sampleRows: [
      ["S1001", "15", "2", "85", "78", "1"],
      ["S1002", "8", "5", "70", "64", "1"]
    ]
  }
};
