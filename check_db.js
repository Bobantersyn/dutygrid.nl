const { createClient } = require('@vercel/postgres');
require('dotenv').config({ path: 'apps/web/.env.local' });

async function query() {
  const client = createClient();
  await client.connect();
  const res = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1;', ['clients']);
  console.log(res.rows);
  await client.end();
}
query().catch(console.error);
