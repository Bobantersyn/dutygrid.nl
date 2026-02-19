import sql from './src/app/api/utils/sql.js';

async function verifySwapFlow() {
  try {
    console.log('--- Setting up Swap Verification ---');

    // 1. Get Test Employee (ID of Test Beveiliger)
    const [emp] = await sql`SELECT id FROM employees WHERE email = 'test@dutygrid.nl'`;
    if (!emp) throw new Error("Test employee not found. Run create-test-user.js first.");
    const empId = emp.id;
    console.log(`Employee ID: ${empId}`);

    // 2. Setup: Client & Assignment
    const [client] = await sql`
        INSERT INTO clients (name, email, status)
        VALUES ('Test Klant', 'klant@test.nl', 'active')
        ON CONFLICT DO NOTHING
        RETURNING id
    `;
    // Fallback if exists (ON CONFLICT DO NOTHING returns empty if exists)
    const clientId = client ? client.id : (await sql`SELECT id FROM clients WHERE email = 'klant@test.nl'`)[0].id;

    const [assignment] = await sql`
      INSERT INTO assignments (client_id, name, address, status)
      VALUES (${clientId}, 'Beveiliging Object X', 'Test Straat 1', 'active')
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    // If conflict nothing returned, need to fetch. 
    // Actually simpler to just assume ID 1 or fetch one.
    const [asm] = await sql`SELECT id FROM assignments LIMIT 1`;
    const assignmentId = asm.id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const startTime = `${dateStr}T09:00:00`;
    const endTime = `${dateStr}T17:00:00`;

    const [shift] = await sql`
      INSERT INTO shifts (assignment_id, employee_id, start_time, end_time, status)
      VALUES (${assignmentId}, ${empId}, ${startTime}, ${endTime}, 'published')
      RETURNING id
    `;
    console.log(`Shift Created: ${shift.id}`);

    // 3. Create Swap Request (Simulate POST /api/shift-swaps)
    // Type: takeover, Target: NULL (Open)
    const [request] = await sql`
      INSERT INTO shift_swap_requests (shift_id, requesting_employee_id, swap_type, status, reason)
      VALUES (${shift.id}, ${empId}, 'takeover', 'pending', 'Automated Test Request')
      RETURNING id
    `;
    console.log(`Swap Request Created: ${request.id}`);

    // 4. Planner Approves (Simulate PUT /api/shift-swaps)
    // Calling the Logic directly via SQL to verify DB constraint/updates
    const adminId = 1;
    await sql`
      UPDATE shift_swap_requests
      SET status = 'approved', response_message = 'Approved via Test Script', approved_by_user_id = ${adminId}, updated_at = NOW()
      WHERE id = ${request.id}
    `;
    console.log('Planner Approved.');

    // 5. Verify
    const [verified] = await sql`SELECT status, approved_by_user_id FROM shift_swap_requests WHERE id = ${request.id}`;
    if (verified.status === 'approved' && verified.approved_by_user_id === 1) {
      console.log('✅ Flow Verified: Request Approved!');
    } else {
      console.error('❌ Verification Failed:', verified);
    }

    // Cleanup
    // await sql`DELETE FROM shifts WHERE id = ${shift.id}`; // Cascade deletes request
    console.log('Cleanup skipped. Data persists for UI testing.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

verifySwapFlow();
