/**
 * Level Registry — central lookup for all levels and sub-levels.
 *
 * Replaces the old missions.js chapter-based system.
 */

import { level1 } from './levels/level-1.js';

export const levels = [level1];

/**
 * Look up a specific level by levelId.
 * @returns {object|null}
 */
export function getLevel(levelId) {
  return levels.find((l) => l.id === levelId) || null;
}

/**
 * Look up a specific sub-level by levelId and subLevelId.
 * @returns {{ level: object, subLevel: object }|null}
 */
export function getSubLevel(levelId, subLevelId) {
  const level = getLevel(levelId);
  if (!level) return null;
  const subLevel = level.subLevels.find((s) => s.id === subLevelId);
  if (!subLevel) return null;
  return { level, subLevel };
}

/**
 * Get the next sub-level after the given one within a level.
 * @returns {{ level: object, subLevel: object }|null}
 */
export function getNextSubLevel(levelId, subLevelId) {
  const level = getLevel(levelId);
  if (!level) return null;

  const idx = level.subLevels.findIndex((s) => s.id === subLevelId);
  if (idx === -1) return null;

  // Next sub-level in same level
  if (idx < level.subLevels.length - 1) {
    return { level, subLevel: level.subLevels[idx + 1] };
  }

  // First sub-level of next level
  const levelIdx = levels.findIndex((l) => l.id === levelId);
  if (levelIdx < levels.length - 1) {
    const nextLevel = levels[levelIdx + 1];
    return { level: nextLevel, subLevel: nextLevel.subLevels[0] };
  }

  return null;
}

/**
 * Get all sub-level IDs for a level.
 */
export function getSubLevelIds(levelId) {
  const level = getLevel(levelId);
  if (!level) return [];
  return level.subLevels.map((s) => s.id);
}
