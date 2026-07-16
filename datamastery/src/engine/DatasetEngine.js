/**
 * DatasetEngine — Orchestrator for seeded dataset generation.
 * Handles deterministic PRNG seeding, generators registry, and problem injectors registry.
 */
import { SeededRNG } from './SeededRNG.js';
import { generateCustomers, customersToCSV } from './generators/CustomerGenerator.js';
import { injectDuplicates } from './injectors/DuplicateInjector.js';
import { SaveSystem } from './SaveSystem.js';

// =========================================================================
// GENERATORS INTERFACE STUBS
// =========================================================================

export const ProductGenerator = {
  generate(rng, count) {
    // Stub for products generator
    return Array.from({ length: count }, (_, i) => ({
      product_id: `PROD-${String(i + 1).padStart(5, '0')}`,
      product_name: `Product ${i + 1}`,
      category: 'Electronics',
      unit_price: rng.int(10, 500) / 100
    }));
  },
  toCSV(records) {
    const header = 'product_id,product_name,category,unit_price\n';
    const rows = records.map(r => `${r.product_id},"${r.product_name}",${r.category},${r.unit_price}`).join('\n');
    return header + rows;
  }
};

export const OrderGenerator = {
  generate(rng, count, customers = [], products = []) {
    // Stub for orders generator, optionally linked to customer & product entities
    return Array.from({ length: count }, (_, i) => {
      const cust = customers.length ? rng.pick(customers) : { customer_id: 'CUST-00001' };
      const prod = products.length ? rng.pick(products) : { product_id: 'PROD-00001', unit_price: 19.99 };
      return {
        order_id: `ORD-${String(i + 1).padStart(5, '0')}`,
        customer_id: cust.customer_id,
        product_id: prod.product_id,
        quantity: rng.int(1, 5),
        price: prod.unit_price,
        order_date: '2026-01-01'
      };
    });
  },
  toCSV(records) {
    const header = 'order_id,customer_id,product_id,quantity,price,order_date\n';
    const rows = records.map(r => `${r.order_id},${r.customer_id},${r.product_id},${r.quantity},${r.price},${r.order_date}`).join('\n');
    return header + rows;
  }
};

export const CampaignGenerator = {
  generate(rng, count) { return []; },
  toCSV(records) { return ''; }
};

export const SalesGenerator = {
  generate(rng, count) { return []; },
  toCSV(records) { return ''; }
};

export const SiteGenerator = {
  generate(rng, count) { return []; },
  toCSV(records) { return ''; }
};

export const SensorGenerator = {
  generate(rng, count) { return []; },
  toCSV(records) { return ''; }
};

export const OperationsGenerator = {
  generate(rng, count) { return []; },
  toCSV(records) { return ''; }
};

// =========================================================================
// PROBLEM INJECTORS INTERFACE STUBS
// =========================================================================

export const injectMissingValues = (records, rng, config = {}) => {
  const { columns = [], rate = 0.05 } = config;
  return records.map(record => {
    const copy = { ...record };
    columns.forEach(col => {
      if (col in copy && rng.next() < rate) {
        copy[col] = '';
      }
    });
    return copy;
  });
};

export const injectInvalidRanges = (records, rng, config = {}) => {
  const { column, min = 0, max = 100, invalidValue = -999, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = invalidValue;
    }
    return copy;
  });
};

export const injectWrongDataTypes = (records, rng, config = {}) => {
  const { column, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = 'N/A'; // convert to string
    }
    return copy;
  });
};

export const injectBrokenDates = (records, rng, config = {}) => {
  const { column, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = '2026/02/31'; // invalid date format
    }
    return copy;
  });
};

export const injectBrokenJoins = (records, rng, config = {}) => {
  const { column, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = 'INVALID-KEY';
    }
    return copy;
  });
};

export const injectManyToManyJoins = (records, rng, config = {}) => {
  // Simulates key duplication leading to cardinality explosion during join
  return records;
};

export const injectTextInconsistencies = (records, rng, config = {}) => {
  const { column, rate = 0.05 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && typeof copy[column] === 'string' && rng.next() < rate) {
      // Add inconsistent spaces or lowercase variations
      copy[column] = rng.next() < 0.5 ? ` ${copy[column]} ` : copy[column].toLowerCase();
    }
    return copy;
  });
};

export const injectSensorAnomalies = (records, rng, config = {}) => {
  return records;
};

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
