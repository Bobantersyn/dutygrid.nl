import sql from './src/app/api/utils/sql.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.join(process.cwd(), '../../migrations/002_schema_alignment.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration: 002_schema_alignment.sql');

        // Split by semicolons to run statements roughly sequentially (simple parser)
        // Actually neon 'sql' tag can define multiple statements if the driver supports it, 
        // but usually it is safer to run it as one block if supported or split.
        // Let's try running the whole block.

        // Split by semicolons, filtering out empty strings/comments-only
        const statements = migrationSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await sql(statement);
        }

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
