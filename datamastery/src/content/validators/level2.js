/**
 * Level 2 Validators - Data Cleaning
 * 
 * We use Python scripts executed in Pyodide to evaluate the *state* of the resulting dataframes.
 * This allows multiple correct syntaxes (e.g. df.dropna() vs df = df[~df.isna()]).
 */

export const level2Validators = {
  // 2.2 Detect Missing Data
  validateLevel2_2: async (code, context) => {
    const pyodide = context.pyodide;
    
    // We expect the user to create a dataframe called 'broken_leads' 
    // that contains ONLY the rows missing an email.
    const checkScript = `
import pandas as pd
if 'broken_leads' not in globals():
    result = {"success": False, "message": "You must assign the filtered dataframe to a variable named 'broken_leads'."}
else:
    try:
        if len(broken_leads) == 0:
            result = {"success": False, "message": "Your broken_leads dataframe is empty. There should be around 100+ rows missing emails."}
        elif broken_leads['email'].notna().sum() > 0:
            result = {"success": False, "message": "Your dataframe contains rows that DO have emails. You need to filter for rows where email is missing."}
        else:
            result = {"success": True, "message": "Great job finding the missing data."}
    except Exception as e:
        result = {"success": False, "message": f"Error validating broken_leads: {str(e)}"}
result
`;
    try {
      const res = await pyodide.runPythonAsync(checkScript);
      return res.toJs();
    } catch (e) {
      return { success: false, message: "Syntax error in your Python code." };
    }
  },

  // 2.3 Fill Missing Data
  validateLevel2_3: async (code, context) => {
    const pyodide = context.pyodide;
    const checkScript = `
if 'df' not in globals():
    result = {"success": False, "message": "Do not delete the 'df' variable."}
else:
    try:
        missing_count = df['annual_salary'].isna().sum()
        if missing_count > 0:
            result = {"success": False, "message": f"There are still {missing_count} missing salaries in the dataframe."}
        else:
            result = {"success": True, "message": "Perfectly filled."}
    except Exception as e:
        result = {"success": False, "message": f"Error: {str(e)}"}
result
`;
    try {
      const res = await pyodide.runPythonAsync(checkScript);
      return res.toJs();
    } catch (e) {
      return { success: false, message: "Syntax error in your Python code." };
    }
  },

  // 2.4 Remove Missing Data
  validateLevel2_4: async (code, context) => {
    const pyodide = context.pyodide;
    const checkScript = `
if 'clean_df' not in globals():
    result = {"success": False, "message": "Assign your result to 'clean_df'."}
else:
    try:
        if clean_df['email'].isna().sum() > 0:
            result = {"success": False, "message": "clean_df still contains rows with missing emails."}
        elif len(clean_df) == len(df):
            result = {"success": False, "message": "You didn't drop any rows! Use dropna."}
        else:
            result = {"success": True, "message": "All clean."}
    except Exception as e:
        result = {"success": False, "message": f"Error: {str(e)}"}
result
`;
    try {
      const res = await pyodide.runPythonAsync(checkScript);
      return res.toJs();
    } catch (e) {
      return { success: false, message: "Syntax error in your Python code." };
    }
  },

  // 2.5 Duplicate Records
  validateLevel2_5: async (code, context) => {
    const pyodide = context.pyodide;
    const checkScript = `
if 'clean_df' not in globals():
    result = {"success": False, "message": "Assign your result to 'clean_df'."}
else:
    try:
        if clean_df.duplicated().sum() > 0:
            result = {"success": False, "message": "There are still exact duplicates in clean_df."}
        elif len(clean_df) == len(df):
            result = {"success": False, "message": "You didn't drop any rows!"}
        else:
            result = {"success": True, "message": "Duplicates destroyed."}
    except Exception as e:
        result = {"success": False, "message": f"Error: {str(e)}"}
result
`;
    try {
      const res = await pyodide.runPythonAsync(checkScript);
      return res.toJs();
    } catch (e) {
      return { success: false, message: "Syntax error in your Python code." };
    }
  },

  // 2.6 Data Types
  validateLevel2_6: async (code, context) => {
    const pyodide = context.pyodide;
    const checkScript = `
if 'df' not in globals():
    result = {"success": False, "message": "Do not delete the 'df' variable."}
else:
    try:
        import pandas as pd
        if not pd.api.types.is_float_dtype(df['price']):
            result = {"success": False, "message": f"The price column is type {df['price'].dtype}, but it needs to be float64."}
        else:
            result = {"success": True, "message": "Type cast successful."}
    except Exception as e:
        result = {"success": False, "message": f"Error: {str(e)}"}
result
`;
    try {
      const res = await pyodide.runPythonAsync(checkScript);
      return res.toJs();
    } catch (e) {
      return { success: false, message: "Syntax error in your Python code." };
    }
  },

  // 2.7 Challenge
  validateLevel2_7: async (code, context) => {
    const pyodide = context.pyodide;
    const checkScript = `
if 'final_df' not in globals():
    result = {"success": False, "message": "You must assign your final dataframe to 'final_df'."}
else:
    try:
        import pandas as pd
        
        errors = []
        
        # 1. Check duplicates
        if final_df.duplicated().sum() > 0:
            errors.append("You didn't drop exact duplicates.")
            
        # 2. Check missing emails
        if final_df['email'].isna().sum() > 0:
            errors.append("There are still missing emails.")
            
        # 3. Check city filled with 'Unknown'
        # Account for ' ' string injections
        if ' ' in final_df['city'].values:
            errors.append("There are still blank string (' ') cities. You need to replace them.")
        if final_df['city'].isna().sum() > 0:
            errors.append("There are still NaN cities.")
            
        # 4. Check age is float
        if not pd.api.types.is_float_dtype(final_df['age']):
            errors.append("The 'age' column was not converted to a float.")
            
        if len(errors) > 0:
            result = {"success": False, "message": " | ".join(errors)}
        else:
            result = {"success": True, "message": "Incredible work! You are a data cleaning master."}
            
    except Exception as e:
        result = {"success": False, "message": f"Error validating your dataframe: {str(e)}"}
result
`;
    try {
      const res = await pyodide.runPythonAsync(checkScript);
      return res.toJs();
    } catch (e) {
      return { success: false, message: "Syntax error in your Python code." };
    }
  }
};
