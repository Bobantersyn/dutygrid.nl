import sql from './src/app/api/utils/sql.js';

async function seedAvailability() {
    try {
        console.log('🌱 Seeding 3 Test Employees for Availability Check...');

        // 1. Lisa Verhoeven (Type B - Default Available 7/7)
        // First clean up if exists
        await sql`DELETE FROM employees WHERE email = 'lisa.test@dutygrid.nl'`;

        const [lisa] = await sql`
      INSERT INTO employees (name, email, status, can_manage_own_availability, max_hours_per_week)
      VALUES ('Lisa Verhoeven', 'lisa.test@dutygrid.nl', 'active', false, 40)
      RETURNING id
    `;
        console.log(`Created Lisa (Type B - Default Available) - ID: ${lisa.id}`);

        // 2. Tom Tests (Type A - Available Mon, Tue, Wed)
        await sql`DELETE FROM employees WHERE email = 'tom.test@dutygrid.nl'`;

        const [tom] = await sql`
      INSERT INTO employees (name, email, status, can_manage_own_availability, max_hours_per_week)
      VALUES ('Tom Tests', 'tom.test@dutygrid.nl', 'active', true, 32)
      RETURNING id
    `;

        // Patterns for Tom (1=Mon, 2=Tue, 3=Wed)
        // Note: day_of_week 0=Sunday, 1=Monday...
        await sql`DELETE FROM availability_patterns WHERE employee_id = ${tom.id}`;
        await sql`
      INSERT INTO availability_patterns (employee_id, day_of_week, start_time, end_time, is_available)
      VALUES 
      (${tom.id}, 1, '08:00', '17:00', true),
      (${tom.id}, 2, '08:00', '17:00', true),
      (${tom.id}, 3, '08:00', '12:00', true)
    `;
        console.log(`Created Tom (Type A - 3 Days) - ID: ${tom.id}`);

        // 3. Sarah Weekend (Type A - Available Sat, Sun)
        await sql`DELETE FROM employees WHERE email = 'sarah.test@dutygrid.nl'`;

        const [sarah] = await sql`
      INSERT INTO employees (name, email, status, can_manage_own_availability, max_hours_per_week)
      VALUES ('Sarah Weekend', 'sarah.test@dutygrid.nl', 'active', true, 16)
      RETURNING id
    `;

        // Patterns for Sarah (6=Sat, 0=Sun)
        await sql`DELETE FROM availability_patterns WHERE employee_id = ${sarah.id}`;
        await sql`
      INSERT INTO availability_patterns (employee_id, day_of_week, start_time, end_time, is_available)
      VALUES 
      (${sarah.id}, 6, '00:00', '23:59', true),
      (${sarah.id}, 0, '00:00', '23:59', true)
    `;
        console.log(`Created Sarah (Type A - Weekend) - ID: ${sarah.id}`);

        console.log('✅ Successfully seeded 3 employees with availability.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding availability:', err);
        process.exit(1);
    }
}

seedAvailability();
