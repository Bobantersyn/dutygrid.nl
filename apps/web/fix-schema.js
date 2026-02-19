import sql from './src/app/api/utils/sql.js';

async function fixSchema() {
  try {
    console.log('🛠 Fixing Database Schema (Tables & Columns)...');

    // 1. Employees table updates
    await sql`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS can_manage_own_availability BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT
    `;
    console.log('✅ Updated employees table');

    // 2. availability_patterns table
    await sql`
      CREATE TABLE IF NOT EXISTS availability_patterns (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL, -- 0=Sun, 1=Mon...
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Ensured availability_patterns table');

    // 3. availability_exceptions table
    await sql`
      CREATE TABLE IF NOT EXISTS availability_exceptions (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        exception_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        is_available BOOLEAN NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    // Ensure columns exist (in case table existed with old schema)
    await sql`ALTER TABLE availability_exceptions ADD COLUMN IF NOT EXISTS exception_date DATE`;
    await sql`ALTER TABLE availability_exceptions ADD COLUMN IF NOT EXISTS is_available BOOLEAN`;
    await sql`ALTER TABLE availability_exceptions ADD COLUMN IF NOT EXISTS start_time TIME`;
    await sql`ALTER TABLE availability_exceptions ADD COLUMN IF NOT EXISTS end_time TIME`;
    await sql`ALTER TABLE availability_exceptions ADD COLUMN IF NOT EXISTS reason TEXT`;

    console.log('✅ Ensured availability_exceptions table and columns');

    // Ensure availability_patterns columns too
    await sql`ALTER TABLE availability_patterns ADD COLUMN IF NOT EXISTS day_of_week INTEGER`;
    await sql`ALTER TABLE availability_patterns ADD COLUMN IF NOT EXISTS start_time TIME`;
    await sql`ALTER TABLE availability_patterns ADD COLUMN IF NOT EXISTS end_time TIME`;
    await sql`ALTER TABLE availability_patterns ADD COLUMN IF NOT EXISTS is_available BOOLEAN`;

    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing schema:', err);
    process.exit(1);
  }
}

fixSchema();
