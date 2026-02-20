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
        // Query groups by employee, calculates total planned and actual duration for the month
        // Also fetches employee CAO settings
        const report = await sql`
            WITH employee_hours AS (
                SELECT 
                    e.id as employee_id,
                    e.name,
                    e.max_hours_per_week,
                    e.hourly_rate,
                    COALESCE(SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600), 0) as total_planned_hours,
                    COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(s.actual_end_time, s.end_time) - COALESCE(s.actual_start_time, s.start_time)))/3600 - COALESCE(s.actual_break_minutes, s.break_minutes)/60.0), 0) as total_actual_hours
                FROM employees e
                LEFT JOIN shifts s ON e.id = s.employee_id 
                    AND TO_CHAR(s.start_time, 'YYYY-MM') = ${month}
                    AND s.status != 'cancelled'
                GROUP BY e.id, e.name, e.max_hours_per_week, e.hourly_rate
            )
            SELECT 
                *,
                (max_hours_per_week * 4.33) as expected_monthly_hours, -- rough estimate of weeks in a month
                (total_actual_hours - (max_hours_per_week * 4.33)) as overtime_hours
            FROM employee_hours
            ORDER BY name ASC;
        `;

        return Response.json(report);
    } catch (error) {
        console.error("Error generating hours report:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
