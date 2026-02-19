import sql from './src/app/api/utils/sql.js';

async function up() {
    try {
        console.log('📦 Creating system_settings table...');

        await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key text PRIMARY KEY,
        value jsonb NOT NULL,
        description text,
        updated_at timestamp DEFAULT NOW()
      )
    `;

        // Seed default travel cost if not exists
        await sql`
      INSERT INTO system_settings (key, value, description)
      VALUES ('travel_cost_per_km', '0.23', 'Standaard reiskostenvergoeding per km')
      ON CONFLICT (key) DO NOTHING
    `;

        console.log('✅ Success: Table created and seeded.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

up();
