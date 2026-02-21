import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows =
      await sql`SELECT role, employee_id FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1`;

    if (rows.length === 0) {
      return Response.json({ role: null, employee_id: null });
    }

    let { role, employee_id } = rows[0];

    // Lazy auto-link if no employee_id is set
    if (!employee_id && (role === 'planner' || role === 'admin' || role === 'beveiliger' || role === 'beveiliger_extended')) {
      const { email } = session.user;
      if (email) {
        const [emp] = await sql`SELECT id FROM employees WHERE email = ${email} LIMIT 1`;
        if (emp?.id) {
          employee_id = emp.id;
          await sql`UPDATE user_roles SET employee_id = ${employee_id} WHERE user_id = ${session.user.id}`;
        }
      }
    }

    return Response.json({
      role,
      employee_id,
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role, employee_id } = body;

    if (
      !role ||
      !["beveiliger", "beveiliger_extended", "planner", "admin"].includes(role)
    ) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if role already exists
    const existing =
      await sql`SELECT id FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1`;

    if (existing.length > 0) {
      return Response.json({ error: "Role already set" }, { status: 400 });
    }

    // Insert new role
    await sql`
      INSERT INTO user_roles (user_id, role, employee_id)
      VALUES (${session.user.id}, ${role}, ${employee_id || null})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error setting user role:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
