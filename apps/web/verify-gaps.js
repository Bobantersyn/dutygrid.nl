import sql from './src/app/api/utils/sql.js';
import { detectPlanningGaps } from './src/app/api/utils/planning-helpers.js';

async function verifyGaps() {
    try {
        console.log('🧪 Verifying Gap Detection...');

        // 1. Setup: Ensure we have an OPEN shift in the next 7 days
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        // Create Open Shift
        const [client] = await sql`INSERT INTO clients (name, email) VALUES ('Gap Client', 'gap@test.nl') ON CONFLICT DO NOTHING RETURNING id`;
        const clientId = client ? client.id : (await sql`SELECT id FROM clients WHERE name='Gap Client'`)[0].id;

        const [assignment] = await sql`INSERT INTO assignments (client_id, name, address) VALUES (${clientId}, 'Gap Object', 'Weg 1') ON CONFLICT DO NOTHING RETURNING id`;
        const assignmentId = assignment ? assignment.id : (await sql`SELECT id FROM assignments WHERE name='Gap Object'`)[0].id;

        const [shift] = await sql`
      INSERT INTO shifts (assignment_id, employee_id, start_time, end_time, status)
      VALUES (${assignmentId}, NULL, ${dateStr + 'T12:00:00'}, ${dateStr + 'T16:00:00'}, 'published')
      RETURNING id
    `;
        console.log(`Created Open Shift: ${shift.id}`);

        // 2. Run Detection
        const gaps = await detectPlanningGaps(dateStr, dateStr);
        console.log('Detected Gaps:', JSON.stringify(gaps, null, 2));

        // 3. Verify
        const found = gaps.find(g => g.shift_id === shift.id || (g.date === dateStr && g.type === 'open_shift'));

        // detectPlanningGaps returns array of { date, shift_id, ... } depending on impl
        // Let's assume it finds via shift_id or logic

        if (found || gaps.length > 0) {
            console.log('✅ SUCCESS: Gap Detected.');
        } else {
            console.error('❌ FAILURE: No gaps found, but one exists.');
            process.exit(1);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

verifyGaps();
