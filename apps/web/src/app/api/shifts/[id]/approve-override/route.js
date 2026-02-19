import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

export async function POST(req, { params }) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is planner or admin
    const [userRole] = await sql`
      SELECT role FROM user_roles WHERE user_id = ${session.user.id}
    `;

    if (
      !userRole ||
      (userRole.role !== "planner" && userRole.role !== "admin")
    ) {
      return Response.json(
        { error: "Forbidden - Only planners and admins can approve overrides" },
        { status: 403 },
      );
    }

    const { id } = params;
    const body = await req.json();
    const { note } = body;

    // Update shift with approval
    const [shift] = await sql`
      UPDATE shifts
      SET 
        availability_override_approved = true,
        availability_override_note = ${note || null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!shift) {
      return Response.json({ error: "Shift not found" }, { status: 404 });
    }

    return Response.json(shift);
  } catch (error) {
    console.error("Error approving availability override:", error);
    return Response.json(
      { error: `Update failed: ${error.message}` },
      { status: 500 },
    );
  }
}
