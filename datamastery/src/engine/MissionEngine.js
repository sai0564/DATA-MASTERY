import { SaveSystem } from './SaveSystem.js';
import { RewardEngine } from './RewardEngine.js';
import { ProgressionEngine } from './ProgressionEngine.js';
import { ValidationEngine } from './ValidationEngine.js';
import { ConversationEngine } from './ConversationEngine.js';

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
    if (!this.pyodide.isReady || !this.mission) return;

    this.attempts += 1;
    this.updateUIState({
      output: { stdout: '', stderr: '', error: null },
    });

    const result = await this.pyodide.runCode(codeToRun);

    if (result.error) {
      this.updateUIState({
        output: { stdout: result.stdout || '', stderr: result.stderr || '', error: result.error },
      });
      return;
    }

    this.updateUIState({
      output: { stdout: result.stdout, stderr: result.stderr, error: null },
    });

    // Run semantic validation
    const validationResult = ValidationEngine.validate(
      this.mission.validation.fn,
      {
        stdout: result.stdout,
        stderr: result.stderr,
        variables: result.variables,
      },
      {
        type: this.mission.type,
        config: this.mission.validation?.config,
      }
    );

    // Run dialogue reaction
    const passed = await this.conversationEngine.handleValidation(
      this.mission,
      validationResult,
      interpolate
    );

    if (passed) {
      // 1. Calculate Rewards using RewardEngine
      const rewards = RewardEngine.calculateRewards(this.mission.points, {
        hintsUsed,
        attempts: this.attempts,
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
        this.attempts
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
  }
}
export default MissionEngine;
