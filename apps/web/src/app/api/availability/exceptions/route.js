// Cache buster: Fix import error
// Removed next/server import
import { getSession } from '@/utils/session';
import sql from '@/app/api/utils/sql';

// GET: Haal exceptions op
export async function GET(request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employee_id');

  // if (!employeeId) {
  //   return Response.json({ error: 'Missing employee_id' }, { status: 400 });
  // }

  try {
    let query = `SELECT e.*, emp.name as employee_name 
                 FROM availability_exceptions e
                 JOIN employees emp ON e.employee_id = emp.id
                 WHERE 1=1`;
    const params = [];

    if (employeeId) {
      query += ` AND e.employee_id = $${params.length + 1}`;
      params.push(employeeId);
    }

    // Date range filtering
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    if (startDate) {
      query += ` AND e.exception_date >= $${params.length + 1}::date`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND e.exception_date <= $${params.length + 1}::date`;
      params.push(endDate);
    }

    query += ` ORDER BY e.exception_date`;

    const exceptions = await sql(query, params);
    return Response.json(exceptions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: Maak exception aan
export async function POST(request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { employee_id, exception_date, start_time, end_time, is_available, reason } = body;
    console.log('[API] New Exception Request:', { employee_id, exception_date, is_available });

    // TODO: Validation

    const result = await sql`
      INSERT INTO availability_exceptions 
      (employee_id, date, exception_date, start_time, end_time, is_available, reason)
      VALUES (${employee_id}, ${exception_date}, ${exception_date}, ${start_time || null}, ${end_time || null}, ${is_available}, ${reason})
      RETURNING *
    `;
    console.log('[API] Exception Created:', result[0]);
    return Response.json(result[0]);
  } catch (error) {
    console.error('[API] Exception Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Verwijder exception
export async function DELETE(request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

  try {
    await sql`DELETE FROM availability_exceptions WHERE id = ${id}`;
    return Response.json({ message: "Exception deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
