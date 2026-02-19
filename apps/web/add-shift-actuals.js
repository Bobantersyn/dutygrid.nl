import sql from './src/app/api/utils/sql.js';

async function up() {
    try {
        console.log('📦 Updating shifts table with actuals...');

        // Add columns if they don't exist
        await sql`
      ALTER TABLE shifts 
      ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP,
      ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP,
      ADD COLUMN IF NOT EXISTS actual_break_minutes INTEGER,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'planned',
      ADD COLUMN IF NOT EXISTS admin_notes TEXT
    `;

        // Index on status for faster filtering
        await sql`CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON shifts(start_time)`;

        console.log('✅ Success: Shifts table updated.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

up();
