import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM

    if (!month) {
        return Response.json({ error: "Month parameter is required (YYYY-MM)" }, { status: 400 });
    }

    try {
        // Query groups by client and assignment, calculating the total actual hours worked
        const billingData = await sql`
            WITH shift_hours AS (
                SELECT 
                    a.client_id,
                    c.name as client_name,
                    s.assignment_id,
                    a.location_name as assignment_name,
                    COALESCE(EXTRACT(EPOCH FROM (COALESCE(s.actual_end_time, s.end_time) - COALESCE(s.actual_start_time, s.start_time)))/3600 - COALESCE(s.actual_break_minutes, s.break_minutes)/60.0, 0) as worked_hours,
                    s.id as shift_id
                FROM shifts s
                JOIN assignments a ON s.assignment_id = a.id
                JOIN clients c ON a.client_id = c.id
                WHERE TO_CHAR(s.start_time, 'YYYY-MM') = ${month}
                  AND s.status != 'cancelled'
            ),
            assignment_totals AS (
                SELECT
                    client_id,
                    client_name,
                    assignment_id,
                    assignment_name,
                    SUM(worked_hours) as total_assignment_hours,
                    COUNT(shift_id) as total_shifts
                FROM shift_hours
                GROUP BY client_id, client_name, assignment_id, assignment_name
            ),
            client_totals AS (
                SELECT
                    client_id,
                    client_name,
                    SUM(total_assignment_hours) as total_client_hours,
                    json_agg(
                        json_build_object(
                            'assignment_id', assignment_id,
                            'assignment_name', assignment_name,
                            'total_hours', total_assignment_hours,
                            'total_shifts', total_shifts
                        )
                    ) as assignments
                FROM assignment_totals
                GROUP BY client_id, client_name
            )
            SELECT * FROM client_totals ORDER BY client_name ASC;
        `;

        return Response.json(billingData);
    } catch (error) {
        console.error("Error generating billing report:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
