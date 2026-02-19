import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function up() {
  try {
    console.log('📦 Creating leave_requests table...');

    await sql`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'vakantie', 'verlof', 'ziek', 'overig'
        note TEXT,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Index for fast lookup by employee and date
    await sql`
      CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_date 
      ON leave_requests(employee_id, start_date, end_date)
    `;

    console.log('✅ Success: Leave requests table created.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

up();
