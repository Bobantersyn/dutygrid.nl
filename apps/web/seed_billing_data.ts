import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seed() {
  try {
    console.log("Seeding test data for billing...");

    // Get a client and an assignment, or create them
    let clientRes = await sql`SELECT id FROM clients LIMIT 1`;
    let clientId = clientRes.rows[0]?.id;

    if (!clientId) {
      console.log("No clients found, creating one...");
      const newClient = await sql`INSERT INTO clients (name, email) VALUES ('Jumbo Supermarkten', 'jumbo@example.com') RETURNING *`;
      clientId = newClient.rows[0].id;
    }

    let assignmentRes = await sql`SELECT id FROM assignments WHERE client_id = ${clientId} LIMIT 2`;

    if (assignmentRes.rowCount === 0) {
      console.log("No assignments found for client, creating some...");
      await sql`INSERT INTO assignments (client_id, location_name, location_address) VALUES (${clientId}, 'Jumbo Amsterdam Centrum', 'Amsterdam')`;
      await sql`INSERT INTO assignments (client_id, location_name, location_address) VALUES (${clientId}, 'Jumbo Utrecht', 'Utrecht')`;
      assignmentRes = await sql`SELECT id FROM assignments WHERE client_id = ${clientId} LIMIT 2`;
    }

    const assignmentId1 = assignmentRes.rows[0]?.id;
    const assignmentId2 = assignmentRes.rows[1]?.id || assignmentId1;

    // Get an employee
    const employeeRes = await sql`SELECT id FROM employees LIMIT 1`;
    let employeeId = employeeRes.rows[0]?.id;

    if (!employeeId) {
      const newEmp = await sql`INSERT INTO employees (name, role, email) VALUES ('Test Beveiliger', 'guard', 'guard@test.com') RETURNING id`;
      employeeId = newEmp.rows[0].id;
    }

    // Insert shifts for the current month (Feb 2026)
    const currentMonth = new Date().toISOString().substring(0, 7);

    const shiftsToAdd = [
      { start: `${currentMonth}-05T08:00:00`, end: `${currentMonth}-05T16:00:00`, assignment_id: assignmentId1 },
      { start: `${currentMonth}-12T09:00:00`, end: `${currentMonth}-12T17:00:00`, assignment_id: assignmentId1 },
      { start: `${currentMonth}-15T18:00:00`, end: `${currentMonth}-16T02:00:00`, assignment_id: assignmentId2 },
      { start: `${currentMonth}-20T22:00:00`, end: `${currentMonth}-21T06:00:00`, assignment_id: assignmentId2 },
    ];

    let inserted = 0;
    for (const s of shiftsToAdd) {
      await sql`
        INSERT INTO shifts (employee_id, assignment_id, start_time, end_time, actual_start_time, actual_end_time, actual_break_minutes, status)
        VALUES (
          ${employeeId}, 
          ${s.assignment_id}, 
          ${s.start}, 
          ${s.end}, 
          ${s.start}, 
          ${s.end}, 
          30, 
          'verified'
        )
      `;
      inserted++;
    }

    console.log(`Seeding complete! Added ${inserted} verified shifts for month ${currentMonth}.`);
  } catch (error) {
    console.error("Error seeding:", error);
  }
}

seed();
