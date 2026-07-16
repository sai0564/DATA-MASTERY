/**
 * ConversationEngine — Manages typing effects, checkpoints, and reactions.
 * Decouples dialogue flow logic from the React components.
 */
export class ConversationEngine {
  /**
   * @param {object} options
   *   {
   *     addMessages: async (messages: string[], sender: string) => void,
   *     setPhase: (phase: string) => void,
   *     mentor: string,
   *     GUIDED_PHASE: object,
   *     CHALLENGE_PHASE: object
   *   }
   */
  constructor({ addMessages, setPhase, mentor, GUIDED_PHASE, CHALLENGE_PHASE }) {
    this.addMessages = addMessages;
    this.setPhase = setPhase;
    this.mentor = mentor;
    this.GUIDED_PHASE = GUIDED_PHASE;
    this.CHALLENGE_PHASE = CHALLENGE_PHASE;
  }

  /**
   * Play the introductory conversation sequence for a mission.
   *
   * @param {object} mission - The mission configuration
   */
  async startMissionIntro(mission) {
    const isChallenge = mission.type === 'challenge';

    if (!isChallenge) {
      // 1. Situation Phase
      this.setPhase(this.GUIDED_PHASE.SITUATION);
      if (mission.conversation.situation) {
        await this.addMessages(mission.conversation.situation, this.mentor);
      }

      // 2. Concept Phase
      this.setPhase(this.GUIDED_PHASE.CONCEPT);
      const concept = mission.conversation.concept;
      if (concept) {
        await this.addMessages([concept.explanation, concept.why], this.mentor);
      }

      // 3. Task Phase
      this.setPhase(this.GUIDED_PHASE.TASK);
      if (mission.conversation.task) {
        await this.addMessages([mission.conversation.task], this.mentor);
      }

      // 4. Activate Editor Checkpoint
      this.setPhase(this.GUIDED_PHASE.ACTIVE);
    } else {
      // Challenge Mode
      this.setPhase(this.CHALLENGE_PHASE.SITUATION);
      if (mission.conversation.situation) {
        await this.addMessages(mission.conversation.situation, this.mentor);
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

    if (!isChallenge) {
      if (validationResult.passed) {
        this.setPhase(this.GUIDED_PHASE.RESULT_REACTION);
        const reaction = interpolate(
          mission.conversation.resultReaction,
          validationResult.templateVars
        );
        await this.addMessages([reaction], this.mentor);

        this.setPhase(this.GUIDED_PHASE.RESULT_EXPLANATION);
        const explanation = interpolate(
          mission.conversation.resultExplanation,
          validationResult.templateVars
        );
        await this.addMessages([explanation], this.mentor);

        this.setPhase(this.GUIDED_PHASE.COMPLETE);
        return true;
      } else {
        // Feed validator failure message
        await this.addMessages([validationResult.feedback], this.mentor);
        return false;
      }
    } else {
      // Challenge Mode validation reactions
      if (validationResult.passed) {
        const finalState = validationResult.currentState;
        const response = mission.conversation.stateResponses?.[finalState] || "Great job, the challenge is complete!";
        await this.addMessages([response], this.mentor);

        this.setPhase(this.CHALLENGE_PHASE.COMPLETE);
        return true;
      } else if (validationResult.reachedStates && validationResult.reachedStates.length > 0) {
        // Multi-stage checkpoint reached
        const currentState = validationResult.currentState;
        const response = mission.conversation.stateResponses?.[currentState];
        if (response) {
          await this.addMessages([response], this.mentor);
        }
        return false;
      } else {
        // No checkpoints advanced
        await this.addMessages([validationResult.feedback], this.mentor);
        return false;
      }
    }
  }
}
