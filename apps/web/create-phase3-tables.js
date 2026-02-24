import { neon } from '@neondatabase/serverless';

async function runMigration() {
    const DATABASE_URL = 'postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(DATABASE_URL);

    try {
        console.log('Creating audit_logs table...');
        await sql`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
                action VARCHAR(255) NOT NULL,
                entity VARCHAR(255) NOT NULL,
                entity_id INTEGER,
                changes JSONB,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Successfully created audit_logs table.');

        console.log('Creating planning table...');
        await sql`
            CREATE TABLE IF NOT EXISTS planning (
                id SERIAL PRIMARY KEY,
                week_number INTEGER NOT NULL,
                year INTEGER NOT NULL,
                created_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
                approved_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
                status VARCHAR(50) DEFAULT 'draft',
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(week_number, year)
            );
        `;
        console.log('Successfully created planning table.');

    } catch (error) {
        console.error('Migration Error:', error);
    }
}

runMigration();
