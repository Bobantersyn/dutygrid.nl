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
        console.log('🚀 Running PLG trial schema migration directly...');

        await sql`
            ALTER TABLE auth_users
            ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trialing';
        `;
        console.log('✅ Added trial columns to auth_users');

        await sql`
            CREATE OR REPLACE FUNCTION set_trial_ends_at()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.trial_ends_at IS NULL THEN
                    NEW.trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '14 days';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `;
        console.log('✅ Created trigger function');

        await sql`DROP TRIGGER IF EXISTS trg_set_trial_ends_at ON auth_users;`;

        await sql`
            CREATE TRIGGER trg_set_trial_ends_at
            BEFORE INSERT ON auth_users
            FOR EACH ROW
            WHEN (NEW.subscription_status = 'trialing')
            EXECUTE FUNCTION set_trial_ends_at();
        `;
        console.log('✅ Attached trigger to auth_users');

        console.log('🎉 Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
