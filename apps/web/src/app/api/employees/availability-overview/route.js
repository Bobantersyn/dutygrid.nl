import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const employees = await sql`
      SELECT 
        e.id,
        e.name,
        e.status,
        e.can_manage_own_availability,
        COUNT(DISTINCT ap.id) as pattern_count,
        COUNT(DISTINCT ae.id) as exception_count,
        MAX(ap.created_at) as last_pattern_update,
        MAX(ae.created_at) as last_exception_update
      FROM employees e
      LEFT JOIN availability_patterns ap ON ap.employee_id = e.id
      LEFT JOIN availability_exceptions ae ON ae.employee_id = e.id
      WHERE e.status = 'active'
      GROUP BY e.id, e.name, e.status, e.can_manage_own_availability
      ORDER BY e.name
    `;

    const overview = employees.map((emp) => {
      const patternCount = parseInt(emp.pattern_count);
      const exceptionCount = parseInt(emp.exception_count);

      // Use DB value (default to false if somehow missing, but schema has it)
      const canEditAvailability = emp.can_manage_own_availability;

      // Type A (can_edit_availability = true): has_pattern if they have at least one pattern
      // Type B (can_edit_availability = false): always has_pattern (default available)
      const hasPattern = canEditAvailability
        ? patternCount > 0
        : true;

      return {
        id: emp.id,
        name: emp.name,
        can_manage_own_availability: canEditAvailability, // Keep frontend prop name for compatibility if needed

        has_pattern: hasPattern,
        has_exceptions: exceptionCount > 0,
        pattern_count: patternCount,
        exception_count: exceptionCount,
        last_updated: emp.last_pattern_update || emp.last_exception_update,
      };
    });

    return Response.json({ overview });
  } catch (error) {
    console.error("Failed to fetch availability overview:", error);
    return Response.json(
      { error: "Failed to fetch availability overview" },
      { status: 500 },
    );
  }
}
