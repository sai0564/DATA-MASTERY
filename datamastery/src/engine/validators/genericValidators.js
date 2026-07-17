/**
 * Reusable generic semantic validators for DataMastery.
 * Allows lesson authors to configure validation in JSON/JS mission settings.
 */

/**
 * Validates DataFrame operations (loading, previewing, shape, columns, types, sample, summary).
 * Configuration options:
 *   checkLoaded: boolean
 *   checkHead: boolean
 *   checkShape: boolean
 *   checkColumns: boolean
 *   checkDtypes: boolean
 *   checkSample: boolean
 *   checkDescribe: boolean
 *   requiredColumns: string[]
 *   variableName: string (default 'df')
 */
export function validateDataFrame(executionResult, context) {
  const { stdout = '', variables = {} } = executionResult;
  const config = context.config || {};
  
  const varName = config.variableName || 'df';
  const dfVar = variables[varName];
  const isDfLoaded = dfVar && dfVar.type === 'DataFrame';

  // 1. Check if DataFrame is loaded
  if (config.checkLoaded && !isDfLoaded) {
    return {
      passed: false,
      feedback: config.loadFeedback || "Load the CSV file with pd.read_csv() first."
    };
  }

  // 2. Check head preview
  if (config.checkHead) {
    const hasColumns = config.requiredColumns
      ? config.requiredColumns.some(col => stdout.includes(col))
      : (stdout.includes('customer_id') || stdout.includes('email'));
    if (!hasColumns) {
      if (isDfLoaded) {
        return {
          passed: false,
          feedback: config.headMissingFeedback || "You've loaded the data — now show the first few rows. Try calling head() on the DataFrame."
        };
      }
      return {
        passed: false,
        feedback: config.loadFeedback || "Load the CSV file with pd.read_csv() and then use head() to show the first rows."
      };
    }
  }

  // 3. Check shape dimensions
  if (config.checkShape) {
    const shapeMatch = stdout.match(/\(?\s*(\d+)\s*,\s*(\d+)\s*\)?/);
    let shape_0 = null;
    let shape_1 = null;
    
    if (shapeMatch) {
      shape_0 = parseInt(shapeMatch[1], 10);
      shape_1 = parseInt(shapeMatch[2], 10);
    } else if (isDfLoaded && dfVar.shape) {
      const [r, c] = dfVar.shape;
      if (stdout.includes(String(r))) {
        shape_0 = r;
        shape_1 = c;
      }
    }

    if (shape_0 === null || shape_1 === null) {
      return {
        passed: false,
        feedback: config.shapeFeedback || "Check the shape of the DataFrame by printing df.shape."
      };
    }
    
    // Save template vars
    return {
      passed: true,
      feedback: '',
      templateVars: { shape_0, shape_1 }
    };
  }

  // 4. Check columns
  if (config.checkColumns) {
    const hasColumns = config.requiredColumns
      ? config.requiredColumns.every(col => stdout.includes(col))
      : (stdout.includes('customer_id') && (stdout.includes('first_name') || stdout.includes('email')));
    if (!hasColumns) {
      return {
        passed: false,
        feedback: config.columnsFeedback || "Make sure you print or display the columns list (try printing df.columns)."
      };
    }
  }

  // 5. Check data types
  if (config.checkDtypes) {
    const hasDtype = stdout.includes('int64') || stdout.includes('float64') || stdout.includes('object') || stdout.includes('dtype');
    if (!hasDtype) {
      return {
        passed: false,
        feedback: config.dtypesFeedback || "Check the data types — try printing df.dtypes or df.info()."
      };
    }
  }

  // 6. Check sample records
  if (config.checkSample) {
    const hasSample = stdout.includes('customer_id') || stdout.includes('CUST-');
    if (!hasSample) {
      return {
        passed: false,
        feedback: config.sampleFeedback || "Inspect a random sample of rows using df.sample(5)."
      };
    }
  }

  // 7. Check describe summary
  if (config.checkDescribe) {
    const hasStats = (stdout.includes('mean') || stdout.includes('avg')) && (stdout.includes('min') || stdout.includes('max') || stdout.includes('std'));
    if (!hasStats) {
      if (stdout.includes('count')) {
        return {
          passed: false,
          feedback: "Close — you're getting some stats. Try df.describe() for the full statistical summary."
        };
      }
      return {
        passed: false,
        feedback: config.describeFeedback || "Generate a statistical summary of the dataset. Try df.describe()."
      };
    }
  }

  return { passed: true, feedback: '' };
}

/**
 * Validates challenge progression stages dynamically.
 * Stage config structure:
 *   state: string (e.g. 'loaded')
 *   type: 'variable_type' | 'regex_or_stdout' | 'contains_all'
 *   target: string (type name or regex or string)
 *   targets: string[] (for contains_all)
 *   feedback: string
 */
export function validateMultiStage(executionResult, context) {
  const { stdout = '', variables = {} } = executionResult;
  const config = context.config || {};
  const stages = config.stages || [];
  const reachedStates = [];
  
  let lastPassedState = null;
  
  for (const stage of stages) {
    let passed = false;
    
    if (stage.type === 'variable_type') {
      passed = Object.values(variables).some(v => v.type === stage.target);
    } else if (stage.type === 'regex_or_stdout') {
      const regex = new RegExp(stage.target);
      passed = regex.test(stdout) || stdout.includes(stage.targetValue || stage.target);
    } else if (stage.type === 'contains_all') {
      passed = stage.targets.every(term => stdout.includes(term));
    }
    
    if (passed) {
      reachedStates.push(stage.state);
      lastPassedState = stage.state;
    } else {
      break;
    }
  }
  
  const passed = reachedStates.length === stages.length;
  const currentState = lastPassedState;
  const nextStateIndex = reachedStates.length;
  const nextState = nextStateIndex < stages.length ? stages[nextStateIndex].state : null;
  const feedback = passed ? '' : (stages[reachedStates.length]?.feedback || "Keep investigating the dataset.");
  
  return {
    passed,
    feedback,
    reachedStates,
    currentState,
    nextState
  };
}

export const genericValidators = {
  validateDataFrame,
  validateMultiStage
};
