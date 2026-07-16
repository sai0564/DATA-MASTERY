/**
 * DuplicateInjector — copies N random rows and shuffles the result.
 *
 * @param {object[]} records - Array of record objects
 * @param {import('../SeededRNG.js').SeededRNG} rng - Seeded RNG
 * @param {{ count: number }} config - Injection configuration
 * @returns {object[]} New array with duplicates added and shuffled
 */
export function injectDuplicates(records, rng, config) {
  const { count = 65 } = config;

  // Pick distinct indices to duplicate
  const indices = new Set();
  while (indices.size < Math.min(count, records.length)) {
    indices.add(Math.floor(rng.next() * records.length));
  }

  // Create duplicate copies
  const dupes = [...indices].map(i => ({ ...records[i] }));

  // Combine and shuffle
  const combined = [...records, ...dupes];
  rng.shuffle(combined);

  return combined;
}
