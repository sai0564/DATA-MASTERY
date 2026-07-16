// Application-wide constants

export const APP_NAME = 'DataMastery';
export const APP_TAGLINE = 'Master Data Analysis Through Real Workplace Challenges';
export const COMPANY_NAME = 'NovaMetrics';

// Mentors
export const MENTORS = {
  maya: {
    id: 'maya',
    name: 'Maya',
    role: 'Senior Data Analyst',
    emoji: '👩‍💻',
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    role: 'Senior Data Scientist',
    emoji: '👨‍🔬',
  },
};

// Mission types
export const MISSION_TYPE = {
  GUIDED: 'guided',
  CHALLENGE: 'challenge',
};

// Level statuses
export const LEVEL_STATUS = {
  LOCKED: 'locked',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

// Sub-level statuses
export const SUBLEVEL_STATUS = {
  LOCKED: 'locked',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

// Hint types — structured per mission type
export const HINT_TYPE = {
  // Guided sub-level hints
  TASK_REMINDER: 'taskReminder',
  CONCEPT_REMINDER: 'conceptReminder',
  SYNTAX_CLUE: 'syntaxClue',
  // Level challenge hints
  WORKPLACE_THINKING: 'workplaceThinking',
  ANALYTICAL_DIRECTION: 'analyticalDirection',
  METHOD_CLUE: 'methodClue',
};

// Points system
export const POINTS = {
  GUIDED_BASE: 50,
  GUIDED_BONUS: 10,
  CHALLENGE_BASE: 100,
  CHALLENGE_BONUS: 50,
  HINT_PENALTY: 20,
};

// localStorage keys
export const STORAGE_KEYS = {
  PROGRESS: 'datamastery_progress',
  LEARNER_SEED: 'datamastery_seed',
  PLAYGROUND: 'datamastery_playground',
  SETTINGS: 'datamastery_settings',
  DATASET_CACHE: 'datamastery_datasets',
};

// Pyodide CDN URL
export const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';

// Routes
export const ROUTES = {
  LANDING: '/',
  DASHBOARD: '/dashboard',
  LEVEL: '/level/:levelId',
  SUBLEVEL: '/level/:levelId/:subLevelId',
  PLAYGROUND: '/playground',
};

// How many hints per mission
export const MAX_HINTS = 3;

// Conversation phases for guided sub-levels
export const GUIDED_PHASE = {
  LOADING: 'loading',
  SITUATION: 'situation',
  CONCEPT: 'concept',
  TASK: 'task',
  ACTIVE: 'active',
  RESULT_REACTION: 'result-reaction',
  RESULT_EXPLANATION: 'result-explanation',
  COMPLETE: 'complete',
};

// Conversation phases for level challenges
export const CHALLENGE_PHASE = {
  LOADING: 'loading',
  SITUATION: 'situation',
  ACTIVE: 'active',
  STATE_RESPONSE: 'state-response',
  COMPLETE: 'complete',
};
