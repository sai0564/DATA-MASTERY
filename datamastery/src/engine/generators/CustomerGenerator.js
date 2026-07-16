/**
 * CustomerGenerator — produces realistic customer records.
 *
 * Each record has: customer_id, first_name, last_name, email,
 * age, city, state, country, signup_date
 *
 * Used from Level 1 onward. The same customer pool is reused
 * across all levels for story continuity.
 */
import { FIRST_NAMES } from '../names/firstNames.js';
import { LAST_NAMES } from '../names/lastNames.js';
import { CITIES, EMAIL_DOMAINS } from '../names/cities.js';

/**
 * Generate an array of customer record objects.
 *
 * @param {import('../SeededRNG.js').SeededRNG} rng - Seeded RNG instance
 * @param {number} count - Number of unique customers to generate
 * @returns {object[]} Array of customer records
 */
export function generateCustomers(rng, count = 1247) {
  const customers = [];
  const usedEmails = new Set();

  for (let i = 1; i <= count; i++) {
    const fn = rng.pick(FIRST_NAMES);
    const ln = rng.pick(LAST_NAMES);
    const loc = rng.pick(CITIES);

    // Generate unique email
    let email = `${fn.toLowerCase()}.${ln.toLowerCase()}${rng.int(1, 999)}@${rng.pick(EMAIL_DOMAINS)}`;
    while (usedEmails.has(email)) {
      email = `${fn.toLowerCase()}.${ln.toLowerCase()}${rng.int(1, 9999)}@${rng.pick(EMAIL_DOMAINS)}`;
    }
    usedEmails.add(email);

    customers.push({
      customer_id: `CUST-${String(i).padStart(5, '0')}`,
      first_name: fn,
      last_name: ln,
      email,
      age: rng.int(18, 72),
      city: loc.city,
      state: loc.state,
      country: loc.country,
      signup_date: rng.date(2023, 2025),
    });
  }

  return customers;
}

/**
 * Convert an array of customer records to a CSV string.
 */
export function customersToCSV(customers) {
  const header = 'customer_id,first_name,last_name,email,age,city,state,country,signup_date';
  const rows = customers.map(c =>
    `${c.customer_id},${c.first_name},${c.last_name},${c.email},${c.age},${c.city},${c.state},${c.country},${c.signup_date}`
  );
  return header + '\n' + rows.join('\n') + '\n';
}
