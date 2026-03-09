import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
  const users = await sql`SELECT id, name, company_name, email, subscription_status, created_at FROM auth_users ORDER BY created_at DESC LIMIT 5`;
  console.log(JSON.stringify(users, null, 2));
}
run();
