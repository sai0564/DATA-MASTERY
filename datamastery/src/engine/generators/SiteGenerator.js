/**
 * SiteGenerator stub implementation.
 */
export const SiteGenerator = {
  generate(rng, count = 5) {
    return Array.from({ length: count }, (_, i) => ({
      site_id: `SITE-${String(i + 1).padStart(3, '0')}`,
      site_name: `Site ${i + 1}`,
      region: rng.pick(['North', 'East', 'South', 'West']),
      active: true
    }));
  },
  toCSV(records) {
    const header = 'site_id,site_name,region,active\n';
    const rows = records.map(r => `${r.site_id},"${r.site_name}",${r.region},${r.active}`).join('\n');
    return header + rows;
  }
};
export default SiteGenerator;
