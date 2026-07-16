/**
 * Progress Store — manages learner progress in localStorage.
 *
 * Structure:
 * {
 *   levels: {
 *     'level-1': {
 *       status: 'active' | 'completed' | 'locked',
 *       subLevels: {
 *         '1.1': { completed: true, dp: 60, hintsUsed: 0, code: '...' },
 *         '1.2': { completed: false, dp: 0, hintsUsed: 0, code: '' },
 *       },
 *       // For challenges with multi-step validation
 *       challengeStates: {
 *         '1.7': { reachedStates: ['loaded', 'checked-size'], ... }
 *       }
 *     }
 *   },
 *   totalDP: 0,
 *   completedCount: 0,
 * }
 */

import { STORAGE_KEYS, POINTS } from '../utils/constants.js';
import { levels } from '../data/levelRegistry.js';

const INITIAL_PROGRESS = {
  levels: {},
  totalDP: 0,
  completedCount: 0,
};

/**
 * Load progress from localStorage.
 */
export function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
  return initializeProgress();
}

/**
 * Initialize progress structure for all known levels.
 * Level 1 is active, all others are locked.
 */
export function initializeProgress() {
  const progress = { ...INITIAL_PROGRESS, levels: {} };

  levels.forEach((level, levelIndex) => {
    const levelProgress = {
      status: levelIndex === 0 ? 'active' : 'locked',
      subLevels: {},
      challengeStates: {},
    };

    level.subLevels.forEach((sub, subIndex) => {
      levelProgress.subLevels[sub.id] = {
        completed: false,
        dp: 0,
        hintsUsed: 0,
        code: '',
        // Only the first sub-level of the first level is unlocked
        unlocked: levelIndex === 0 && subIndex === 0,
      };

      // If it's a challenge type, add state tracking
      if (sub.type === 'challenge') {
        levelProgress.challengeStates[sub.id] = {
          reachedStates: [],
        };
      }
    });

    progress.levels[level.id] = levelProgress;
  });

  saveProgress(progress);
  return progress;
}

/**
 * Save progress to localStorage.
 */
export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

/**
 * Mark a sub-level as complete, award DP, and unlock the next sub-level.
 */
export function completeSubLevel(levelId, subLevelId, hintsUsed, code) {
  const progress = loadProgress();
  const levelProgress = progress.levels[levelId];
  if (!levelProgress) return progress;

  const subProgress = levelProgress.subLevels[subLevelId];
  if (!subProgress || subProgress.completed) return progress;

  // Find the sub-level data to determine points
  const level = levels.find(l => l.id === levelId);
  const subLevel = level?.subLevels.find(s => s.id === subLevelId);
  if (!subLevel) return progress;

  // Calculate DP
  const baseDp = subLevel.points.base;
  const bonusDp = hintsUsed === 0 ? subLevel.points.bonus : 0;
  const hintPenalty = hintsUsed * POINTS.HINT_PENALTY;
  const dp = Math.max(0, baseDp + bonusDp - hintPenalty);

  // Update sub-level progress
  subProgress.completed = true;
  subProgress.dp = dp;
  subProgress.hintsUsed = hintsUsed;
  subProgress.code = code;

  // Update totals
  progress.totalDP += dp;
  progress.completedCount += 1;

  // Unlock next sub-level
  const subIdx = level.subLevels.findIndex(s => s.id === subLevelId);
  if (subIdx < level.subLevels.length - 1) {
    const nextSub = level.subLevels[subIdx + 1];
    // For challenges, check if all required subs are complete
    if (nextSub.type === 'challenge' && nextSub.requires) {
      const allRequirementsMet = nextSub.requires.every(
        reqId => levelProgress.subLevels[reqId]?.completed
      );
      if (allRequirementsMet) {
        levelProgress.subLevels[nextSub.id].unlocked = true;
      }
    } else {
      levelProgress.subLevels[nextSub.id].unlocked = true;
    }
  }

  // Check if level is complete (all sub-levels done)
  const allDone = level.subLevels.every(
    s => levelProgress.subLevels[s.id]?.completed
  );
  if (allDone) {
    levelProgress.status = 'completed';
    // Unlock next level
    const levelIdx = levels.findIndex(l => l.id === levelId);
    if (levelIdx < levels.length - 1) {
      const nextLevel = levels[levelIdx + 1];
      if (progress.levels[nextLevel.id]) {
        progress.levels[nextLevel.id].status = 'active';
        // Unlock the first sub-level of the next level
        const firstSub = nextLevel.subLevels[0];
        if (firstSub) {
          progress.levels[nextLevel.id].subLevels[firstSub.id].unlocked = true;
        }
      }
    }
  }

  saveProgress(progress);
  return progress;
}

/**
 * Update challenge state for multi-step validation.
 */
export function updateChallengeState(levelId, subLevelId, newState) {
  const progress = loadProgress();
  const levelProgress = progress.levels[levelId];
  if (!levelProgress) return progress;

  if (!levelProgress.challengeStates[subLevelId]) {
    levelProgress.challengeStates[subLevelId] = { reachedStates: [] };
  }

  const states = levelProgress.challengeStates[subLevelId].reachedStates;
  if (!states.includes(newState)) {
    states.push(newState);
  }

  saveProgress(progress);
  return progress;
}

/**
 * Get the current sub-level status for a given level.
 */
export function getSubLevelStatus(levelId, subLevelId) {
  const progress = loadProgress();
  const levelProgress = progress.levels[levelId];
  if (!levelProgress) return 'locked';
  const sub = levelProgress.subLevels[subLevelId];
  if (!sub) return 'locked';
  if (sub.completed) return 'completed';
  if (sub.unlocked) return 'active';
  return 'locked';
}

/**
 * Get total DP earned.
 */
export function getTotalDP() {
  const progress = loadProgress();
  return progress.totalDP;
}

/**
 * Get completion stats for a level.
 */
export function getLevelStats(levelId) {
  const progress = loadProgress();
  const levelProgress = progress.levels[levelId];
  const level = levels.find(l => l.id === levelId);
  if (!levelProgress || !level) {
    return { completed: 0, total: 0, dp: 0, status: 'locked' };
  }

  const completed = level.subLevels.filter(
    s => levelProgress.subLevels[s.id]?.completed
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
