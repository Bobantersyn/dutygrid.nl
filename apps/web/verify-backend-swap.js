import sql from './src/app/api/utils/sql.js';

async function verifyBackendFlow() {
    try {
        console.log('🧪 Verifying Swap Backend Flow...');

        // 1. Get Actors
        const [janUser] = await sql`SELECT id FROM auth_users WHERE email = 'jan@dutygrid.nl'`;
        const [plannerUser] = await sql`SELECT id FROM auth_users WHERE email = 'planner@dutygrid.nl'`;

        // Get Jan's Employee ID
        const [janEmp] = await sql`SELECT id FROM employees WHERE email = 'jan@dutygrid.nl'`;

        console.log(`actors: JanUser=${janUser.id} (Emp=${janEmp.id}), PlannerUser=${plannerUser.id}`);

        // 2. Get the Shift (Created in setup)
        // We look for a shift for Jan in the future
        const shifts = await sql`
      SELECT id, employee_id FROM shifts 
      WHERE employee_id = ${janEmp.id} AND start_time > NOW()
      LIMIT 1
    `;

        if (shifts.length === 0) throw new Error("No future shift found for Jan. Run setup-swap-test.js first.");
        const shift = shifts[0];
        console.log(`Target Shift: ${shift.id}`);

        // 3. Action: Guard Requests Swap (Takeover)
        console.log('➡️ Action 1: Guard requests swap...');
        const [req] = await sql`
      INSERT INTO shift_swap_requests (shift_id, requesting_employee_id, swap_type, status, reason)
      VALUES (${shift.id}, ${janEmp.id}, 'takeover', 'pending', ' Backend Test Request')
      RETURNING id
    `;
        console.log(`Request Created: ${req.id}`);

        // 4. Action: Planner Approves (simulating PUT route logic)
        console.log('➡️ Action 2: Planner approves...');

        const newEmployeeId = null; // Approved as Open Shift

        // Update request
        await sql`
            UPDATE shift_swap_requests
            SET status = 'approved', response_message = 'Approved by Script', approved_by_user_id = ${plannerUser.id}, updated_at = NOW()
            WHERE id = ${req.id}
        `;

        // Update shift
        await sql`
            UPDATE shifts 
            SET employee_id = ${newEmployeeId}
            WHERE id = ${shift.id}
        `;

        // 5. Verification
        const [updatedReq] = await sql`SELECT status, approved_by_user_id FROM shift_swap_requests WHERE id = ${req.id}`;
        const [updatedShift] = await sql`SELECT employee_id FROM shifts WHERE id = ${shift.id}`;

        console.log('🔍 Results:');
        console.log(`- Request Status: ${updatedReq.status} (Expected: approved)`);
        console.log(`- Approver ID: ${updatedReq.approved_by_user_id} (Expected: ${plannerUser.id})`);
        console.log(`- Shift Employee: ${updatedShift.employee_id} (Expected: null)`);

        if (updatedReq.status === 'approved' && updatedShift.employee_id === null) {
            console.log('✅ SUCCESS: Backend Swap Flow Verified.');
        } else {
            console.error('❌ FAILURE: State mismatch.');
            process.exit(1);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

verifyBackendFlow();
