/**
 * ProductGenerator stub implementation.
 */
export const ProductGenerator = {
  generate(rng, count = 50) {
    return Array.from({ length: count }, (_, i) => ({
      product_id: `PROD-${String(i + 1).padStart(5, '0')}`,
      product_name: `Product ${i + 1}`,
      category: 'Electronics',
      unit_price: rng.int(10, 500) / 100
    }));
  },
  toCSV(records) {
    const header = 'product_id,product_name,category,unit_price\n';
    const rows = records.map(r => `${r.product_id},"${r.product_name}",${r.category},${r.unit_price}`).join('\n');
    return header + rows;
  }
};
export default ProductGenerator;
