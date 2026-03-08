import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

async function run() {
    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) {
            throw new Error("DATABASE_URL is not set in environment.");
        }
        const sql = neon(DATABASE_URL);

        // Read the migration file
        const filename = process.argv[2] || '006_saas_onboarding.sql';
        const migrationFile = path.resolve('migrations', filename);
        const sqlString = fs.readFileSync(migrationFile, 'utf8');

        console.log("Applying migration:", filename);

        // Execute the SQL
        // Split by semicolon for multiple statements support
        const statements = sqlString.split(';').map(s => s.trim()).filter(Boolean);
        if (typeof sql.query === 'function') {
            for (const stmt of statements) {
                await sql.query(stmt);
            }
            console.log("Migration applied successfully!");
        } else {
            // If sql.query doesn't exist (neon < 0.9.0), might need another way
            throw new Error("sql.query is not a function - cannot run dynamic SQL string.");
        }

    } catch (err) {
        console.error("Error applying migration:", err);
    }
}

run();
