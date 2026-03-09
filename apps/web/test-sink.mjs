import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const rows = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'staging_mail_sink';`;
        console.log("Schema for staging_mail_sink:", rows);
    } catch(e) { console.error(e); }
}
run();
