/**
 * InvalidRangesInjector - injects out-of-bounds/invalid values in specified numeric columns.
 */
export function injectInvalidRanges(records, rng, config = {}) {
  const { column, min = 0, max = 100, invalidValue = -999, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = invalidValue;
    }
    return copy;
  });
}
export default injectInvalidRanges;
