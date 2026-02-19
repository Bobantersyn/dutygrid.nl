import sql from './src/app/api/utils/sql.js';
import { hash } from 'argon2';

async function seed() {
  try {
    console.log('🌱 Seeding E2E Data (v2)...');

    // 1. Cleanup Future
    const today = new Date().toISOString().split('T')[0];
    await sql`DELETE FROM shifts WHERE start_time::date >= ${today}`;
    await sql`DELETE FROM shift_swap_requests`;
    console.log('✅ Future shifts & swaps cleared.');

    // 2. Client & Assignment
    // Client
    let [client] = await sql`SELECT id FROM clients WHERE name = 'E2E Client'`;
    if (!client) {
      [client] = await sql`
        INSERT INTO clients (name, email) VALUES ('E2E Client', 'e2e@client.com') 
        RETURNING id
      `;
    }

    // Assignment
    await sql`DELETE FROM assignments WHERE name = 'Object Delta'`;
    const [assignment] = await sql`
      INSERT INTO assignments (client_id, name, address, status)
      VALUES (${client.id}, 'Object Delta', 'Deltaweg 1, Amsterdam', 'active')
      RETURNING id
    `;
    console.log(`✅ Assignment '${assignment.id}' ready.`);

    // 3. Employees
    // Jan
    await sql`DELETE FROM employees WHERE email = 'jan@dutygrid.nl'`;
    const [jan] = await sql`
      INSERT INTO employees (name, email, status, max_hours_per_week)
      VALUES ('Jan de Vries', 'jan@dutygrid.nl', 'active', 40)
      RETURNING id
    `;
    // Piet
    await sql`DELETE FROM employees WHERE email = 'piet@dutygrid.nl'`;
    const [piet] = await sql`
      INSERT INTO employees (name, email, status, max_hours_per_week)
      VALUES ('Piet Jansen', 'piet@dutygrid.nl', 'active', 40)
      RETURNING id
    `;
    console.log(`✅ Employees ready: Jan=${jan.id}, Piet=${piet.id}`);

    // 4. Users (auth_users)
    const pw = await hash('password123');

    // Planner
    let [plannerUser] = await sql`SELECT id FROM auth_users WHERE email = 'planner@dutygrid.nl'`;
    if (!plannerUser) {
      [plannerUser] = await sql`
        INSERT INTO auth_users (email, password, name, "emailVerified")
        VALUES ('planner@dutygrid.nl', ${pw}, 'Planner Boss', null)
        RETURNING id
        `;
    } else {
      // Update password just in case
      await sql`UPDATE auth_users SET password = ${pw} WHERE id = ${plannerUser.id}`;
    }

    // Roles
    await sql`DELETE FROM user_roles WHERE user_id = ${plannerUser.id}`;
    await sql`INSERT INTO user_roles (user_id, role) VALUES (${plannerUser.id}, 'planner')`;

    // Guard (Jan)
    let [guardUser] = await sql`SELECT id FROM auth_users WHERE email = 'jan@dutygrid.nl'`;
    if (!guardUser) {
      [guardUser] = await sql`
        INSERT INTO auth_users (email, password, name, "emailVerified")
        VALUES ('jan@dutygrid.nl', ${pw}, 'Jan de Vries', null)
        RETURNING id
        `;
    } else {
      await sql`UPDATE auth_users SET password = ${pw} WHERE id = ${guardUser.id}`;
    }

    // Roles
    await sql`DELETE FROM user_roles WHERE user_id = ${guardUser.id}`;
    await sql`INSERT INTO user_roles (user_id, role, employee_id) VALUES (${guardUser.id}, 'beveiliger_extended', ${jan.id})`;

    console.log('✅ Users ready (password123): planner@dutygrid.nl, jan@dutygrid.nl');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding:', err);
    process.exit(1);
  }
}

seed();
