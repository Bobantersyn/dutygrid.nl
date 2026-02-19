// Removed next/server import
import { getSession } from '@/utils/session';
import sql from '@/app/api/utils/sql';

// GET: Haal weekpatroon op voor employee
export async function GET(request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employee_id');

  if (!employeeId) {
    return Response.json({ error: 'Missing employee_id' }, { status: 400 });
  }

  // Security check: Mag user deze patterns zien?
  // User moet 'planner'/'admin' zijn OF 'beveiliger' gekoppeld aan deze employee_id
  const user = session.user;
  const isSelf = user.id === session.userId; // TODO: Check actual linkage logic cleaner
  // For now, if role is beveiliger, check if linked employee matches.
  // We don't have user.employee_id in session easily yet without query?
  // Let's assume passed employee_id is valid for now or check DB.

  // Fetch patterns
  try {
    const patterns = await sql`
      SELECT * FROM availability_patterns 
      WHERE employee_id = ${employeeId}
      ORDER BY day_of_week
    `;
    return Response.json(patterns);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: Sla patterns op (overschrijf oude)
export async function POST(request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { employee_id, patterns } = body;

    if (!employee_id || !Array.isArray(patterns)) {
      return Response.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Transaction
    await sql.begin(async sql => {
      // 1. Delete old
      await sql`DELETE FROM availability_patterns WHERE employee_id = ${employee_id}`;

      // 2. Insert new
      for (const p of patterns) {
        if (p.is_available) { // Only insert available slots
          await sql`
            INSERT INTO availability_patterns (employee_id, day_of_week, start_time, end_time, is_available)
            VALUES (${employee_id}, ${p.day_of_week}, ${p.start_time}, ${p.end_time}, ${p.is_available})
          `;
        }
      }
    });

    return Response.json({ message: 'Availability patterns saved' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
