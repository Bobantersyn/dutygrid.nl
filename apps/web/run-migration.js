// Quick script to run base schema migration
import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = 'postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function runMigration() {
    try {
        console.log('📦 Reading base schema migration...');
        const migrationPath = join(__dirname, '..', '..', 'migrations', '000_base_schema.sql');
        const migrationSQL = await readFile(migrationPath, 'utf-8');

        console.log('🚀 Running migration...');

        // Split into statements - handle multi-line properly
        const statements = [];
        let currentStatement = '';

        for (const line of migrationSQL.split('\n')) {
            const trimmed = line.trim();

            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('--')) {
                continue;
            }

            currentStatement += line + '\n';

            // If line ends with semicolon, we have a complete statement
            if (trimmed.endsWith(';')) {
                statements.push(currentStatement.trim().slice(0, -1)); // Remove trailing semicolon
                currentStatement = '';
            }
        }

        console.log(`Found ${statements.length} statements`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            try {
                await sql(statement);
                successCount++;
                const preview = statement.substring(0, 60).replace(/\n/g, ' ');
                console.log(`✅ ${i + 1}/${statements.length}: ${preview}...`);
            } catch (error) {
                errorCount++;
                const preview = statement.substring(0, 60).replace(/\n/g, ' ');
                console.error(`❌ ${i + 1}/${statements.length}: ${preview}...`);
                console.error(`   Error: ${error.message}`);
                // Continue even if one fails
            }
        }

        console.log(`\n🎉 Migration complete!`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
