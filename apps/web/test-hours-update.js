
import sql from './src/app/api/utils/sql.js';

async function test() {
    try {
        console.log('Testing Hours Update...');
        // 1. Get a shift
        const [shift] = await sql`SELECT * FROM shifts LIMIT 1`;
        if (!shift) { console.log('No shifts found'); process.exit(0); }
        console.log('Testing update on shift:', shift.id);

        // 2. Simulate Update
        const updated = await sql`
      UPDATE shifts
      SET 
        actual_start_time = ${shift.start_time},
        actual_end_time = ${shift.end_time},
        status = 'verified'
      WHERE id = ${shift.id}
      RETURNING *
    `;
        console.log('Update success! Status:', updated[0].status);
    } catch (e) {
        console.error('Update failed:', e);
    }
    process.exit(0);
}

test();
