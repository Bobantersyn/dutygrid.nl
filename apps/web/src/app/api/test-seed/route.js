import sql from "@/app/api/utils/sql";

export async function GET(request) {
    try {
        console.log("Seeding test data for billing...");

        // Get a client and an assignment, or create them
        let clientRes = await sql`SELECT id FROM clients LIMIT 1`;
        let clientId = clientRes[0]?.id;

        if (!clientId) {
            console.log("No clients found, creating one...");
            const newClient = await sql`INSERT INTO clients (name, email) VALUES ('Jumbo Supermarkten', 'jumbo@example.com') RETURNING *`;
            clientId = newClient[0].id;
        }

        let assignmentRes = await sql`SELECT id FROM assignments WHERE client_id = ${clientId} LIMIT 2`;

        if (assignmentRes.length === 0) {
            console.log("No assignments found for client, creating some...");
            await sql`INSERT INTO assignments (client_id, location_name, location_address) VALUES (${clientId}, 'Jumbo Amsterdam Centrum', 'Amsterdam')`;
            await sql`INSERT INTO assignments (client_id, location_name, location_address) VALUES (${clientId}, 'Jumbo Utrecht', 'Utrecht')`;
            assignmentRes = await sql`SELECT id FROM assignments WHERE client_id = ${clientId} LIMIT 2`;
        }

        const assignmentId1 = assignmentRes[0]?.id;
        const assignmentId2 = assignmentRes[1]?.id || assignmentId1;

        // Get an employee
        const employeeRes = await sql`SELECT id FROM employees LIMIT 1`;
        let employeeId = employeeRes[0]?.id;

        if (!employeeId) {
            const newEmp = await sql`INSERT INTO employees (name, role, email, password_hash) VALUES ('Test Beveiliger', 'guard', 'guard@test.com', 'xxx') RETURNING id`;
            employeeId = newEmp[0].id;
        }

        // Insert shifts for the current month (Feb 2026)
        const currentMonth = new Date().toISOString().substring(0, 7);

        const shiftsToAdd = [
            { start: `${currentMonth}-05 08:00:00`, end: `${currentMonth}-05 16:00:00`, assignment_id: assignmentId1 },
            { start: `${currentMonth}-12 09:00:00`, end: `${currentMonth}-12 17:00:00`, assignment_id: assignmentId1 },
            { start: `${currentMonth}-15 18:00:00`, end: `${currentMonth}-16 02:00:00`, assignment_id: assignmentId2 },
            { start: `${currentMonth}-20 22:00:00`, end: `${currentMonth}-21 06:00:00`, assignment_id: assignmentId2 },
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

        return Response.json({ success: true, message: `Seeding complete! Added ${inserted} verified shifts for month ${currentMonth}.` });
    } catch (error) {
        console.error("Error seeding:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
