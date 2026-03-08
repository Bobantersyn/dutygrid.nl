import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function run() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const target_user_id = 'test-string-id'; // Assume it's a string, e.g., UUID or simple id 24

    try {
        console.log('Querying target_user_id:', target_user_id);
        const { rows: targetUsers } = await pool.query('SELECT id, email, name FROM auth_users WHERE id = $1 LIMIT 1', [target_user_id]);
        console.log('Target Users:', targetUsers);
        
        if (targetUsers.length > 0) {
            const targetUser = targetUsers[0];
            const { rows: targetRoles } = await pool.query('SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1', [targetUser.id.toString()]);
            console.log('Target Roles:', targetRoles);
        }
    } catch (e) {
        console.error('Error in DB query:', e.message);
    } finally {
        await pool.end();
    }
}

run();
