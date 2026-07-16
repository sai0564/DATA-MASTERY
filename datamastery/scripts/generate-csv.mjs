// Generates nova_customers.csv: 1247 unique customers + 65 duplicate rows = 1312 total
import { writeFileSync } from 'fs';

const firstNames = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen','Charles','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Dorothy','Paul','Kimberly','Andrew','Emily','Joshua','Donna','Kenneth','Michelle','Kevin','Carol','Brian','Amanda','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen','Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel','Alexander','Carolyn','Patrick','Janet','Jack','Catherine','Dennis','Maria','Jerry','Heather','Tyler','Diane'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell'];
const cities = [
  {city:'New York',state:'NY',country:'United States'},{city:'Los Angeles',state:'CA',country:'United States'},{city:'Chicago',state:'IL',country:'United States'},{city:'Houston',state:'TX',country:'United States'},{city:'Phoenix',state:'AZ',country:'United States'},{city:'Philadelphia',state:'PA',country:'United States'},{city:'San Antonio',state:'TX',country:'United States'},{city:'San Diego',state:'CA',country:'United States'},{city:'Dallas',state:'TX',country:'United States'},{city:'Austin',state:'TX',country:'United States'},{city:'Jacksonville',state:'FL',country:'United States'},{city:'San Francisco',state:'CA',country:'United States'},{city:'Seattle',state:'WA',country:'United States'},{city:'Denver',state:'CO',country:'United States'},{city:'Boston',state:'MA',country:'United States'},{city:'Nashville',state:'TN',country:'United States'},{city:'Portland',state:'OR',country:'United States'},{city:'Miami',state:'FL',country:'United States'},{city:'Atlanta',state:'GA',country:'United States'},{city:'Minneapolis',state:'MN',country:'United States'},{city:'Toronto',state:'ON',country:'Canada'},{city:'Vancouver',state:'BC',country:'Canada'},{city:'Montreal',state:'QC',country:'Canada'},{city:'London',state:'England',country:'United Kingdom'},{city:'Manchester',state:'England',country:'United Kingdom'},{city:'Sydney',state:'NSW',country:'Australia'},{city:'Melbourne',state:'VIC',country:'Australia'},{city:'Berlin',state:'Berlin',country:'Germany'},{city:'Munich',state:'Bavaria',country:'Germany'},{city:'Paris',state:'Ile-de-France',country:'France'}
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(startYear, endYear) {
  const y = randInt(startYear, endYear);
  const m = String(randInt(1,12)).padStart(2,'0');
  const d = String(randInt(1,28)).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

// Seed for reproducibility (simple)
let seed = 42;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function srand(arr) { return arr[Math.floor(seededRandom() * arr.length)]; }
function srandInt(min, max) { return Math.floor(seededRandom() * (max - min + 1)) + min; }

const rows = [];
const usedEmails = new Set();

for (let i = 1; i <= 1247; i++) {
  const fn = srand(firstNames);
  const ln = srand(lastNames);
  let email = `${fn.toLowerCase()}.${ln.toLowerCase()}${srandInt(1,999)}@${srand(['gmail.com','yahoo.com','outlook.com','hotmail.com','company.com','email.com'])}`;
  while (usedEmails.has(email)) {
    email = `${fn.toLowerCase()}.${ln.toLowerCase()}${srandInt(1,9999)}@${srand(['gmail.com','yahoo.com','outlook.com'])}`;
  }
  usedEmails.add(email);
  const loc = srand(cities);
  rows.push({
    customer_id: `CUST-${String(i).padStart(5,'0')}`,
    first_name: fn,
    last_name: ln,
    email,
    age: srandInt(18, 72),
    city: loc.city,
    state: loc.state,
    country: loc.country,
    signup_date: `${srandInt(2023,2025)}-${String(srandInt(1,12)).padStart(2,'0')}-${String(srandInt(1,28)).padStart(2,'0')}`
  });
}

// Pick 65 random rows to duplicate
const dupeIndices = new Set();
while (dupeIndices.size < 65) {
  dupeIndices.add(Math.floor(seededRandom() * rows.length));
}
const dupes = [...dupeIndices].map(i => ({...rows[i]}));

const all = [...rows, ...dupes];
// Shuffle
for (let i = all.length - 1; i > 0; i--) {
  const j = Math.floor(seededRandom() * (i + 1));
  [all[i], all[j]] = [all[j], all[i]];
}

const header = 'customer_id,first_name,last_name,email,age,city,state,country,signup_date';
const csvLines = all.map(r =>
  `${r.customer_id},${r.first_name},${r.last_name},${r.email},${r.age},${r.city},${r.state},${r.country},${r.signup_date}`
);

writeFileSync('public/datasets/nova_customers.csv', header + '\n' + csvLines.join('\n') + '\n');
console.log(`Generated: ${all.length} rows, ${rows.length} unique, ${dupes.length} duplicates`);
