/**
 * CampaignGenerator stub implementation.
 */
export const CampaignGenerator = {
  generate(rng, count = 10) {
    return Array.from({ length: count }, (_, i) => ({
      campaign_id: `CAMP-${String(i + 1).padStart(3, '0')}`,
      campaign_name: `Campaign ${String.fromCharCode(65 + i)}`,
      budget: rng.int(1000, 15000),
      status: rng.pick(['active', 'completed', 'planned'])
    }));
  },
  toCSV(records) {
    const header = 'campaign_id,campaign_name,budget,status\n';
    const rows = records.map(r => `${r.campaign_id},"${r.campaign_name}",${r.budget},${r.status}`).join('\n');
    return header + rows;
  }
};
export default CampaignGenerator;
