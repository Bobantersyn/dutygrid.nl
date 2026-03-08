import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/roland/.gemini/antigravity/playground/Eigen Projecten /DutyGrid/anything/apps/web/.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const { rows: cols } = await pool.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'auth_sessions';
    `);
        console.log('Columns:', JSON.stringify(cols, null, 2));
    } catch (e) { console.error('Error:', e); } finally { await pool.end(); }
}
check();
