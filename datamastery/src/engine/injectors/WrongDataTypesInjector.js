/**
 * WrongDataTypesInjector - injects string indicators (like "N/A") into numeric columns.
 */
export function injectWrongDataTypes(records, rng, config = {}) {
  const { column, rate = 0.02 } = config;
  return records.map(record => {
    const copy = { ...record };
    if (column in copy && rng.next() < rate) {
      copy[column] = 'N/A';
    }
    return copy;
  });
}
export default injectWrongDataTypes;
