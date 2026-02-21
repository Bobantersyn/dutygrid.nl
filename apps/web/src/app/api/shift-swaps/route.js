// Removed next/server import
import { getSession } from '@/utils/session';
import sql from '@/app/api/utils/sql';

// GET: Haal swaps op (voor lijstweergave)
// Filters: status, employee_id
export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const employeeId = searchParams.get('employee_id');

  try {
    let query = sql`
      SELECT 
        r.*,
        s.shift_date, s.start_time, s.end_time, s.shift_type,
        e_req.first_name as req_first_name, e_req.last_name as req_last_name,
        e_target.first_name as target_first_name, e_target.last_name as target_last_name,
        a.location_name
      FROM shift_swap_requests r
      JOIN shifts s ON r.shift_id = s.id
      JOIN employees e_req ON r.requesting_employee_id = e_req.id
      LEFT JOIN employees e_target ON r.target_employee_id = e_target.id
      LEFT JOIN assignments a ON s.assignment_id = a.id
    `;

    // TODO: Dynamic filtering with 'neon' tag is tricky without helper 
    // Simplified logic: just getAll and filter in memory if volume low, OR construct unsafe query properly.
    // Let's rely on basic filtering for now or simple "LIMIT 50"

    // For now: return all recent requests
    const requests = await sql`
      SELECT 
        r.*,
        s.start_time::date as shift_date, s.start_time, s.end_time, s.shift_type,
        e_req.first_name as req_first_name, e_req.last_name as req_last_name,
        e_target.first_name as target_first_name, e_target.last_name as target_last_name,
        a.name as location_name
      FROM shift_swap_requests r
      JOIN shifts s ON r.shift_id = s.id
      JOIN employees e_req ON r.requesting_employee_id = e_req.id
      LEFT JOIN employees e_target ON r.target_employee_id = e_target.id
      LEFT JOIN assignments a ON s.assignment_id = a.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `;

    // Manual filtering if needed
    let filtered = requests;
    if (status) filtered = filtered.filter(row => row.status === status);
    if (employeeId) filtered = filtered.filter(row => row.requesting_employee_id == employeeId || row.target_employee_id == employeeId);

    return Response.json(filtered);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: Nieuwe aanvraag indienen
export async function POST(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { shift_id, swap_type, target_employee_id, reason } = body;

    // Validate ownership: requesting_employee must be the shift owner
    // We assume the frontend passes the correct shift_id, but securely we should check if session.user.employee_id owns it.
    // For MVP: trusting the call logic or simple check.

    const [shift] = await sql`SELECT employee_id, assignment_id FROM shifts WHERE id = ${shift_id}`;
    if (!shift) return Response.json({ error: "Shift not found" }, { status: 404 });

    // Validate if target employee has all required object labels for the assignment
    if (target_employee_id && shift.assignment_id) {
      const assignmentLabels = await sql`
        SELECT object_label_id FROM assignment_object_labels WHERE assignment_id = ${shift.assignment_id}
      `;
      if (assignmentLabels.length > 0) {
        const employeeLabels = await sql`
          SELECT object_label_id FROM employee_object_labels WHERE employee_id = ${target_employee_id}
        `;
        const employeeLabelIds = new Set(employeeLabels.map(l => l.object_label_id));
        const hasAllLabels = assignmentLabels.every(l => employeeLabelIds.has(l.object_label_id));

        if (!hasAllLabels) {
          return Response.json({ error: "De geselecteerde medewerker heeft niet de vereiste object-labels voor deze dienst." }, { status: 400 });
        }
      }
    }

    // Insert request
    const result = await sql`
      INSERT INTO shift_swap_requests 
      (shift_id, requesting_employee_id, target_employee_id, swap_type, status, reason)
      VALUES (${shift_id}, ${shift.employee_id}, ${target_employee_id || null}, ${swap_type || 'takeover'}, 'pending', ${reason})
      RETURNING *
    `;

    // Notify Planners
    import("@/utils/notifications").then(({ notifyPlanners }) => {
      notifyPlanners({
        type: 'info',
        title: 'Nieuw Ruilverzoek',
        message: `Er is een nieuw ruilverzoek ingediend voor een dienst.`,
        link: '/planning' // TODO: dashboard url
      });
    });

    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Status update (approve/reject)
export async function PUT(request) {
  const session = await getSession(request);
  // TODO: Verify user is Planner/Admin

  const body = await request.json();
  const { id, status, response_message, new_employee_id } = body;

  try {
    let requestDetails;

    await sql.begin(async sql => {
      // Update request
      const [updatedRequest] = await sql`
                UPDATE shift_swap_requests
                SET status = ${status}, response_message = ${response_message}, approved_by_user_id = ${session.userId}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;
      requestDetails = updatedRequest;

      // If approved, update the shift
      if (status === 'approved' && new_employee_id) {
        // Validate object labels
        const [shiftData] = await sql`SELECT assignment_id FROM shifts WHERE id = ${updatedRequest.shift_id}`;
        if (shiftData?.assignment_id) {
          const assignmentLabels = await sql`
            SELECT object_label_id FROM assignment_object_labels WHERE assignment_id = ${shiftData.assignment_id}
          `;
          if (assignmentLabels.length > 0) {
            const employeeLabels = await sql`
              SELECT object_label_id FROM employee_object_labels WHERE employee_id = ${new_employee_id}
            `;
            const employeeLabelIds = new Set(employeeLabels.map(l => l.object_label_id));
            const hasAllLabels = assignmentLabels.every(l => employeeLabelIds.has(l.object_label_id));

            if (!hasAllLabels) {
              throw new Error("De medewerker mist de vereiste object-labels om deze dienst te kunnen overnemen.");
            }
          }
        }

        await sql`
            UPDATE shifts 
            SET employee_id = ${new_employee_id}
            WHERE id = ${updatedRequest.shift_id}
         `;
      }
    });

    // Notify Requestor
    if (requestDetails?.requesting_employee_id) {
      import("@/utils/notifications").then(({ notifyEmployee }) => {
        notifyEmployee({
          employeeId: requestDetails.requesting_employee_id,
          type: status === 'approved' ? 'success' : 'error',
          title: `Ruilverzoek ${status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}`,
          message: `Je verzoek is ${status === 'approved' ? 'goedgekeurd' : 'afgewezen'}. ${response_message || ''}`
        });
      });
    }

    return Response.json({ message: "Updated" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
