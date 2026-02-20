const { Client } = require('pg');
require('dotenv').config({ path: 'apps/web/.env.production.local' });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL + "?sslmode=require",
  });

  try {
    await client.connect();
    console.log("Connected to DB, seeding billing data for Feb 2026...");

    // Get a client and an assignment
    let res = await client.query('SELECT id FROM clients LIMIT 1');
    let clientId = res.rows[0]?.id;

    if (!clientId) {
      console.log("Creating Jumbo client...");
      const newClient = await client.query("INSERT INTO clients (name, email) VALUES ('Jumbo Supermarkten', 'jumbo@example.com') RETURNING *");
      clientId = newClient.rows[0].id;
    }

    res = await client.query('SELECT id FROM assignments WHERE client_id = $1 LIMIT 2', [clientId]);

    if (res.rowCount === 0) {
      console.log("Creating assignments...");
      await client.query("INSERT INTO assignments (client_id, location_name, location_address) VALUES ($1, 'Jumbo Amsterdam Centrum', 'Amsterdam')", [clientId]);
      await client.query("INSERT INTO assignments (client_id, location_name, location_address) VALUES ($1, 'Jumbo Utrecht', 'Utrecht')", [clientId]);
      res = await client.query('SELECT id FROM assignments WHERE client_id = $1 LIMIT 2', [clientId]);
    }

    const assignmentId1 = res.rows[0]?.id;
    const assignmentId2 = res.rows[1]?.id || assignmentId1;

    // Get an employee
    res = await client.query("SELECT id FROM employees LIMIT 1");
    let employeeId = res.rows[0]?.id;

    if (!employeeId) {
      console.log("Creating employee...");
      const newEmp = await client.query("INSERT INTO employees (name, role, email, password_hash) VALUES ('Test Beveiliger', 'guard', 'guard@test.com', 'xxx') RETURNING id");
      employeeId = newEmp.rows[0].id;
    }

    const currentMonth = "2026-02"; // Force to Feb 2026 as per time context
    const shiftsToAdd = [
      { start: `${currentMonth}-05 08:00:00`, end: `${currentMonth}-05 16:00:00`, assignment_id: assignmentId1 },
      { start: `${currentMonth}-12 09:00:00`, end: `${currentMonth}-12 17:00:00`, assignment_id: assignmentId1 },
      { start: `${currentMonth}-15 18:00:00`, end: `${currentMonth}-16 02:00:00`, assignment_id: assignmentId2 },
      { start: `${currentMonth}-20 22:00:00`, end: `${currentMonth}-21 06:00:00`, assignment_id: assignmentId2 },
      { start: `${currentMonth}-25 07:00:00`, end: `${currentMonth}-25 15:00:00`, assignment_id: assignmentId2 },
    ];

    let inserted = 0;
    for (const s of shiftsToAdd) {
      // Check if already exists lightly
      const existing = await client.query("SELECT id FROM shifts WHERE employee_id=$1 AND start_time=$2", [employeeId, s.start]);
      if (existing.rowCount === 0) {
        await client.query(`
          INSERT INTO shifts (employee_id, assignment_id, start_time, end_time, actual_start_time, actual_end_time, actual_break_minutes, status)
          VALUES ($1, $2, $3, $4, $5, $6, 30, 'verified')
        `, [employeeId, s.assignment_id, s.start, s.end, s.start, s.end]);
        inserted++;
      }
    }

    console.log(`Successfully added ${inserted} verified test shifts for Feb 2026.`);
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await client.end();
  }
}

seed();
