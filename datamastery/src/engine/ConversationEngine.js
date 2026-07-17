/**
 * ConversationEngine — Manages typing effects, checkpoints, and reactions.
 * Decouples dialogue flow logic from the React components.
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
        memoryMessages.push("Good job working through that last data task.");
      }

      if (mission.conversation.memoryText) {
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
        text: `Explore the dataset independently without step-by-step guidance. Standard hints are available, but each hint costs 20 DP.`
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
          estDuration: mission.estDuration
        }
      });
    }
    this.setMessages(initialMessages);

    // 3. Sequential conversational phases with typing delays
    if (!isChallenge) {
      this.setPhase(this.GUIDED_PHASE.SITUATION);
      const introMessages = [...memoryMessages];
      if (mission.conversation.situation) {
        introMessages.push(...mission.conversation.situation);
      }
      if (introMessages.length > 0) {
        await this.addMessages(introMessages, mentor);
      }

      this.setPhase(this.GUIDED_PHASE.CONCEPT);
      const concept = mission.conversation.concept;
      if (concept) {
        await this.addMessages([concept.explanation, concept.why], mentor);
      }

      this.setPhase(this.GUIDED_PHASE.TASK);
      if (mission.conversation.task) {
        await this.addMessages([mission.conversation.task], mentor);
      }

      this.setPhase(this.GUIDED_PHASE.ACTIVE);
    } else {
      this.setPhase(this.CHALLENGE_PHASE.SITUATION);
      const introMessages = [...memoryMessages];
      if (mission.conversation.situation) {
        introMessages.push(...mission.conversation.situation);
      }
      if (introMessages.length > 0) {
        await this.addMessages(introMessages, mentor);
      }
      this.setPhase(this.CHALLENGE_PHASE.ACTIVE);
    }
  }

  /**
   * Play feedback or reactions based on validation engine results.
   *
   * @param {object} mission - The mission configuration
   * @param {object} validationResult - Result from ValidationEngine
   * @param {function} interpolate - Text template interpolation function
   */
  async handleValidation(mission, validationResult, interpolate) {
    const isChallenge = mission.type === 'challenge';
    const mentor = mission.mentor || this.mentor;

    if (!isChallenge) {
      if (validationResult.passed) {
        this.setPhase(this.GUIDED_PHASE.RESULT_REACTION);
        const reaction = interpolate(
          mission.conversation.resultReaction,
          validationResult.templateVars
        );
        await this.addMessages([reaction], mentor);

        this.setPhase(this.GUIDED_PHASE.RESULT_EXPLANATION);
        const explanation = interpolate(
          mission.conversation.resultExplanation,
          validationResult.templateVars
        );
        await this.addMessages([explanation], mentor);

        this.setPhase(this.GUIDED_PHASE.COMPLETE);
        return true;
      } else {
        // Feed failure feedback message
        await this.addMessages([validationResult.feedback], mentor);
        return false;
      }
    } else {
      // Challenge Mode validation reactions
      if (validationResult.passed) {
        const finalState = validationResult.currentState;
        const response = mission.conversation.stateResponses?.[finalState] || "Great job, the challenge is complete!";
        await this.addMessages([response], mentor);

        this.setPhase(this.CHALLENGE_PHASE.COMPLETE);
        return true;
      } else if (validationResult.reachedStates && validationResult.reachedStates.length > 0) {
        // Multi-stage checkpoint reached
        const currentState = validationResult.currentState;
        const response = mission.conversation.stateResponses?.[currentState];
        if (response) {
          await this.addMessages([response], mentor);
        }
        return false;
      } else {
        // No checkpoints advanced
        await this.addMessages([validationResult.feedback], mentor);
        return false;
      }
    }
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
