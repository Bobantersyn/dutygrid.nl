import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";
import {
  checkRestTimeViolation,
  checkWeeklyHours,
} from "@/app/api/utils/planning-helpers";
import {
  calculateDistance,
  calculateTravelCosts,
} from "@/app/api/utils/distance";

// Haal shifts op (met optionele filters)
export async function GET(request) {
  try {
    // Check authentication
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const userRoleRows = await sql`
      SELECT role, employee_id FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
    `;
    const userRole = userRoleRows[0]?.role;
    const linkedEmployeeId = userRoleRows[0]?.employee_id;

    if (!userRole) {
      return Response.json(
        { error: "User role not found. Please set up your role." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let query = `SELECT s.id, s.employee_id, TO_CHAR(s.start_time, 'YYYY-MM-DD') as shift_date, 
                 TO_CHAR(s.start_time, 'HH24:MI:SS') as start_time, TO_CHAR(s.end_time, 'HH24:MI:SS') as end_time, 
                 s.break_minutes, s.notes, s.assignment_id,
                 s.availability_override_approved, s.availability_override_note,
                 e.name as employee_name, e.can_manage_own_availability,
                 a.name as location_name, a.address as location_address, c.name as client_name 
                 FROM shifts s 
                 LEFT JOIN employees e ON s.employee_id = e.id 
                 LEFT JOIN assignments a ON s.assignment_id = a.id
                 LEFT JOIN clients c ON a.client_id = c.id
                 WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    // Role-based filtering: beveiligers only see their own shifts
    if (["beveiliger", "beveiliger_extended"].includes(userRole)) {
      if (!linkedEmployeeId) {
        return Response.json(
          { error: "No employee linked to your account" },
          { status: 403 },
        );
      }
      query += ` AND s.employee_id = $${paramCount++}`;
      values.push(linkedEmployeeId);

      // Apply planning visibility limit for beveiligingsmedewerkers
      const visibilityWeeks = 4; // Default to 4 weeks since column doesn't exist
      const today = new Date();
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + visibilityWeeks * 7);
      const maxDateStr = maxDate.toISOString().split("T")[0];

      query += ` AND s.start_time::date <= $${paramCount++}`;
      values.push(maxDateStr);
    }

    if (employeeId) {
      query += ` AND s.employee_id = $${paramCount++}`;
      values.push(employeeId);
    }
    if (startDate) {
      query += ` AND s.start_time::date >= $${paramCount++}`;
      values.push(startDate);
    }
    if (endDate) {
      query += ` AND s.start_time::date <= $${paramCount++}`;
      values.push(endDate);
    }

    query += ` ORDER BY s.start_time ASC`;

    const shifts = await sql(query, values);

    // Add computed employee_name if we have first_name and last_name
    // Flatten structure (employee_name already handled in query)
    const processedShifts = shifts;

    return Response.json({ shifts: processedShifts });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return Response.json({ error: "Failed to fetch shifts" }, { status: 500 });
  }
}

// Maak nieuwe shift aan
export async function POST(request) {
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

    // Only planners and admins can create shifts
    if (!userRole || !["planner", "admin"].includes(userRole)) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const {
      employee_id,
      shift_date,
      start_time,
      end_time,
      break_minutes,
      notes,
      assignment_id,
    } = await request.json();

    // Voor open diensten hoeven we alleen shift_date, start_time en end_time te hebben
    if (!shift_date || !start_time || !end_time) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    /* Shift Type Validation Removed */

    let travelDistanceKm = null;
    let travelCosts = null;

    // Alleen valideren en reiskosten berekenen als employee_id is opgegeven
    if (employee_id) {
      // Bereken shift duur in uren
      const startParts = start_time.split(":");
      const endParts = end_time.split(":");
      const startMinutes =
        parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      let endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

      // Handle overnight shifts
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      const shiftMinutes = endMinutes - startMinutes - (break_minutes || 0);
      const shiftHours = shiftMinutes / 60;

      // Haal medewerker op voor CAO check
      const [employee] =
        await sql`SELECT * FROM employees WHERE id = ${employee_id}`;

      if (!employee) {
        return Response.json({ error: "Employee not found" }, { status: 404 });
      }

      // Check max uren per dag (Non-blocking)
      if (shiftHours > employee.max_hours_per_day) {
        console.warn(`Warning: Shift exceeds daily limit of ${employee.max_hours_per_day} hours`);
      }

      // Check 12-hour rest time rule (Non-blocking)
      const restCheck = await checkRestTimeViolation(
        employee_id,
        shift_date,
        start_time,
        end_time,
      );

      if (!restCheck.valid) {
        console.warn(`Warning: Rest time violation - ${restCheck.violation.message}`);
      }

      // Check max uren per week (Non-blocking)
      const weeklyCheck = await checkWeeklyHours(
        employee_id,
        shift_date,
        employee.max_hours_per_week,
        shiftHours,
      );

      if (!weeklyCheck.valid) {
        console.warn(`Warning: Weekly limit violation`);
      }

      // Calculate travel distance and costs if assignment is provided
      if (assignment_id && employee.home_address) {
        const [assignment] = await sql`
          SELECT location_address FROM assignments WHERE id = ${assignment_id}
        `;

        if (assignment?.location_address) {
          travelDistanceKm = await calculateDistance(
            employee.home_address,
            assignment.location_address,
          );

          if (travelDistanceKm) {
            travelCosts = calculateTravelCosts(travelDistanceKm);
          }
        }
      }
    }

    // Construct timestamps for DB
    const startTimestamp = `${shift_date}T${start_time}:00`;

    // Determine end date (handle overnight)
    // We can infer overnight if end_time < start_time strings, or re-use logic if available.
    // Simple string comparison works for HH:MM usually? No.
    // Let's use Date objects to be safe using the variables from earlier? 
    // Actually, we can just do:
    let endTimestamp = `${shift_date}T${end_time}:00`;
    if (end_time < start_time) {
      const d = new Date(shift_date);
      d.setDate(d.getDate() + 1);
      endTimestamp = `${d.toISOString().split("T")[0]}T${end_time}:00`;
    }

    const [shift] = await sql`
      INSERT INTO shifts (employee_id, start_time, end_time, break_minutes, notes, assignment_id)
      VALUES (${employee_id || null}, ${startTimestamp}, ${endTimestamp}, ${break_minutes || 0}, ${notes || null}, ${assignment_id || null})
      RETURNING *
    `;

    // Notify Employee
    if (employee_id) {
      import("@/utils/notifications").then(({ notifyEmployee }) => {
        notifyEmployee({
          employeeId: employee_id,
          type: 'info',
          title: 'Nieuwe Dienst',
          message: `Je bent ingepland op ${shift_date} van ${start_time} tot ${end_time}.`,
          link: '/planning'
        });
      });
    }

    return Response.json({ shift });
  } catch (error) {
    console.error("Error creating shift:", error);
    return Response.json({ error: "Failed to create shift" }, { status: 500 });
  }
}
