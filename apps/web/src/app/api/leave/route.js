import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const employeeIdParam = searchParams.get("employee_id");

        // Get user role
        const userRoleRows = await sql`
      SELECT role, employee_id FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
    `;
        const userRole = userRoleRows[0]?.role;
        const linkedEmployeeId = userRoleRows[0]?.employee_id;

        if (!userRole) {
            return Response.json({ error: "User role not found" }, { status: 403 });
        }

        let query = `
      SELECT lr.*, e.name as employee_name 
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE 1=1
    `;
        const values = [];
        let paramCount = 1;

        // Permissions:
        // - Planners/Admins: Can see all (optionally filtered by employee_id)
        // - Employees: Can ONLY see their own
        if (["planner", "admin"].includes(userRole)) {
            if (employeeIdParam) {
                query += ` AND lr.employee_id = $${paramCount++}`;
                values.push(employeeIdParam);
            }
        } else {
            // Regular employee
            if (!linkedEmployeeId) {
                return Response.json({ error: "No employee linked" }, { status: 403 });
            }
            query += ` AND lr.employee_id = $${paramCount++}`;
            values.push(linkedEmployeeId);
        }

        if (status) {
            query += ` AND lr.status = $${paramCount++}`;
            values.push(status);
        }

        query += ` ORDER BY lr.start_date ASC`;

        const requests = await sql(query, values);
        return Response.json({ requests });

    } catch (error) {
        console.error("Error fetching leave requests:", error);
        return Response.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { start_date, end_date, type, note } = body;

        if (!start_date || !end_date || !type) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get user role
        const userRoleRows = await sql`
      SELECT role, employee_id FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
    `;
        const userRole = userRoleRows[0]?.role;
        const linkedEmployeeId = userRoleRows[0]?.employee_id;

        let targetEmployeeId = linkedEmployeeId;

        // Planner can create request for others
        if (["planner", "admin"].includes(userRole) && body.employee_id) {
            targetEmployeeId = body.employee_id;
        }

        if (!targetEmployeeId) {
            return Response.json({ error: "No target employee identified" }, { status: 400 });
        }

        const [newRequest] = await sql`
      INSERT INTO leave_requests (employee_id, start_date, end_date, type, note, status)
      VALUES (${targetEmployeeId}, ${start_date}, ${end_date}, ${type}, ${note || null}, 'pending')
      RETURNING *
    `;

        // Notify planners (Future enhancement)

        return Response.json({ request: newRequest });

    } catch (error) {
        console.error("Error creating leave request:", error);
        return Response.json({ error: "Failed to create request" }, { status: 500 });
    }
}
