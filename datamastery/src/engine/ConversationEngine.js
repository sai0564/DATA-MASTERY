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
}
