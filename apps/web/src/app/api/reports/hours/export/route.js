import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM

    if (!month) {
        return Response.json({ error: "Month parameter is required" }, { status: 400 });
    }

    try {
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
                name as "Medewerker",
                total_planned_hours as "Geplande Uren",
                total_actual_hours as "Gewerkte Uren",
                (max_hours_per_week * 4.33) as "Contract Uren (Mnd)",
                (total_actual_hours - (max_hours_per_week * 4.33)) as "Overuren (Schatting)"
            FROM employee_hours
            ORDER BY "Medewerker" ASC;
        `;

        // Manual CSV generation to avoid json2csv bundle issues
        const header = "Medewerker,Geplande Uren,Gewerkte Uren,Contract Uren (Mnd),Overuren (Schatting)";
        const rows = report.map(r =>
            `"${r.Medewerker}","${r['Geplande Uren']}","${r['Gewerkte Uren']}","${r['Contract Uren (Mnd)']}","${r['Overuren (Schatting)']}"`
        );
        const csv = [header, ...rows].join("\n");

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="Urenrapportage_${month}.csv"`
            }
        });
    } catch (error) {
        console.error("Export error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
