import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env.production.local') });

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const reqs = await sql`SELECT * FROM leave_requests ORDER BY created_at DESC LIMIT 5`;
        console.log("Leave requests in DB:");
        console.dir(reqs, { depth: null });
    } catch (e) {
        console.error(e);
    }
}
run();
