import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * SaveSystem — Abstract persistence layer for DataMastery.
 * Ensures the codebase doesn't directly access localStorage.
 */
export const SaveSystem = {
  /**
   * Save the main progress structure.
   */
  saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('SaveSystem: Failed to save progress:', e);
    }
  },

  /**
   * Get progress or null.
   */
  getProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('SaveSystem: Failed to load progress:', e);
      return null;
    }
  },

  /**
   * Save starter/working code for a sub-level.
   */
  saveCode(levelId, subLevelId, code) {
    try {
      const allCodes = this.getAllCodes();
      allCodes[`${levelId}/${subLevelId}`] = code;
      localStorage.setItem(STORAGE_KEYS.PLAYGROUND || 'datamastery_codes', JSON.stringify(allCodes));
    } catch (e) {
      console.warn('SaveSystem: Failed to save code:', e);
    }
  },

  /**
   * Get starter/working code for a sub-level.
   */
  getCode(levelId, subLevelId) {
    try {
      const allCodes = this.getAllCodes();
      return allCodes[`${levelId}/${subLevelId}`] || '';
    } catch (e) {
      console.warn('SaveSystem: Failed to load code:', e);
      return '';
    }
  },

  /**
   * Get all stored codes.
   */
  getAllCodes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYGROUND || 'datamastery_codes');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  },

  /**
   * Save learner seed.
   */
  saveLearnerSeed(seed) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNER_SEED, String(seed));
    } catch (e) {
      console.warn('SaveSystem: Failed to save learner seed:', e);
    }
  },

  /**
   * Get learner seed.
   */
  getLearnerSeed() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEARNER_SEED);
      return stored ? parseInt(stored, 10) : null;
    } catch (e) {
      console.warn('SaveSystem: Failed to load learner seed:', e);
      return null;
    }
  },

  /**
   * Save settings.
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('SaveSystem: Failed to save settings:', e);
    }
  },

  /**
   * Get settings.
   */
  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('SaveSystem: Failed to load settings:', e);
      return {};
    }
  },

  /**
   * Clear all stored application data.
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      localStorage.removeItem('datamastery_codes');
    } catch (e) {
      console.warn('SaveSystem: Failed to clear all data:', e);
    }
  }
};
