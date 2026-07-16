import { SaveSystem } from './SaveSystem.js';

/**
 * ProgressionEngine — Manages learner progression, unlocks, gating, and achievement verification.
 */
export const ProgressionEngine = {
  /**
   * Initialize a fresh progress object based on registered levels.
   */
  initializeProgress(levelsList) {
    const progress = {
      levels: {},
      totalDP: 0,
      completedCount: 0,
      achievements: {
        'first-run': { unlocked: false, unlockedAt: null },
        'no-hints': { unlocked: false, unlockedAt: null },
        'perfect-week': { unlocked: false, unlockedAt: null },
        'performance-review': { unlocked: false, unlockedAt: null },
        'fast-learner': { unlocked: false, unlockedAt: null },
        'curious-analyst': { unlocked: false, unlockedAt: null }
      }
    };

    levelsList.forEach((level, levelIdx) => {
      const levelProgress = {
        status: levelIdx === 0 ? 'active' : 'locked', // first level is unlocked
        subLevels: {},
        challengeStates: {},
      };

      level.subLevels.forEach((sub, subIdx) => {
        levelProgress.subLevels[sub.id] = {
          completed: false,
          dp: 0,
          hintsUsed: 0,
          code: '',
          unlocked: levelIdx === 0 && subIdx === 0, // first sub-level of first level is unlocked
        };

        if (sub.type === 'challenge') {
          levelProgress.challengeStates[sub.id] = {
            reachedStates: [],
          };
        }
      });

      progress.levels[level.id] = levelProgress;
    });

    return progress;
  },

  /**
   * Determine if a sub-level is unlocked.
   */
  isSubLevelUnlocked(progress, levelId, subLevelId) {
    const levelProg = progress.levels[levelId];
    if (!levelProg) return false;
    if (levelProg.status === 'locked') return false;

    const subProg = levelProg.subLevels[subLevelId];
    return !!subProg?.unlocked;
  },

  /**
   * Determine if all prerequisites for a sub-level (or challenge) are met.
   */
  areRequirementsMet(progress, levelId, requiresArray) {
    if (!requiresArray || requiresArray.length === 0) return true;
    const levelProg = progress.levels[levelId];
    if (!levelProg) return false;

    return requiresArray.every((reqId) => {
      return !!levelProg.subLevels[reqId]?.completed;
    });
  },

  /**
   * Process a sub-level completion and compute next unlocks & achievements.
   * Modifies progress in-place.
   *
   * @param {object} progress - The mutable progress object
   * @param {object} level - Level definition from configuration
   * @param {string} subLevelId - The completed sub-level ID
   * @param {number} earnedDP - Computed earned points
   * @param {number} hintsUsed - Number of hints used
   * @param {string} code - The code written by the learner
   * @param {array} levelsList - The full list of registered levels
   * @param {number} attempts - Attempts taken to solve
   * @returns {string[]} Newly unlocked achievement IDs
   */
  completeSubLevel(progress, level, subLevelId, earnedDP, hintsUsed, code, levelsList, attempts = 1) {
    const levelProg = progress.levels[level.id];
    if (!levelProg) return [];

    const subProg = levelProg.subLevels[subLevelId];
    if (!subProg || subProg.completed) return [];

    // 1. Mark completed
    subProg.completed = true;
    subProg.dp = earnedDP;
    subProg.hintsUsed = hintsUsed;
    subProg.code = code;

    progress.totalDP += earnedDP;
    progress.completedCount += 1;

    // Initialize achievements helper block if missing from legacy saves
    if (!progress.achievements) {
      progress.achievements = {
        'first-run': { unlocked: false, unlockedAt: null },
        'no-hints': { unlocked: false, unlockedAt: null },
        'perfect-week': { unlocked: false, unlockedAt: null },
        'performance-review': { unlocked: false, unlockedAt: null },
        'fast-learner': { unlocked: false, unlockedAt: null },
        'curious-analyst': { unlocked: false, unlockedAt: null }
      };
    }

    const newlyUnlocked = [];
    const triggerUnlock = (id) => {
      if (progress.achievements[id] && !progress.achievements[id].unlocked) {
        progress.achievements[id].unlocked = true;
        progress.achievements[id].unlockedAt = new Date().toISOString();
        newlyUnlocked.push(id);
      }
    };

    // --- Validate Achievements ---

    // A. first-run
    if (subLevelId === '1.1') {
      triggerUnlock('first-run');
    }

    // B. no-hints
    if (hintsUsed === 0) {
      triggerUnlock('no-hints');
    }

    // C. fast-learner
    if (attempts === 1) {
      triggerUnlock('fast-learner');
    }

    // D. curious-analyst
    if (attempts >= 4 || hintsUsed >= 3) {
      triggerUnlock('curious-analyst');
    }

    // E. performance-review
    if (subLevelId === '1.7') {
      triggerUnlock('performance-review');
    }

    // F. perfect-week (all 1.1 to 1.6 completed without hints)
    const guidedIds = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'];
    const perfectWeekDone = guidedIds.every(gid => {
      if (gid === subLevelId) return hintsUsed === 0;
      const sp = levelProg.subLevels[gid];
      return sp && sp.completed && sp.hintsUsed === 0;
    });
    if (perfectWeekDone) {
      triggerUnlock('perfect-week');
    }

    // 2. Determine unlocks within the current level
    const currentIdx = level.subLevels.findIndex((s) => s.id === subLevelId);
    if (currentIdx !== -1 && currentIdx < level.subLevels.length - 1) {
      const nextSub = level.subLevels[currentIdx + 1];
      const nextSubProg = levelProg.subLevels[nextSub.id];
      
      if (nextSubProg) {
        if (nextSub.requires) {
          if (this.areRequirementsMet(progress, level.id, nextSub.requires)) {
            nextSubProg.unlocked = true;
          }
        } else {
          nextSubProg.unlocked = true;
        }
      }
    }

    // 3. Check level completion
    const allDone = level.subLevels.every((s) => !!levelProg.subLevels[s.id]?.completed);
    if (allDone) {
      levelProg.status = 'completed';

      // Unlock next level in list
      const levelIdx = levelsList.findIndex((l) => l.id === level.id);
      if (levelIdx !== -1 && levelIdx < levelsList.length - 1) {
        const nextLevel = levelsList[levelIdx + 1];
        const nextLevelProg = progress.levels[nextLevel.id];
        if (nextLevelProg) {
          nextLevelProg.status = 'active';
          const firstSub = nextLevel.subLevels[0];
          if (firstSub && nextLevelProg.subLevels[firstSub.id]) {
            nextLevelProg.subLevels[firstSub.id].unlocked = true;
          }
        }
      }
    }

    return newlyUnlocked;
  },

  /**
   * Update internal state tracker for a challenge.
   */
  updateChallengeState(progress, levelId, subLevelId, newState) {
    const levelProg = progress.levels[levelId];
    if (!levelProg) return;

    if (!levelProg.challengeStates[subLevelId]) {
      levelProg.challengeStates[subLevelId] = { reachedStates: [] };
    }

    const reached = levelProg.challengeStates[subLevelId].reachedStates;
    if (!reached.includes(newState)) {
      reached.push(newState);
    }
  }
};
