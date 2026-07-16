import { POINTS } from '../utils/constants.js';

/**
 * RewardEngine — Manages calculations of Data Points (DP) and bonuses.
 * Ensures reward logic is decoupled and data-driven.
 */
export const RewardEngine = {
  /**
   * Calculate earned points and detailed breakdown for a mission completion.
   *
   * @param {object} pointsConfig - Mission points configuration (e.g. mission.points)
   *   Supports: { base, bonus, firstTry, noHint, challenge, levelCompletion }
   * @param {object} learnerMetrics - Metrics of how the user solved the mission
   *   Supports: { hintsUsed: number, attempts: number, isChallenge: boolean }
   * @returns {object} { earnedDP: number, breakdown: object }
   */
  calculateRewards(pointsConfig = {}, learnerMetrics = {}) {
    const {
      hintsUsed = 0,
      attempts = 1,
      isChallenge = false
    } = learnerMetrics;

    // Fallbacks to handle missions missing explicit sub-rewards
    const base = pointsConfig.base !== undefined ? pointsConfig.base : (isChallenge ? POINTS.CHALLENGE_BASE : POINTS.GUIDED_BASE);
    const bonus = pointsConfig.bonus !== undefined ? pointsConfig.bonus : (isChallenge ? POINTS.CHALLENGE_BONUS : POINTS.GUIDED_BONUS);
    
    // Additional bonuses
    const firstTryBonus = (attempts === 1 && pointsConfig.firstTry !== undefined) ? pointsConfig.firstTry : 0;
    const noHintBonus = (hintsUsed === 0 && pointsConfig.noHint !== undefined) ? pointsConfig.noHint : (hintsUsed === 0 ? bonus : 0);
    const challengeBonus = (isChallenge && pointsConfig.challenge !== undefined) ? pointsConfig.challenge : 0;
    const levelCompletionBonus = pointsConfig.levelCompletion !== undefined ? pointsConfig.levelCompletion : 0;

    // Penalty logic (default from constants if not overridden in pointsConfig.hintPenalty)
    const penaltyRate = pointsConfig.hintPenalty !== undefined ? pointsConfig.hintPenalty : POINTS.HINT_PENALTY;
    const hintPenalty = hintsUsed * penaltyRate;

    // Sum details
    const earnedDP = Math.max(0, base + noHintBonus + firstTryBonus + challengeBonus + levelCompletionBonus - hintPenalty);

    return {
      earnedDP,
      breakdown: {
        base,
        noHintBonus,
        firstTryBonus,
        challengeBonus,
        levelCompletionBonus,
        hintPenalty,
      }
    };
  }
};
