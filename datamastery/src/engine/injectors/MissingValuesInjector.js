/**
 * MissingValuesInjector - sets random values in specified columns to empty string.
 */
export function injectMissingValues(records, rng, config = {}) {
  const { columns = [], rate = 0.05, value = '' } = config;
  return records.map(record => {
    const copy = { ...record };
    columns.forEach(col => {
      if (col in copy && rng.next() < rate) {
        copy[col] = value;
      }
    });
    return copy;
  });
}
export default injectMissingValues;
