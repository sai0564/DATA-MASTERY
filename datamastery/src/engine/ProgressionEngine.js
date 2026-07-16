import { SaveSystem } from './SaveSystem.js';

/**
 * ProgressionEngine — Manages learner progression, unlocks, and gating.
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
   * Process a sub-level completion and compute next unlocks.
   * Modifies progress in-place.
   *
   * @param {object} progress - The mutable progress object
   * @param {object} level - Level definition from configuration
   * @param {string} subLevelId - The completed sub-level ID
   * @param {number} earnedDP - Computed earned points
   * @param {number} hintsUsed - Number of hints used
   * @param {string} code - The code written by the learner
   * @param {array} levelsList - The full list of registered levels
   */
  completeSubLevel(progress, level, subLevelId, earnedDP, hintsUsed, code, levelsList) {
    const levelProg = progress.levels[level.id];
    if (!levelProg) return;

    const subProg = levelProg.subLevels[subLevelId];
    if (!subProg || subProg.completed) return;

    // 1. Mark completed
    subProg.completed = true;
    subProg.dp = earnedDP;
    subProg.hintsUsed = hintsUsed;
    subProg.code = code;

    progress.totalDP += earnedDP;
    progress.completedCount += 1;

    // 2. Determine unlocks within the current level
    const currentIdx = level.subLevels.findIndex((s) => s.id === subLevelId);
    if (currentIdx !== -1 && currentIdx < level.subLevels.length - 1) {
      const nextSub = level.subLevels[currentIdx + 1];
      const nextSubProg = levelProg.subLevels[nextSub.id];
      
      if (nextSubProg) {
        // If it requires previous missions
        if (nextSub.requires) {
          if (this.areRequirementsMet(progress, level.id, nextSub.requires)) {
            nextSubProg.unlocked = true;
          }
        } else {
          nextSubProg.unlocked = true;
        }
      }
    }

    // 3. Check level completion (all sub-levels are completed)
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
          // Unlock the first sub-level of the next level
          const firstSub = nextLevel.subLevels[0];
          if (firstSub && nextLevelProg.subLevels[firstSub.id]) {
            nextLevelProg.subLevels[firstSub.id].unlocked = true;
          }
        }
      }
    }
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
