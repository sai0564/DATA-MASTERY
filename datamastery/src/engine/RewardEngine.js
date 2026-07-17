import { POINTS } from '../utils/constants.js';

/**
 * RewardEngine — Manages calculations of Data Points (DP) and bonuses.
 * Ensures reward logic is decoupled and data-driven.
 */
export const RewardEngine = {
  /**
   * Calculate earned points and detailed breakdown for a mission completion.
   *
   * @param {object} pointsConfig - Mission rewards configuration
   * @param {object} learnerMetrics - Metrics of how the user solved the mission
   * @returns {object} { earnedDP: number, breakdown: object }
   */
  calculateRewards(pointsConfig = {}, learnerMetrics = {}) {
    const {
      hintsUsed = 0,
      attempts = 1,
      isChallenge = false,
      isLevelCompletion = false
    } = learnerMetrics;

    // Resolve base and bonus configuration values (support both naming conventions)
    const base = pointsConfig.base !== undefined 
      ? pointsConfig.base 
      : (pointsConfig.basePoints !== undefined 
          ? pointsConfig.basePoints 
          : (isChallenge ? POINTS.CHALLENGE_BASE : POINTS.GUIDED_BASE));

    const bonus = pointsConfig.bonus !== undefined 
      ? pointsConfig.bonus 
      : (pointsConfig.bonusPoints !== undefined 
          ? pointsConfig.bonusPoints 
          : (isChallenge ? POINTS.CHALLENGE_BONUS : POINTS.GUIDED_BONUS));

    // Resolve specific bonuses (default to 0 if not defined and not applicable)
    const firstTry = pointsConfig.firstTry !== undefined 
      ? pointsConfig.firstTry 
      : (pointsConfig.firstTryBonus !== undefined ? pointsConfig.firstTryBonus : 15);

    const noHint = pointsConfig.noHint !== undefined 
      ? pointsConfig.noHint 
      : (pointsConfig.noHintBonus !== undefined ? pointsConfig.noHintBonus : 10);

    const challenge = pointsConfig.challenge !== undefined 
      ? pointsConfig.challenge 
      : (pointsConfig.challengeBonus !== undefined ? pointsConfig.challengeBonus : 25);

    const levelCompletion = pointsConfig.levelCompletion !== undefined 
      ? pointsConfig.levelCompletion 
      : (pointsConfig.levelCompletionBonus !== undefined ? pointsConfig.levelCompletionBonus : 100);

    // Apply bonuses based on metrics
    const firstTryBonus = (attempts === 1) ? firstTry : 0;
    const noHintBonus = (hintsUsed === 0) ? noHint : 0;
    const challengeBonus = isChallenge ? challenge : 0;
    const levelCompletionBonus = isLevelCompletion ? levelCompletion : 0;

    // Penalty logic
    const penaltyRate = pointsConfig.hintPenalty !== undefined ? pointsConfig.hintPenalty : POINTS.HINT_PENALTY;
    const hintPenalty = hintsUsed * penaltyRate;

    // Sum details
    const earnedDP = Math.max(0, base + bonus + firstTryBonus + noHintBonus + challengeBonus + levelCompletionBonus - hintPenalty);

    return {
      earnedDP,
      breakdown: {
        base,
        bonus,
        firstTryBonus,
        noHintBonus,
        challengeBonus,
        levelCompletionBonus,
        hintPenalty,
      }
    };
  }
};
