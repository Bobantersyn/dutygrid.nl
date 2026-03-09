import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    const users = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'auth_users'`;
    console.log('auth_users cols:', users.map(c => c.column_name).join(', '));
    const emp = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'employees'`;
    console.log('employees cols:', emp.map(c => c.column_name).join(', '));
  } catch(e) { console.error(e); }
}
check();
