import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";
import {
  checkRestTimeViolation,
  checkWeeklyHours,
} from "@/app/api/utils/planning-helpers";

// Update shift
export async function PUT(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const userRoleRows = await sql`
      SELECT role FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
    `;
    const userRole = userRoleRows[0]?.role;

    // Only planners and admins can update shifts
    if (!userRole || !["planner", "admin"].includes(userRole)) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { id } = params;
    const {
      employee_id,
      shift_date,
      start_time,
      end_time,
      break_minutes,
      notes,
      assignment_id,
    } = await request.json();

    if (!shift_date || !start_time || !end_time) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Reuse validation logic if needed...
    if (employee_id) {
      // Validate employee exists
      const [employee] =
        await sql`SELECT * FROM employees WHERE id = ${employee_id}`;

      // Perform checks if needed (warnings only)
      // For now we assume planner knows best, as per POST
    }

    const startTimestamp = `${shift_date}T${start_time}:00`;
    let endTimestamp = `${shift_date}T${end_time}:00`;

    // Handle overnight
    if (end_time < start_time) {
      const d = new Date(shift_date);
      d.setDate(d.getDate() + 1);
      endTimestamp = `${d.toISOString().split("T")[0]}T${end_time}:00`;
    }

    // Fetch old shift to compare changes
    const [oldShift] = await sql`SELECT * FROM shifts WHERE id = ${id}`;
    if (!oldShift) return Response.json({ error: "Shift not found" }, { status: 404 });

    // Update query
    const [shift] = await sql`
      UPDATE shifts 
      SET 
        employee_id = ${employee_id || null},
        start_time = ${startTimestamp},
        end_time = ${endTimestamp},
        break_minutes = ${break_minutes || 0},
        notes = ${notes || null},
        assignment_id = ${assignment_id || null}
      WHERE id = ${id}
      RETURNING *
    `;

    // Notification Logic
    import("@/utils/notifications").then(({ notifyEmployee }) => {
      // 1. Employee Changed?
      if (oldShift.employee_id !== shift.employee_id) {
        // Notify Old (Removed)
        if (oldShift.employee_id) {
          notifyEmployee({
            employeeId: oldShift.employee_id,
            type: 'warning',
            title: 'Dienst Vervallen',
            message: `Je bent gehaald van de dienst op ${oldShift.start_time.toISOString().split('T')[0]}.`
          });
        }
        // Notify New (Added)
        if (shift.employee_id) {
          notifyEmployee({
            employeeId: shift.employee_id,
            type: 'info',
            title: 'Nieuwe Dienst',
            message: `Je bent ingepland op ${shift_date}.`,
            link: '/planning'
          });
        }
      }
      // 2. Same Employee, details changed?
      else if (shift.employee_id) {
        // Simple check for time change
        const oldStart = oldShift.start_time.toISOString();
        const newStart = new Date(startTimestamp).toISOString();
        if (oldStart !== newStart) {
          notifyEmployee({
            employeeId: shift.employee_id,
            type: 'info',
            title: 'Dienst Gewijzigd',
            message: `Tijd gewijzigd naar ${start_time} - ${end_time}.`,
            link: '/planning'
          });
        }
      }
    });

    return Response.json({ shift });
  } catch (error) {
    console.error("Error updating shift:", error);
    return Response.json({ error: "Failed to update shift" }, { status: 500 });
  }
}

// Verwijder shift
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const [shift] = await sql`
      DELETE FROM shifts WHERE id = ${id} RETURNING *
    `;

    if (!shift) {
      return Response.json({ error: "Shift not found" }, { status: 404 });
    }

    // Notify if assigned
    if (shift.employee_id) {
      import("@/utils/notifications").then(({ notifyEmployee }) => {
        notifyEmployee({
          employeeId: shift.employee_id,
          type: 'error',
          title: 'Dienst Geannuleerd',
          message: `De dienst op ${shift.start_time.toISOString().split('T')[0]} is geannuleerd.`
        });
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return Response.json({ error: "Failed to delete shift" }, { status: 500 });
  }
}
