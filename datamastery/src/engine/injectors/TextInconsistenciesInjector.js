/**
 * TextInconsistenciesInjector - adds random padding whitespace or case differences to text fields.
 */
export function injectTextInconsistencies(records, rng, config = {}) {
  const { column, rate = 0.05 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && typeof copy[column] === 'string' && rng.next() < rate) {
      copy[column] = rng.next() < 0.5 ? ` ${copy[column]} ` : copy[column].toLowerCase();
    }
    return copy;
  });
}
export default injectTextInconsistencies;
