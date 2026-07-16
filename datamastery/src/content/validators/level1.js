/**
 * Validators for Level 1: First Week at NovaMetrics
 *
 * Each validator is a function that receives:
 *   { stdout, stderr, variables, error }
 * and returns:
 *   { passed: boolean, feedback: string, templateVars?: object, reachedStates?: string[], currentState?: string, nextState?: string }
 */

// ─── 1.1 — Your First Dataset ──────────────────────────────────────
export function validateHead({ stdout, variables }) {
  const hasCustomerColumns =
    stdout.includes('customer_id') ||
    stdout.includes('first_name') ||
    stdout.includes('email');

  if (hasCustomerColumns) {
    return { passed: true, feedback: '' };
  }

  if (variables.df && variables.df.type === 'DataFrame') {
    return {
      passed: false,
      feedback: "You've loaded the data — now show the first few rows. Try calling head() on the DataFrame.",
    };
  }

  return {
    passed: false,
    feedback: "Load the CSV file with pd.read_csv() and then use head() to show the first rows.",
  };
}

// ─── 1.2 — How Big Is This File? ───────────────────────────────────
export function validateShape({ stdout, variables }) {
  const shapeMatch = stdout.match(/\(?\s*(\d+)\s*,\s*(\d+)\s*\)?/);
  if (shapeMatch) {
    const rows = parseInt(shapeMatch[1], 10);
    const cols = parseInt(shapeMatch[2], 10);
    return {
      passed: true,
      feedback: '',
      templateVars: { shape_0: rows, shape_1: cols },
    };
  }

  if (variables.df && variables.df.type === 'DataFrame') {
    const [rows, cols] = variables.df.shape;
    if (stdout.includes(String(rows))) {
      return {
        passed: true,
        feedback: '',
        templateVars: { shape_0: rows, shape_1: cols },
      };
    }
    return {
      passed: false,
      feedback: "You have the DataFrame loaded. Now check its shape — try printing df.shape.",
    };
  }

  return {
    passed: false,
    feedback: "Load the data first, then check how many rows and columns it has.",
  };
}

// ─── 1.3 — What Fields Are We Tracking? ─────────────────────────────
export function validateColumns({ stdout, variables }) {
  const hasColumns =
    stdout.includes('customer_id') &&
    (stdout.includes('first_name') || stdout.includes('email') || stdout.includes('age'));

  if (hasColumns) {
    return { passed: true, feedback: '' };
  }

  if (variables.df && variables.df.type === 'DataFrame') {
    return {
      passed: false,
      feedback: "The DataFrame is loaded. Try printing df.columns to see the field names.",
    };
  }

  return {
    passed: false,
    feedback: "Load the data and show the column names.",
  };
}

// ─── 1.4 — What Types Did Pandas Detect? ────────────────────────────
export function validateDtypes({ stdout }) {
  const hasDtypeInfo =
    stdout.includes('int64') ||
    stdout.includes('float64') ||
    stdout.includes('object') ||
    stdout.includes('dtype');

  if (hasDtypeInfo) {
    return { passed: true, feedback: '' };
  }

  return {
    passed: false,
    feedback: "Check the data types — try df.dtypes or df.info().",
  };
}

// ─── 1.5 — Don't Only Look at the Top ──────────────────────────────
export function validateTailSample({ stdout }) {
  const hasCustomerData = stdout.includes('customer_id') || stdout.includes('CUST-');
  const tableBlocks = (stdout.match(/customer_id/g) || []).length;

  if (hasCustomerData && tableBlocks >= 2) {
    return { passed: true, feedback: '' };
  }

  if (hasCustomerData) {
    return {
      passed: false,
      feedback: "Good — you showed some data. Maya asked for both the last rows (tail) and a random sample. Try both.",
    };
  }

  return {
    passed: false,
    feedback: "Show the last few rows with tail() and a random sample with sample(5).",
  };
}

// ─── 1.6 — Give Me the Quick Picture ────────────────────────────────
export function validateDescribe({ stdout }) {
  const hasStats =
    (stdout.includes('mean') || stdout.includes('avg')) &&
    (stdout.includes('min') || stdout.includes('max') || stdout.includes('std'));

  if (hasStats) {
    return { passed: true, feedback: '' };
  }

  if (stdout.includes('count')) {
    return {
      passed: false,
      feedback: "Close — you're getting some stats. Try df.describe() for the full statistical summary.",
    };
  }

  return {
    passed: false,
    feedback: "Generate a statistical summary of the dataset. Try df.describe().",
  };
}

// ─── 1.7 — First Week Review (LEVEL CHALLENGE) ─────────────────────
export function validateFirstWeekChallenge({ stdout, variables }) {
  const reachedStates = [];

  const hasDataFrame = Object.values(variables).some(
    v => v.type === 'DataFrame'
  );
  if (hasDataFrame) {
    reachedStates.push('loaded');
  }

  const shapePattern = /\(\s*\d+\s*,\s*\d+\s*\)/;
  if (shapePattern.test(stdout) || stdout.includes('shape') || stdout.includes('500')) {
    reachedStates.push('checked-size');
  }

  const hasColumnsOutput =
    stdout.includes('customer_id') ||
    stdout.includes('columns') ||
    stdout.includes('first_name');
  if (hasColumnsOutput) {
    reachedStates.push('checked-columns');
  }

  const hasDtypes =
    stdout.includes('int64') ||
    stdout.includes('float64') ||
    stdout.includes('object') ||
    stdout.includes('dtype');
  if (hasDtypes) {
    reachedStates.push('checked-types');
  }

  const hasSummary =
    stdout.includes('mean') &&
    (stdout.includes('std') || stdout.includes('min') || stdout.includes('max'));
  if (hasSummary) {
    reachedStates.push('summarized');
  }

  const stateOrder = ['loaded', 'checked-size', 'checked-columns', 'checked-types', 'summarized'];
  const highestIdx = stateOrder.reduce((max, state, idx) => {
    return reachedStates.includes(state) ? idx : max;
  }, -1);

  if (highestIdx === stateOrder.length - 1) {
    return {
      passed: true,
      feedback: '',
      reachedStates,
      currentState: 'summarized',
    };
  }

  if (highestIdx >= 0) {
    const currentState = stateOrder[highestIdx];
    const nextState = stateOrder[highestIdx + 1];
    const nextHints = {
      'loaded': "You loaded the data. What else do you need to know about this file?",
      'checked-size': "You know the size. What about the column names?",
      'checked-columns': "You have the columns. What types did Pandas detect?",
      'checked-types': "Types are checked. Can you get a statistical summary?",
    };

    return {
      passed: false,
      feedback: nextHints[currentState] || "Keep investigating the dataset.",
      reachedStates,
      currentState,
      nextState,
    };
  }

  return {
    passed: false,
    feedback: "Start by loading the CSV file with pd.read_csv().",
    reachedStates: [],
    currentState: null,
  };
}

export const level1Validators = {
  validateHead,
  validateShape,
  validateColumns,
  validateDtypes,
  validateTailSample,
  validateDescribe,
  validateFirstWeekChallenge,
};
