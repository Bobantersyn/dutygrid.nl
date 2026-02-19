import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";
import { detectPlanningGaps } from "../utils/planning-helpers.js";

export async function GET(request) {
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

    // Only planners and admins can see gaps
    if (!userRole || !["planner", "admin"].includes(userRole)) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const startDate =
      url.searchParams.get("start_date") ||
      new Date().toISOString().split("T")[0];
    const endDateParam = url.searchParams.get("end_date");

    let endDate;
    if (endDateParam) {
      endDate = endDateParam;
    } else {
      // Default to 7 days from start
      const end = new Date(startDate);
      end.setDate(end.getDate() + 6);
      endDate = end.toISOString().split("T")[0];
    }

    const gaps = await detectPlanningGaps(startDate, endDate);

    return Response.json({ gaps, start_date: startDate, end_date: endDate });
  } catch (error) {
    console.error("Error detecting gaps:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
