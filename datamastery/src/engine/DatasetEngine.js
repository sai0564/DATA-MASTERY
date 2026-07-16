/**
 * DatasetEngine — orchestrator for seeded dataset generation.
 *
 * Flow: learnerSeed + missionId → SeededRNG → generators → injectors → CSV string
 *
 * Usage:
 *   const engine = new DatasetEngine(learnerSeed);
 *   const csvMap = engine.generateForMission(missionConfig);
 *   // csvMap = { 'customers.csv': '...csv string...', ... }
 */
import { SeededRNG } from './SeededRNG.js';
import { generateCustomers, customersToCSV } from './generators/CustomerGenerator.js';
import { injectDuplicates } from './injectors/DuplicateInjector.js';
import { STORAGE_KEYS } from '../utils/constants.js';

// Registry of generators — maps generator name → { generate, toCSV }
const GENERATORS = {
  customers: { generate: generateCustomers, toCSV: customersToCSV },
  // Future: orders, products, campaigns, sales, sites, sensors, operations
};

// Registry of injectors — maps injector name → function
const INJECTORS = {
  duplicates: injectDuplicates,
  // Future: missingValues, invalidRange, textInconsistency, badDates, etc.
};

export class DatasetEngine {
  /**
   * @param {number} learnerSeed - Persistent per-learner seed
   */
  constructor(learnerSeed) {
    this.learnerSeed = learnerSeed;
  }

  /**
   * Get or create a learner seed from localStorage.
   */
  static getOrCreateSeed() {
    const stored = localStorage.getItem(STORAGE_KEYS.LEARNER_SEED);
    if (stored) {
      return parseInt(stored, 10);
    }
    const seed = SeededRNG.generateLearnerSeed();
    localStorage.setItem(STORAGE_KEYS.LEARNER_SEED, String(seed));
    return seed;
  }

  /**
   * Generate all datasets required by a mission.
   *
   * @param {object} missionDatasets - Mission's datasets config
   *   Example:
   *   {
   *     'customers.csv': {
   *       generator: 'customers',
   *       count: 1247,
   *       injections: [
   *         { injector: 'duplicates', config: { count: 65 } }
   *       ]
   *     }
   *   }
   * @param {string} missionId - Used to salt the RNG per mission
   * @returns {Object.<string, string>} Map of filename → CSV string
   */
  generateForMission(missionDatasets, missionId) {
    const csvMap = {};

    for (const [filename, spec] of Object.entries(missionDatasets)) {
      const rng = SeededRNG.forMission(this.learnerSeed, missionId);
      const genEntry = GENERATORS[spec.generator];

      if (!genEntry) {
        console.warn(`Unknown generator: ${spec.generator}`);
        continue;
      }

      // Step 1: Generate base records
      let records = genEntry.generate(rng, spec.count);

      // Step 2: Apply injections in order
      if (spec.injections) {
        for (const injection of spec.injections) {
          const injectorFn = INJECTORS[injection.injector];
          if (injectorFn) {
            records = injectorFn(records, rng, injection.config || {});
          } else {
            console.warn(`Unknown injector: ${injection.injector}`);
          }
        }
      }

      // Step 3: Convert to CSV
      csvMap[filename] = genEntry.toCSV(records);
    }

    return csvMap;
  }
}
