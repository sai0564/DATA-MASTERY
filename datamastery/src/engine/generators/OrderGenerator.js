/**
 * OrderGenerator stub implementation.
 */
export const OrderGenerator = {
  generate(rng, count = 100, customers = [], products = []) {
    return Array.from({ length: count }, (_, i) => {
      const cust = customers.length ? rng.pick(customers) : { customer_id: 'CUST-00001' };
      const prod = products.length ? rng.pick(products) : { product_id: 'PROD-00001', unit_price: 19.99 };
      return {
        order_id: `ORD-${String(i + 1).padStart(5, '0')}`,
        customer_id: cust.customer_id,
        product_id: prod.product_id,
        quantity: rng.int(1, 5),
        price: prod.unit_price,
        order_date: '2026-01-01'
      };
    });
  },
  toCSV(records) {
    const header = 'order_id,customer_id,product_id,quantity,price,order_date\n';
    const rows = records.map(r => `${r.order_id},${r.customer_id},${r.product_id},${r.quantity},${r.price},${r.order_date}`).join('\n');
    return header + rows;
  }
};
export default OrderGenerator;
