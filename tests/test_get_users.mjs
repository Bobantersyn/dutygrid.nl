import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/roland/.gemini/antigravity/playground/Eigen Projecten /DutyGrid/anything/apps/web/.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const { rows: users } = await pool.query(`
        SELECT id, email, name, created_at 
        FROM auth_users 
        ORDER BY created_at DESC 
        LIMIT 5
    `);
        console.log('Recent users:', JSON.stringify(users, null, 2));

        const { rows: sessions } = await pool.query(`
        SELECT * FROM auth_sessions 
        ORDER BY created_at DESC 
        LIMIT 2
    `);
        console.log('Recent sessions:', JSON.stringify(sessions, null, 2));

    } catch (err) {
        console.error('SQL Error:', err.message);
    } finally {
        await pool.end();
    }
}
check();
