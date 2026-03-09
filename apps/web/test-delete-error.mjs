import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const users = await sql`
            SELECT id FROM auth_users 
            WHERE email LIKE '%@%.dutygrid-staging.local' 
               OR email LIKE 'test+%@dutygrid.test'
               OR company_name ILIKE 'Test %'
        `;
        const userIds = users.map(u => u.id).slice(0, 1);
        if (userIds.length > 0) {
            console.log("Attempting test delete for user:", userIds[0]);
            await sql`DELETE FROM auth_users WHERE id = ${userIds[0]}`;
            console.log("Success (unexpected).");
        } else {
            console.log("No users found to test delete.");
        }
    } catch (e) {
        console.error("RAW POSTGRES ERROR:");
        console.error(e);
    }
}
run();
