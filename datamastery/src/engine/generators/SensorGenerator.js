/**
 * SensorGenerator stub implementation.
 */
export const SensorGenerator = {
  generate(rng, count = 20) {
    return Array.from({ length: count }, (_, i) => ({
      sensor_id: `SNSR-${String(i + 1).padStart(4, '0')}`,
      type: rng.pick(['Temperature', 'Pressure', 'Humidity']),
      location: `Zone ${rng.int(1, 4)}`,
      reading: rng.int(10, 100) / 10
    }));
  },
  toCSV(records) {
    const header = 'sensor_id,type,location,reading\n';
    const rows = records.map(r => `${r.sensor_id},${r.type},${r.location},${r.reading}`).join('\n');
    return header + rows;
  }
};
export default SensorGenerator;
