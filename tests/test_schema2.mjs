import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
    try {
        const { rows } = await pool.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'`);
        for (const r of rows) {
          if (['auth_users', 'employees', 'user_roles', 'clients', 'assignments', 'shifts', 'incidents'].includes(r.table_name)) {
            console.log(`${r.table_name}.${r.column_name} (${r.data_type})`);
          }
        }
    } catch (e) { console.error('Error:', e); } finally { await pool.end(); }
}
check();
