/**
 * OperationsGenerator stub implementation.
 */
export const OperationsGenerator = {
  generate(rng, count = 50) {
    return Array.from({ length: count }, (_, i) => ({
      operation_id: `OP-${String(i + 1).padStart(4, '0')}`,
      site_id: `SITE-001`,
      status: rng.pick(['Success', 'Failure', 'In Progress']),
      duration_minutes: rng.int(5, 120)
    }));
  },
  toCSV(records) {
    const header = 'operation_id,site_id,status,duration_minutes\n';
    const rows = records.map(r => `${r.operation_id},${r.site_id},${r.status},${r.duration_minutes}`).join('\n');
    return header + rows;
  }
};
export default OperationsGenerator;
