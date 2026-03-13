import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The dotenv config when run from the monorepo root using `node apps/web/scripts/...`
dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.production.local') });
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const sqlContent = fs.readFileSync(path.resolve(__dirname, '../../../migrations/011_leave_requests.sql'), 'utf-8');
        console.log('Running migration...');

        // Split by semicolons for Neon's simple query executor if multiple statements fail
        const statements = sqlContent.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const stmt of statements) {
            console.log(`Executing: ${stmt.substring(0, 50)}...`);
            await sql(stmt + ';');
        }

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

run();
