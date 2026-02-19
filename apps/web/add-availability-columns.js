
import sql from './src/app/api/utils/sql.js';

async function migrate() {
    try {
        console.log('Adding availability override columns to shifts table...');

        await sql`
      ALTER TABLE shifts 
      ADD COLUMN IF NOT EXISTS availability_override_approved BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS availability_override_note TEXT
    `;

        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
}

migrate();
