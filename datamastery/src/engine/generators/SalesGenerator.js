/**
 * SalesGenerator stub implementation.
 */
export const SalesGenerator = {
  generate(rng, count = 200) {
    return Array.from({ length: count }, (_, i) => ({
      sale_id: `SALE-${String(i + 1).padStart(5, '0')}`,
      amount: rng.int(50, 1000),
      payment_method: rng.pick(['Credit Card', 'PayPal', 'Stripe']),
      sale_time: '2026-01-01 12:00:00'
    }));
  },
  toCSV(records) {
    const header = 'sale_id,amount,payment_method,sale_time\n';
    const rows = records.map(r => `${r.sale_id},${r.amount},${r.payment_method},${r.sale_time}`).join('\n');
    return header + rows;
  }
};
export default SalesGenerator;
