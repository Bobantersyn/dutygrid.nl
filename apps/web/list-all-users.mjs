import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
const sql = neon(process.env.DATABASE_URL);
async function run() {
    try {
        const rows = await sql`SELECT id, email, company_name FROM auth_users ORDER BY id DESC`;
        console.log(rows);
    } catch(e) { console.error(e); }
}
run();
