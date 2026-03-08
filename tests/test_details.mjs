import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/Users/roland/.gemini/antigravity/playground/Eigen Projecten /DutyGrid/anything/apps/web/.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    const companyId = 'non_existent';
    try {
        const { rows: owners } = await pool.query(`
        SELECT id, email, name, company_name as name, kvk_number, company_size, subscription_status, trial_ends_at, created_at 
        FROM auth_users 
        LIMIT 1
    `);
        console.log('Owners Table Check passed:', owners.length > 0);
    } catch (e) { console.error('Error owners:', e); }

    try {
        const { rows: users } = await pool.query(`
        SELECT id, email, name, created_at, subscription_status
        FROM auth_users 
        LIMIT 1
    `);
        console.log('Users Table Check passed:', users.length > 0);
    } catch (e) { console.error('Error users:', e); }

    try {
        const { rows: activity } = await pool.query(`
        SELECT * FROM activity_log LIMIT 1
    `);
        console.log('Activity Log Table Check passed:', activity.length > 0);
    } catch (err) {
        console.error('SQL Error Activity Log:', err);
    } finally {
        await pool.end();
    }
}
check();
