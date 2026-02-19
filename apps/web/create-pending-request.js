import sql from './src/app/api/utils/sql.js';

async function createPending() {
    try {
        const [emp] = await sql`SELECT id FROM employees WHERE email = 'test@dutygrid.nl'`;
        const [asm] = await sql`SELECT id FROM assignments LIMIT 1`;

        // Day after tomorrow
        const d = new Date();
        d.setDate(d.getDate() + 2);
        const dateStr = d.toISOString().split('T')[0];
        const startTime = `${dateStr}T12:00:00`;
        const endTime = `${dateStr}T20:00:00`;

        const [shift] = await sql`
      INSERT INTO shifts (assignment_id, employee_id, start_time, end_time, status)
      VALUES (${asm.id}, ${emp.id}, ${startTime}, ${endTime}, 'published')
      RETURNING id
    `;

        const [req] = await sql`
      INSERT INTO shift_swap_requests (shift_id, requesting_employee_id, swap_type, status, reason)
      VALUES (${shift.id}, ${emp.id}, 'takeover', 'pending', 'Graag overnemen ivm feestje')
      RETURNING id
    `;

        console.log(`Created Pending Request: ${req.id} for Shift ${shift.id}`);
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createPending();
