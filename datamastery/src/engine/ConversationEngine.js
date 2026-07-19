/**
 * ConversationEngine — Manages typing effects, checkpoints, and mentor reactions.
 * Decouples dialogue flow logic from the React components.
 */

const DATAFRAME_STEP_DEFINITIONS = [
  {
    id: 'loaded',
    flag: 'checkLoaded',
    validator: 'loaded',
    mentor: (filename) => `Before we inspect anything, let's make sure ${filename} is loaded in your notebook.`,
    task: (filename) => `Load ${filename} using pandas.`,
    success: 'Great — the dataset loaded successfully.',
    explanation: 'Always verify a dataset loads before inspecting, cleaning, or analyzing it.',
  },
  {
    id: 'preview',
    flag: 'checkHead',
    validator: 'head',
    mentor: () => "Let's look inside.",
    task: () => 'Show the first five rows with `df.head()`.',
    success: 'Perfect. Now we can see what the data looks like.',
  },
  {
    id: 'shape',
    flag: 'checkShape',
    validator: 'shape',
    mentor: () => 'Now check the dataset dimensions.',
    task: () => 'Print `df.shape`.',
    success: 'Excellent — we know the exact size now.',
  },
  {
    id: 'columns',
    flag: 'checkColumns',
    validator: 'columns',
    mentor: () => "Next, let's confirm what fields are available.",
    task: () => 'Print the column names.',
    success: 'Nice — those are the fields we can work with.',
  },
  {
    id: 'dtypes',
    flag: 'checkDtypes',
    validator: 'dtypes',
    mentor: () => 'Now inspect how Pandas interpreted each column.',
    task: () => 'Check the data types with `df.dtypes` or `df.info()`.',
    success: 'Great — the detected data types are visible.',
  },
  {
    id: 'sample',
    flag: 'checkSample',
    validator: 'sample',
    mentor: () => "Let's avoid only trusting the top rows.",
    task: () => 'Pull a random sample of 5 rows from the dataset.',
    success: 'Much better — that gives us a less biased look.',
  },
  {
    id: 'describe',
    flag: 'checkDescribe',
    validator: 'describe',
    mentor: () => 'Now generate a quick statistical snapshot.',
    task: () => 'Run `df.describe()`.',
    success: 'Perfect — we have summary statistics now.',
  },
];

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const joinText = (...values) => values.flatMap(asArray).filter(Boolean).join('\n\n');

const getMissionValidation = (mission) => mission?.validation || mission?.validator || {};

/**
 * Convert legacy guided content into state-driven mentor steps without changing
 * validators, rewards, progress, hints, or mission completion semantics.
 */
export class ConversationEngine {
  /**
   * @param {object} options
   *   {
   *     addMessages: async (messages: string[], sender: string) => void,
   *     setMessages: (messages: array) => void,
   *     setPhase: (phase: string) => void,
   *     mentor: string,
   *     GUIDED_PHASE: object,
   *     CHALLENGE_PHASE: object
   *   }
   */
  constructor({ addMessages, setMessages, setPhase, mentor, GUIDED_PHASE, CHALLENGE_PHASE }) {
    this.addMessages = addMessages;
    this.setMessages = setMessages;
    this.setPhase = setPhase;
    this.mentor = mentor;
    this.GUIDED_PHASE = GUIDED_PHASE;
    this.CHALLENGE_PHASE = CHALLENGE_PHASE;
  }

  /**
   * Build normalized guided conversation steps.
   * Supports the new `conversation.steps` schema and safely adapts existing
   * legacy `situation/concept/task/resultReaction/resultExplanation` missions.
   */
  getGuidedSteps(mission) {
    if (!mission || mission.type === 'challenge') return [];

    const explicitSteps = mission.conversation?.steps;
    if (Array.isArray(explicitSteps) && explicitSteps.length > 0) {
      return explicitSteps.map((step, index) => this.normalizeExplicitStep(step, mission, index));
    }

    return this.buildLegacyGuidedSteps(mission);
  }

  normalizeExplicitStep(step, mission, index) {
    const fallbackId = `step-${index + 1}`;
    const fallbackSuccess = index === 0 ? 'Nice work — that step is complete.' : 'Perfect — that step is complete.';

    return {
      id: step.id || fallbackId,
      mentor: step.mentor || [],
      task: step.task || '',
      validator: step.validator,
      success: step.success || fallbackSuccess,
      explanation: step.explanation || '',
      scaffoldNote: step.scaffoldNote || null,
      next: step.next,
      missionValidator: getMissionValidation(mission),
    };
  }

  buildLegacyGuidedSteps(mission) {
    const conversation = mission.conversation || {};
    const validation = getMissionValidation(mission);
    const config = validation.config || {};
    const filename = mission.datasetCard?.filename || Object.keys(mission.datasets || {})[0] || 'the CSV file';
    const dataframeChecks = DATAFRAME_STEP_DEFINITIONS.filter((step) => config[step.flag]);
    const canSplitDataFrameChecks =
      (!validation.fn || validation.fn === 'validateDataFrame') && dataframeChecks.length > 1;

    if (canSplitDataFrameChecks) {
      const requiresPreviousMission = (mission.unlockRules?.requiresCompleted || mission.requires || []).length > 0;
      const firstActionIndex = dataframeChecks.findIndex((step) => step.id !== 'loaded');

      return dataframeChecks.map((definition, index) => {
        const isLoadStep = definition.id === 'loaded';
        const shouldUseLegacySituation =
          (index === 0 && !requiresPreviousMission) ||
          (requiresPreviousMission && index === firstActionIndex);
        const explanation = isLoadStep
          ? definition.explanation
          : joinText(
              conversation.concept?.explanation,
              conversation.concept?.why,
              conversation.resultExplanation
            );

        return {
          id: definition.id,
          mentor: shouldUseLegacySituation ? asArray(conversation.situation) : definition.mentor(filename),
          task: definition.task(filename),
          // The scaffold note only makes sense on the very first step, where
          // the starter code may already satisfy Maya's instruction.
          scaffoldNote: index === 0 ? (conversation.scaffoldNote || null) : null,
          validator: definition.validator,
          success: isLoadStep ? definition.success : (conversation.resultReaction || definition.success),
          explanation,
          missionValidator: validation,
        };
      });
    }

    const successMessages = asArray(conversation.success);
    const success = conversation.resultReaction || successMessages[0] || 'Great work — that step is complete.';
    const explanation = joinText(
      conversation.concept?.explanation,
      conversation.concept?.why,
      conversation.resultExplanation,
      successMessages.slice(1),
      mission.summary?.why
    );

    return [
      {
        id: 'task',
        mentor: asArray(conversation.situation),
        task: conversation.task || 'Complete this task in the editor, then run your code when you are ready.',
        validator: validation,
        success,
        explanation,
        missionValidator: validation,
      },
    ];
  }

  /**
   * Play the introductory conversation sequence for a mission.
   *
   * @param {object} mission - The current mission configuration
   * @param {object} progress - The current progress save object
   * @param {string} subLevelId - Current sub-level ID
   * @param {string} levelId - Current level ID
   * @param {array} levelsList - The list of all registered levels
   */
  async startMissionIntro(mission, progress, subLevelId, levelId, levelsList) {
    const isChallenge = mission.type === 'challenge';
    const mentor = mission.mentor || this.mentor;

    // 1. Generate memory greetings from previous task dynamically
    let memoryMessages = [];
    const prevId = this.getPreviousSubLevelId(levelsList, levelId, subLevelId);
    const levelProgress = progress?.levels?.[levelId];
    const prevProgress = prevId ? levelProgress?.subLevels?.[prevId] : null;

    if (prevProgress && prevProgress.completed) {
      if (prevProgress.hintsUsed === 0) {
        memoryMessages.push("I noticed you solved the previous task without any hints! Let's keep that streak going. 🧠");
      } else {
        memoryMessages.push('Good job working through that last data task.');
      }

      if (mission.conversation?.memoryText) {
        memoryMessages.push(mission.conversation.memoryText);
      }
    }

    // 2. Initialize messages list with an objective card or challenge mode alert banner
    const initialMessages = [];
    if (isChallenge) {
      initialMessages.push({
        id: 'challenge-card',
        sender: 'system',
        isChallengeNotification: true,
        text: 'Explore the dataset independently without step-by-step guidance. Standard hints are available, but each hint costs 20 DP.',
      });
    } else {
      initialMessages.push({
        id: 'mission-card',
        sender: 'system',
        isMissionCard: true,
        mission: {
          title: mission.title,
          subtitle: mission.subtitle,
          learningObjective: mission.learningObjective,
          estDuration: mission.estDuration,
        },
      });
    }
    this.setMessages(initialMessages);

    // 3. State-driven conversational phases with typing delays.
    // Guided missions now reveal exactly one active task, then wait for validation.
    if (!isChallenge) {
      this.setPhase(this.GUIDED_PHASE.SITUATION);
      const steps = this.getGuidedSteps(mission);
      await this.revealGuidedStep(steps[0], 0, steps.length, mentor, memoryMessages);
      this.setPhase(this.GUIDED_PHASE.ACTIVE);
    } else {
      this.setPhase(this.CHALLENGE_PHASE.SITUATION);
      const introMessages = [...memoryMessages];
      if (mission.conversation?.situation) {
        introMessages.push(...mission.conversation.situation);
      }
      if (introMessages.length > 0) {
        await this.addMessages(introMessages, mentor);
      }
      this.setPhase(this.CHALLENGE_PHASE.ACTIVE);
    }
  }

  async revealGuidedStep(step, index, total, mentor, prefixMessages = []) {
    if (!step) return;

    const messages = [...prefixMessages, ...asArray(step.mentor)].filter(Boolean);
    const taskLabel = index === 0 ? 'Your first task:' : 'Your next task:';
    const taskText = step.task || 'Complete this step, then run your code when you are ready.';
    messages.push(`${taskLabel}\n${taskText}`);

    // On the very first step, let the learner know the code is already
    // scaffolded so they understand why the instruction looks pre-completed.
    if (index === 0 && step.scaffoldNote) {
      messages.push(step.scaffoldNote);
    }

    if (messages.length > 0) {
      await this.addMessages(messages, mentor);
    }

    // Keep total in the signature for future progress affordances without
    // changing the external UI contract today.
    void total;
  }

  /**
   * Play feedback or reactions based on validation engine results.
   *
   * @param {object} mission - The mission configuration
   * @param {object} validationResult - Result from ValidationEngine
   * @param {function} interpolate - Text template interpolation function
   * @param {number} activeStepIndex - Current guided step index
   * @returns {{ stepPassed: boolean, missionComplete: boolean }}
   */
  async handleValidation(mission, validationResult, interpolate, activeStepIndex = 0) {
    const isChallenge = mission.type === 'challenge';
    const mentor = mission.mentor || this.mentor;

    if (!isChallenge) {
      const steps = this.getGuidedSteps(mission);
      const activeStep = steps[activeStepIndex] || steps[0];

      if (validationResult.passed) {
        this.setPhase(this.GUIDED_PHASE.RESULT_REACTION);
        const successMessages = asArray(activeStep?.success || mission.conversation?.resultReaction || 'Great work — that step is complete.')
          .map((message) => interpolate(message, validationResult.templateVars));
        await this.addMessages(successMessages, mentor);

        const explanationMessages = asArray(activeStep?.explanation)
          .filter(Boolean)
          .map((message) => interpolate(message, validationResult.templateVars));

        if (explanationMessages.length > 0) {
          this.setPhase(this.GUIDED_PHASE.RESULT_EXPLANATION);
          await this.addMessages(explanationMessages, mentor);
        }

        const nextStepIndex = activeStepIndex + 1;
        const nextStep = steps[nextStepIndex];
        if (nextStep) {
          this.setPhase(this.GUIDED_PHASE.TASK);
          await this.revealGuidedStep(nextStep, nextStepIndex, steps.length, mentor);
          this.setPhase(this.GUIDED_PHASE.ACTIVE);
          return { stepPassed: true, missionComplete: false };
        }

        this.setPhase(this.GUIDED_PHASE.COMPLETE);
        return { stepPassed: true, missionComplete: true };
      }

      // Feed failure feedback message, but do not reveal any future dialogue.
      if (validationResult.feedback) {
        await this.addMessages([validationResult.feedback], mentor);
      }
      return { stepPassed: false, missionComplete: false };
    }

    // Challenge Mode validation reactions
    if (validationResult.passed) {
      const finalState = validationResult.currentState;
      const response = mission.conversation.stateResponses?.[finalState] || 'Great job, the challenge is complete!';
      await this.addMessages([response], mentor);

      this.setPhase(this.CHALLENGE_PHASE.COMPLETE);
      return { stepPassed: true, missionComplete: true };
    } else if (validationResult.reachedStates && validationResult.reachedStates.length > 0) {
      // Multi-stage checkpoint reached
      const currentState = validationResult.currentState;
      const response = mission.conversation.stateResponses?.[currentState];
      if (response) {
        await this.addMessages([response], mentor);
      }
      return { stepPassed: true, missionComplete: false };
    }

    // No checkpoints advanced
    if (validationResult.feedback) {
      await this.addMessages([validationResult.feedback], mentor);
    }
    return { stepPassed: false, missionComplete: false };
  }

  /**
   * Helper to find the previous sub-level ID dynamically.
   */
  getPreviousSubLevelId(levelsList, levelId, subLevelId) {
    const level = levelsList.find(l => l.id === levelId);
    if (!level) return null;
    const idx = level.subLevels.findIndex(s => s.id === subLevelId);
    if (idx <= 0) return null;
    return level.subLevels[idx - 1].id;
  }

  getFriendlyErrorExplanation(error, userCode, mission) {
    const errorStr = String(error);
    let title = "⚠️ Analysis Exception";
    let explanation = "Python encountered an error trying to run your code.";
    let why = "This usually means something was typed incorrectly or reference names do not match.";
    let fix = "Review the line highlighted in the output exception details below.";
    
    if (errorStr.includes('FileNotFoundError')) {
      title = "📁 Dataset Missing (FileNotFoundError)";
      explanation = "Pandas could not find the file you requested.";
      why = "You specified a filename that does not exist in Pyodide's virtual filesystem.";
      fix = `Check that your filename matches exactly (e.g., '${mission?.datasetCard?.filename || 'customers.csv'}'). Use pd.read_csv('filename') with matching quotes.`;
    } else if (errorStr.includes('NameError')) {
      const match = errorStr.match(/name '(\w+)' is not defined/);
      const varName = match ? match[1] : 'variable';
      title = `🔍 Name Error (${varName} is Undefined)`;
      explanation = `The name '${varName}' is referenced but has not been defined.`;
      why = varName === 'pd' 
        ? "You forgot to import Pandas! Always include 'import pandas as pd' at the start of your notebook."
        : `You are calling '${varName}' before assigning it a value, or there's a spelling typo.`;
      fix = varName === 'pd'
        ? "Add 'import pandas as pd' at the very top of your cell."
        : `Verify that you defined '${varName}' (e.g., '${varName} = df...') and check for letter casing.`;
    } else if (errorStr.includes('AttributeError')) {
      const match = errorStr.match(/object has no attribute '(\w+)'/);
      const attrName = match ? match[1] : 'attribute';
      title = `⚙️ Attribute Error (Missing '${attrName}')`;
      explanation = `The object has no method or property named '${attrName}'.`;
      why = "You tried to call a function or check an attribute that does not exist on this object class.";
      fix = `Double check your spelling! For example, did you call '.shapes' instead of '.shape'? Note that properties like '.shape' do not require parentheses: use 'df.shape' instead of 'df.shape()'.`;
    } else if (errorStr.includes('TypeError')) {
      title = "⚡ Type Error (Incorrect Operation)";
      explanation = "The operation is invalid for this data type.";
      why = "You passed arguments of the wrong format, or tried to treat an attribute/property as a callable function.";
      fix = "Ensure you are using correct parentheses. For instance, do not add () to non-function properties.";
    } else if (errorStr.includes('SyntaxError')) {
      title = "✍️ Syntax Error (Invalid Code)";
      explanation = "Python could not parse the structure of your code.";
      why = "There is a grammatical typo, like an unclosed parenthesis, unbalanced quote, or mismatched bracket.";
      fix = "Look for missing commas between parameters, unclosed parenthesis `(`, or hanging quotation marks.";
    }

    return `### ${title}\n\n**What happened:** ${explanation}\n\n**Why it happened:** ${why}\n\n**💡 Hint to fix:** ${fix}`;
  }

  answerQuestion(questionText, userCode, activeError, mission, levelId) {
    const q = questionText.toLowerCase();

    // 1. If user is asking about an active error
    if (activeError && (q.includes('error') || q.includes('fail') || q.includes('wrong') || q.includes('problem') || q.includes('why'))) {
      return this.getFriendlyErrorExplanation(activeError, userCode, mission);
    }

    // 2. Specific conceptual questions
    if (q.includes('groupby') && (q.includes('nan') || q.includes('null') || q.includes('empty'))) {
      return "### 📊 Why is groupby returning NaN?\n\nWhen you call `.groupby()` followed by a mathematical aggregation like `.mean()` or `.sum()`, Pandas will calculate values for **numeric columns only**.\n\nIf your columns contain strings, dates, or non-numeric types, they might result in empty cells or `NaN` outputs. \n\n**💡 How to fix:**\n1. Ensure the columns you are aggregating contain numeric types.\n2. Filter for numeric columns first: `df.select_dtypes(include='number')`.\n3. Make sure you aren't grouping by the same column you are summing!";
    }

    if (q.includes('groupby')) {
      return "### 🔄 Explaining GroupBy\n\n`.groupby()` splits a DataFrame into groups based on some key, applies an aggregation function (like `mean()`, `sum()`, or `count()`), and combines the results.\n\n**Example:**\n```python\n# Calculate average spent per customer segment\ndf.groupby('segment')['spent'].mean()\n```\nHere, `'segment'` is the grouping key, `'spent'` is the column we want to analyze, and `.mean()` is the aggregation.";
    }

    if (q.includes('axis=1') || q.includes('axis = 1') || q.includes('axis')) {
      return "### 📐 Understanding Axes (axis=0 vs axis=1)\n\nIn Pandas, operations take place along an **axis**:\n- **`axis=0` (Rows)**: Operates *downward* vertically. For example, `df.mean(axis=0)` calculates the mean of each column across all rows.\n- **`axis=1` (Columns)**: Operates *sideways* horizontally. For example, `df.sum(axis=1)` calculates the sum of all columns for each specific row.\n\n**Memory Tip:** Think of `axis=1` as columns, running side-to-side.";
    }

    if (q.includes('merge') || q.includes('join')) {
      return "### 🔗 Merge vs Join in Pandas\n\n- **`pd.merge()`** is the most powerful and common way to combine DataFrames. It allows you to align rows on **any column** using the `on` parameter (e.g. `on='customer_id'`).\n- **`df.join()`** is a convenience method that merges DataFrames based on their **index** rather than arbitrary columns.\n\n**Example of Merge:**\n```python\nmerged_df = pd.merge(orders, customers, on='customer_id', how='inner')\n```";
    }

    if (q.includes('inplace')) {
      return "### 💾 What does inplace=True do?\n\nWhen you modify a DataFrame (like dropping columns or filling NAs), Pandas returns a **new copy** of the modified DataFrame by default.\n\nIf you specify `inplace=True`, Pandas modifies the **original** DataFrame directly and returns `None`.\n\n**Example:**\n```python\n# These two operations achieve the same result:\ndf.dropna(inplace=True)\n# is equivalent to:\ndf = df.dropna()\n```\n*Note: Modern Pandas best practices discourage using `inplace=True` because it can prevent method chaining.*";
    }

    // 3. Current mission hints / help
    if (q.includes('hint') || q.includes('help') || q.includes('solve') || q.includes('code') || q.includes('stuck') || q.includes('what to do')) {
      if (mission?.conversation?.hints && mission.conversation.hints.length > 0) {
        return `### 💡 Mission Clue\n\nHere is a hint to guide you through this step:\n\n${mission.conversation.hints[0]}`;
      }
      return `### 🎯 Lesson Objective\n\nFor this assignment, we are trying to:\n**${mission?.learningObjective || 'Complete the pandas operation'}**\n\nTry reading the objective panel on the left, check the attached database schema, and run code after editing.`;
    }

    // 4. Default helpful fallback response
    return `### 👋 Hello! I'm Maya, your AI mentor.\n\nI can help you analyze datasets, explain errors, and guide you through Pandas or NumPy operations.\n\n**Try asking me things like:**\n- *"Explain axis=1"* \n- *"Why am I getting a NameError?"*\n- *"What is the difference between merge and join?"*\n- *"What is pd.melt doing?"*\n\n**Current Objective:** ${mission?.learningObjective || 'Experiment in the workspace.'}`;
  }
}
