/**
 * BrokenDatesInjector - replaces valid date strings with impossible date strings (e.g. "2026/02/31").
 */
export function injectBrokenDates(records, rng, config = {}) {
  const { column, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = '2026/02/31';
    }
    return copy;
  });
}
export default injectBrokenDates;
