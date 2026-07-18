import { SaveSystem } from './SaveSystem.js';
import { RewardEngine } from './RewardEngine.js';
import { ProgressionEngine } from './ProgressionEngine.js';
import { ValidationEngine } from './ValidationEngine.js';
import { ConversationEngine } from './ConversationEngine.js';

const DATAFRAME_STEP_CONFIG = {
  loaded: ['checkLoaded'],
  head: ['checkLoaded', 'checkHead'],
  preview: ['checkLoaded', 'checkHead'],
  shape: ['checkLoaded', 'checkShape'],
  columns: ['checkLoaded', 'checkColumns'],
  dtypes: ['checkLoaded', 'checkDtypes'],
  types: ['checkLoaded', 'checkDtypes'],
  sample: ['checkLoaded', 'checkSample'],
  describe: ['checkLoaded', 'checkDescribe'],
  summary: ['checkLoaded', 'checkDescribe'],
};

const DATAFRAME_CHECK_KEYS = [
  'checkLoaded',
  'checkHead',
  'checkShape',
  'checkColumns',
  'checkDtypes',
  'checkSample',
  'checkDescribe',
];

/**
 * MissionEngine — Core orchestrator that manages a mission's state and execution lifecycle.
 * Coordinates between Pyodide, ValidationEngine, RewardEngine, ProgressionEngine, and ConversationEngine.
 */
export class MissionEngine {
  constructor({
    levelId,
    subLevelId,
    missionData,
    pyodide,
    levelsList,
    onStateUpdate, // Callback to sync state to UI: (stateUpdate) => void
    addMessages,   // UI addMessages function
    setMessages,   // UI setMessages function
    GUIDED_PHASE,
    CHALLENGE_PHASE,
  }) {
    this.levelId = levelId;
    this.subLevelId = subLevelId;
    this.level = missionData?.level;
    this.mission = missionData?.subLevel;
    this.pyodide = pyodide;
    this.levelsList = levelsList;
    this.onStateUpdate = onStateUpdate;
    this.attempts = 0;
    this.failedValidationAttempts = 0;
    this.activeGuidedStepIndex = 0;

    const mentor = this.mission?.mentor || this.level?.mentor || 'maya';

    this.conversationEngine = new ConversationEngine({
      addMessages,
      setMessages,
      setPhase: (phase) => this.updateUIState({ phase }),
      mentor,
      GUIDED_PHASE,
      CHALLENGE_PHASE,
    });
  }

  /**
   * Helper to notify UI of state updates.
   */
  updateUIState(newState) {
    if (this.onStateUpdate) {
      this.onStateUpdate(newState);
    }
  }

  getMissionValidation() {
    return this.mission?.validation || this.mission?.validator || {};
  }

  getActiveGuidedStep() {
    const steps = this.conversationEngine.getGuidedSteps(this.mission);
    return steps[this.activeGuidedStepIndex] || steps[0] || null;
  }

  resolveStepValidation(step) {
    const missionValidation = this.getMissionValidation();

    if (!step) return missionValidation;

    if (typeof step.validator === 'string') {
      const flags = DATAFRAME_STEP_CONFIG[step.validator];
      if (flags) {
        const baseConfig = missionValidation.config || {};
        const stepConfig = { ...baseConfig };

        // A sequential step should validate only the active checkpoint while
        // preserving supporting config like feedback text and required columns.
        DATAFRAME_CHECK_KEYS.forEach((key) => {
          stepConfig[key] = flags.includes(key);
        });

        return {
          fn: missionValidation.fn === 'validateDataFrame' ? missionValidation.fn : 'validateDataFrame',
          config: stepConfig,
        };
      }

      return {
        fn: step.validator,
        config: missionValidation.config || {},
      };
    }

    if (step.validator && typeof step.validator === 'object') {
      return {
        fn: step.validator.fn || missionValidation.fn,
        config: {
          ...(missionValidation.config || {}),
          ...(step.validator.config || {}),
        },
      };
    }

    return missionValidation;
  }

  /**
   * Load datasets for the current mission.
   */
  async loadDatasets(engineInstance) {
    if (!this.mission || !this.pyodide.isReady) return;

    this.updateUIState({ datasetsLoaded: false });

    // Generate CSVs dynamically using DatasetEngine and learner seed
    const csvMap = engineInstance.generateForMission(
      this.mission.datasets,
      `${this.levelId}-${this.subLevelId}`
    );

    const fileEntries = Object.entries(csvMap).map(([name, content]) => ({
      name,
      content,
    }));

    await this.pyodide.loadDatasets(fileEntries);
    this.updateUIState({ datasetsLoaded: true });
  }

  /**
   * Start the introductory dialogue flow.
   */
  async startIntro() {
    if (!this.mission) return;
    this.activeGuidedStepIndex = 0;
    const progress = SaveSystem.getProgress();
    await this.conversationEngine.startMissionIntro(
      this.mission,
      progress,
      this.subLevelId,
      this.levelId,
      this.levelsList
    );
  }

  /**
   * Execute code written by the user and validate results.
   */
  async runAndValidate(codeToRun, hintsUsed, interpolate) {
    if (!this.pyodide.isReady || !this.mission) return null;

    this.attempts += 1;
    this.updateUIState({
      output: { stdout: '', stderr: '', error: null, stateDelta: null },
    });

    // Single source of truth for execution: the code is run exactly once here.
    // The Run button delegates to this method rather than re-running the code
    // itself, so we never execute the learner's code twice.
    const result = await this.pyodide.runCode(codeToRun);

    if (result.error) {
      if (this.mission.type === 'guided') {
        this.failedValidationAttempts += 1;
      }
      this.updateUIState({
        output: {
          stdout: result.stdout || '',
          stderr: result.stderr || '',
          error: result.error,
          stateDelta: result.stateDelta || null,
        },
      });
      return result;
    }

    this.updateUIState({
      output: {
        stdout: result.stdout,
        stderr: result.stderr,
        error: null,
        stateDelta: result.stateDelta || null,
      },
    });

    const activeStep = this.mission.type === 'guided' ? this.getActiveGuidedStep() : null;
    const validation = this.mission.type === 'guided'
      ? this.resolveStepValidation(activeStep)
      : this.getMissionValidation();

    // Run semantic validation. The validation engine remains the single source
    // of truth; guided steps only change which existing validator/config is
    // active at this moment in the mentor conversation.
    const validationResult = await ValidationEngine.validate(
      validation.fn,
      {
        stdout: result.stdout,
        stderr: result.stderr,
        variables: result.variables,
      },
      {
        type: this.mission.type,
        config: validation?.config,
        pyodide: this.pyodide,
        code: codeToRun,
      }
    );

    // Run dialogue reaction
    const flowResult = await this.conversationEngine.handleValidation(
      this.mission,
      validationResult,
      interpolate,
      this.activeGuidedStepIndex
    );

    if (this.mission.type === 'guided' && !flowResult.stepPassed) {
      this.failedValidationAttempts += 1;
    }

    if (this.mission.type === 'guided' && flowResult.stepPassed && !flowResult.missionComplete) {
      this.activeGuidedStepIndex += 1;
      return result;
    }

    if (flowResult.missionComplete) {
      const rewardAttempts = this.mission.type === 'guided'
        ? this.failedValidationAttempts + 1
        : this.attempts;

      // 1. Calculate Rewards using RewardEngine
      const rewards = RewardEngine.calculateRewards(this.mission.rewards || this.mission.points, {
        hintsUsed,
        attempts: rewardAttempts,
        isChallenge: this.mission.type === 'challenge',
      });

      // 2. Load progress & compute new unlocks using ProgressionEngine
      const progress = SaveSystem.getProgress() || ProgressionEngine.initializeProgress(this.levelsList);
      
      const newlyUnlocked = ProgressionEngine.completeSubLevel(
        progress,
        this.level,
        this.subLevelId,
        rewards.earnedDP,
        hintsUsed,
        codeToRun,
        this.levelsList,
        rewardAttempts
      );

      // 3. Save progress via SaveSystem
      SaveSystem.saveProgress(progress);
      SaveSystem.saveCode(this.levelId, this.subLevelId, codeToRun);

      const levelCompleted = progress.levels[this.levelId].status === 'completed';

      this.updateUIState({ 
        earnedDP: rewards.earnedDP,
        levelCompleted,
        newlyUnlocked
      });
    } else if (validationResult.reachedStates && validationResult.reachedStates.length > 0) {
      // Challenge Mode intermediate progression
      const progress = SaveSystem.getProgress() || ProgressionEngine.initializeProgress(this.levelsList);
      
      validationResult.reachedStates.forEach((state) => {
        ProgressionEngine.updateChallengeState(progress, this.levelId, this.subLevelId, state);
      });

      SaveSystem.saveProgress(progress);
      this.updateUIState({
        challengeStatesReached: progress.levels[this.levelId].challengeStates[this.subLevelId].reachedStates,
      });
    }

    return result;
  }
}
export default MissionEngine;
