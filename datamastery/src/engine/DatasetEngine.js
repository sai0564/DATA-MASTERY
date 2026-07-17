/**
 * DatasetEngine — Orchestrator for seeded dataset generation.
 * Handles deterministic PRNG seeding, generators registry, and problem injectors registry.
 */
import { SeededRNG } from './SeededRNG.js';
import { generateCustomers, customersToCSV } from './generators/CustomerGenerator.js';
import { injectDuplicates } from './injectors/DuplicateInjector.js';
import { SaveSystem } from './SaveSystem.js';

import { ProductGenerator } from './generators/ProductGenerator.js';
import { OrderGenerator } from './generators/OrderGenerator.js';
import { CampaignGenerator } from './generators/CampaignGenerator.js';
import { SalesGenerator } from './generators/SalesGenerator.js';
import { SiteGenerator } from './generators/SiteGenerator.js';
import { SensorGenerator } from './generators/SensorGenerator.js';
import { OperationsGenerator } from './generators/OperationsGenerator.js';

import { injectMissingValues } from './injectors/MissingValuesInjector.js';
import { injectInvalidRanges } from './injectors/InvalidRangesInjector.js';
import { injectWrongDataTypes } from './injectors/WrongDataTypesInjector.js';
import { injectBrokenDates } from './injectors/BrokenDatesInjector.js';
import { injectBrokenJoins } from './injectors/BrokenJoinsInjector.js';
import { injectManyToManyJoins } from './injectors/ManyToManyJoinsInjector.js';
import { injectTextInconsistencies } from './injectors/TextInconsistenciesInjector.js';
import { injectSensorAnomalies } from './injectors/SensorAnomaliesInjector.js';

// =========================================================================
// DATASET ENGINE ORCHESTRATOR
// =========================================================================

// Registry mapping names to modules
const GENERATORS = {
  customers: { generate: generateCustomers, toCSV: customersToCSV },
  products: ProductGenerator,
  orders: OrderGenerator,
  campaigns: CampaignGenerator,
  sales: SalesGenerator,
  sites: SiteGenerator,
  sensors: SensorGenerator,
  operations: OperationsGenerator,
};

const INJECTORS = {
  duplicates: injectDuplicates,
  missingValues: injectMissingValues,
  invalidRanges: injectInvalidRanges,
  wrongDataTypes: injectWrongDataTypes,
  brokenDates: injectBrokenDates,
  brokenJoins: injectBrokenJoins,
  manyToManyJoins: injectManyToManyJoins,
  textInconsistencies: injectTextInconsistencies,
  sensorAnomalies: injectSensorAnomalies,
};

export class DatasetEngine {
  constructor(learnerSeed) {
    this.learnerSeed = learnerSeed;
  }

  /**
   * Safe getter for learner persistent seed via SaveSystem
   */
  static getOrCreateSeed() {
    let seed = SaveSystem.getLearnerSeed();
    if (seed) return seed;

    seed = SeededRNG.generateLearnerSeed();
    SaveSystem.saveLearnerSeed(seed);
    return seed;
  }

  /**
   * Main generation orchestration
   */
  generateForMission(missionDatasets, missionId) {
    const csvMap = {};

    for (const [filename, spec] of Object.entries(missionDatasets)) {
      const rng = SeededRNG.forMission(this.learnerSeed, missionId);
      const genEntry = GENERATORS[spec.generator];

      if (!genEntry) {
        console.warn(`DatasetEngine: Unknown generator type "${spec.generator}"`);
        continue;
      }

      // Step 1: Generate base entity records
      let records = genEntry.generate(rng, spec.count);

      // Step 2: Apply problem injections
      if (spec.injections) {
        for (const injection of spec.injections) {
          const injectorFn = INJECTORS[injection.injector];
          if (injectorFn) {
            records = injectorFn(records, rng, injection.config || {});
          } else {
            console.warn(`DatasetEngine: Unknown injector type "${injection.injector}"`);
          }
        }
      }

      // Step 3: Write out to CSV format
      csvMap[filename] = genEntry.toCSV(records);
    }

    return csvMap;
  }
}
export default DatasetEngine;
