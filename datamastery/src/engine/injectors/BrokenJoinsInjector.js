/**
 * BrokenJoinsInjector - replaces key fields with invalid keys to simulate join mismatches.
 */
export function injectBrokenJoins(records, rng, config = {}) {
  const { column, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = 'INVALID-KEY';
    }
    return copy;
  });
}
export default injectBrokenJoins;
