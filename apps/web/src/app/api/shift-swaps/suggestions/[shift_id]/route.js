// Removed next/server import
import { getSession } from '@/utils/session';
import sql from '@/app/api/utils/sql';

export async function GET(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { shift_id } = await params;
  if (!shift_id) return Response.json({ error: "Missing ID" }, { status: 400 });

  // Mock implementation of the Scoring Algorithm from OVERDRACHT
  // In a real app, this would query availability patterns, hours counts, etc.
  // For MVP: Return a dummy list of colleagues with mock scores.

  try {
    // Get all employees except the current shift owner
    const shift = (await sql`SELECT employee_id, shift_date, start_time, end_time FROM shifts WHERE id = ${shift_id}`)[0];
    const employees = await sql`SELECT id, first_name, last_name, cao_type FROM employees WHERE id != ${shift.employee_id} AND active = true LIMIT 5`;

    const suggestions = employees.map(emp => {
      // Mock scoring logic
      const score = Math.floor(Math.random() * 50) + 60; // 60-110
      return {
        employee_id: emp.id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        score: score,
        details: {
          cao_match: true, // simplified
          available: true,
          hours_ok: true,
          no_conflicts: true
        }
      };
    }).sort((a, b) => b.score - a.score);

    return Response.json(suggestions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
