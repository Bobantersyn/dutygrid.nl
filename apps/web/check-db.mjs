import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

console.log("Connecting to DB...");
const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const users = await sql`SELECT email, company_name FROM auth_users ORDER BY created_at DESC LIMIT 20`;
        console.log("LATEST USERS in DB:");
        console.log(users);
    } catch(e) { console.error(e); }
}
run();
