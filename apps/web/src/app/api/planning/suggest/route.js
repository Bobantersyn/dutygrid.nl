import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!date || !start || !end) {
        return Response.json({ error: "Missing date, start, or end parameters" }, { status: 400 });
    }

    try {
        const dayOfWeek = new Date(date).getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Find available employees:
        // 1. Active employees
        // 2. Who have an availability pattern OR an exception for this day that is_available = true.
        // 3. Who DO NOT have a shift that overlaps with the requested time.
        // 4. Who DO NOT have an exception on this day that is_available = false.

        const suggestions = await sql`
            WITH overlapping_shifts AS (
                SELECT employee_id 
                FROM shifts 
                WHERE 
                    TO_CHAR(start_time, 'YYYY-MM-DD') = ${date}
                    AND status != 'cancelled'
                    AND (
                        (CAST(${start} AS TIME) >= CAST(start_time AS TIME) AND CAST(${start} AS TIME) < CAST(end_time AS TIME))
                        OR
                        (CAST(${end} AS TIME) > CAST(start_time AS TIME) AND CAST(${end} AS TIME) <= CAST(end_time AS TIME))
                        OR
                        (CAST(${start} AS TIME) <= CAST(start_time AS TIME) AND CAST(${end} AS TIME) >= CAST(end_time AS TIME))
                    )
            ),
            unavailable_exceptions AS (
                SELECT employee_id
                FROM availability_exceptions
                WHERE date = CAST(${date} AS DATE) AND is_available = FALSE
            )
            SELECT e.id, e.name, e.max_hours_per_week, e.status
            FROM employees e
            LEFT JOIN overlapping_shifts os ON e.id = os.employee_id
            LEFT JOIN unavailable_exceptions ue ON e.id = ue.employee_id
            WHERE e.status = 'active'
              AND os.employee_id IS NULL -- no overlapping shift
              AND ue.employee_id IS NULL -- no forced unavailable day
             ORDER BY e.name ASC
             LIMIT 5;
        `;

        return Response.json({ suggestions });
    } catch (error) {
        console.error("Suggestion error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
