import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
    try {
        const { rows: cols } = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name IN ('auth_users', 'employees', 'user_roles', 'clients', 'assignments', 'shifts', 'incidents')
        ORDER BY table_name, ordinal_position;
    `);
        for (const r of cols) console.log(`${r.column_name} (${r.data_type})`);
        
    } catch (e) { console.error('Error:', e); } finally { await pool.end(); }
}
check();
