import sql from './src/app/api/utils/sql.js';
import { hash } from 'argon2';

async function setup() {
    try {
        console.log('🧪 Setting up Swap Test Scenario...');

        // 1. Basic Seed (Users & Employees)
        console.log('   Running base seed...');
        // We'll just replicate the essential parts of seed-e2e here to be safe and self-contained

        // Clear old test data
        const today = new Date().toISOString().split('T')[0];
        await sql`DELETE FROM shifts WHERE start_time::date >= ${today}`;
        await sql`DELETE FROM shift_swap_requests`;

        // Ensure Client & Assignment
        let [client] = await sql`SELECT id FROM clients WHERE name = 'E2E Client'`;
        if (!client) {
            [client] = await sql`INSERT INTO clients (name, email) VALUES ('E2E Client', 'e2e@client.com') RETURNING id`;
        }

        await sql`DELETE FROM assignments WHERE name = 'Object Delta'`;
        const [assignment] = await sql`
      INSERT INTO assignments (client_id, name, address, status)
      VALUES (${client.id}, 'Object Delta', 'Deltaweg 1, Amsterdam', 'active')
      RETURNING id
    `;

        // Ensure Employees (Jan & Piet)
        await sql`DELETE FROM employees WHERE email = 'jan@dutygrid.nl'`;
        const [jan] = await sql`INSERT INTO employees (name, email, status, max_hours_per_week) VALUES ('Jan de Vries', 'jan@dutygrid.nl', 'active', 40) RETURNING id`;

        await sql`DELETE FROM employees WHERE email = 'piet@dutygrid.nl'`;
        const [piet] = await sql`INSERT INTO employees (name, email, status, max_hours_per_week) VALUES ('Piet Jansen', 'piet@dutygrid.nl', 'active', 40) RETURNING id`;

        // Ensure Users
        const pw = await hash('password123');

        // Planner
        let [plannerUser] = await sql`SELECT id FROM auth_users WHERE email = 'planner@dutygrid.nl'`;
        if (!plannerUser) {
            [plannerUser] = await sql`INSERT INTO auth_users (email, password, name) VALUES ('planner@dutygrid.nl', ${pw}, 'Planner Boss') RETURNING id`;
        } else {
            await sql`UPDATE auth_users SET password = ${pw} WHERE id = ${plannerUser.id}`;
        }
        await sql`DELETE FROM user_roles WHERE user_id = ${plannerUser.id}`;
        await sql`INSERT INTO user_roles (user_id, role) VALUES (${plannerUser.id}, 'planner')`;

        // Guard (Jan)
        let [guardUser] = await sql`SELECT id FROM auth_users WHERE email = 'jan@dutygrid.nl'`;
        if (!guardUser) {
            [guardUser] = await sql`INSERT INTO auth_users (email, password, name) VALUES ('jan@dutygrid.nl', ${pw}, 'Jan de Vries') RETURNING id`;
        } else {
            await sql`UPDATE auth_users SET password = ${pw} WHERE id = ${guardUser.id}`;
        }
        await sql`DELETE FROM user_roles WHERE user_id = ${guardUser.id}`;
        await sql`INSERT INTO user_roles (user_id, role, employee_id) VALUES (${guardUser.id}, 'beveiliger_extended', ${jan.id})`;

        console.log('✅ Base users ready.');

        // 2. Create Shift for Jan Tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const [shift] = await sql`
      INSERT INTO shifts (employee_id, assignment_id, start_time, end_time, break_minutes, status)
      VALUES (
        ${jan.id}, 
        ${assignment.id}, 
        ${dateStr + 'T09:00:00'}, 
        ${dateStr + 'T17:00:00'}, 
        30, 
        'published'
      )
      RETURNING id
    `;

        console.log(`✅ Created shift for Jan on ${dateStr} (ID: ${shift.id})`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error setting up:', err);
        process.exit(1);
    }
}

setup();
