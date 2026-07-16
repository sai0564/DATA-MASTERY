/**
 * Progress Store — Manages state delegation to SaveSystem, RewardEngine, and ProgressionEngine.
 */
import { levels } from '../content/levelRegistry.js';
import { SaveSystem } from '../engine/SaveSystem.js';
import { ProgressionEngine } from '../engine/ProgressionEngine.js';
import { RewardEngine } from '../engine/RewardEngine.js';

/**
 * Load progress. Delegates to SaveSystem.
 */
export function loadProgress() {
  const progress = SaveSystem.getProgress();
  if (progress) {
    if (!progress.achievements) {
      progress.achievements = {
        'first-run': { unlocked: false, unlockedAt: null },
        'no-hints': { unlocked: false, unlockedAt: null },
        'perfect-week': { unlocked: false, unlockedAt: null },
        'performance-review': { unlocked: false, unlockedAt: null },
        'fast-learner': { unlocked: false, unlockedAt: null },
        'curious-analyst': { unlocked: false, unlockedAt: null }
      };
      SaveSystem.saveProgress(progress);
    }
    return progress;
  }
  return initializeProgress();
}

/**
 * Initialize progress structure for all known levels.
 */
export function initializeProgress() {
  const progress = ProgressionEngine.initializeProgress(levels);
  SaveSystem.saveProgress(progress);
  return progress;
}

/**
 * Save progress. Delegates to SaveSystem.
 */
export function saveProgress(progress) {
  SaveSystem.saveProgress(progress);
}

/**
 * Complete a sub-level.
 */
export function completeSubLevel(levelId, subLevelId, hintsUsed, code, attempts = 1) {
  const progress = loadProgress();
  const level = levels.find((l) => l.id === levelId);
  const subLevel = level?.subLevels.find((s) => s.id === subLevelId);

  if (!level || !subLevel) return { progress, newlyUnlocked: [] };

  // Calculate rewards using RewardEngine
  const rewards = RewardEngine.calculateRewards(subLevel.points || subLevel.rewards, {
    hintsUsed,
    attempts,
    isChallenge: subLevel.type === 'challenge',
  });

  // Modify progress using ProgressionEngine
  const newlyUnlocked = ProgressionEngine.completeSubLevel(
    progress,
    level,
    subLevelId,
    rewards.earnedDP,
    hintsUsed,
    code,
    levels,
    attempts
  );

  SaveSystem.saveProgress(progress);
  SaveSystem.saveCode(levelId, subLevelId, code);

  return { progress, newlyUnlocked };
}

/**
 * Update challenge intermediate state.
 */
export function updateChallengeState(levelId, subLevelId, newState) {
  const progress = loadProgress();
  ProgressionEngine.updateChallengeState(progress, levelId, subLevelId, newState);
  SaveSystem.saveProgress(progress);
  return progress;
}

/**
 * Get the current sub-level status.
 */
export function getSubLevelStatus(levelId, subLevelId) {
  const progress = loadProgress();
  return ProgressionEngine.isSubLevelUnlocked(progress, levelId, subLevelId)
    ? (progress.levels[levelId].subLevels[subLevelId].completed ? 'completed' : 'active')
    : 'locked';
}

/**
 * Get total DP.
 */
export function getTotalDP() {
  const progress = loadProgress();
  return progress.totalDP || 0;
}

/**
 * Get completion stats for a level.
 */
export function getLevelStats(levelId) {
  const progress = loadProgress();
  const levelProgress = progress.levels[levelId];
  const level = levels.find((l) => l.id === levelId);

  if (!levelProgress || !level) {
    return { completed: 0, total: 0, dp: 0, status: 'locked' };
  }

  const completed = level.subLevels.filter(
    (s) => !!levelProgress.subLevels[s.id]?.completed
  ).length;

  const dp = level.subLevels.reduce(
    (sum, s) => sum + (levelProgress.subLevels[s.id]?.dp || 0),
    0
  );

  return {
    completed,
    total: level.subLevels.length,
    dp,
    status: levelProgress.status,
  };
}
