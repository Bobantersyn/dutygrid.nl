import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM

    try {
        let query = `
      SELECT 
        s.id, TO_CHAR(s.start_time, 'YYYY-MM-DD') as date,
        e.name as employee_name, e.hourly_rate,
        a.name as location_name,
        TO_CHAR(s.start_time, 'HH24:MI') as planned_start,
        TO_CHAR(s.end_time, 'HH24:MI') as planned_end,
        s.break_minutes as planned_break,
        TO_CHAR(s.actual_start_time, 'HH24:MI') as actual_start,
        TO_CHAR(s.actual_end_time, 'HH24:MI') as actual_end,
        s.actual_break_minutes as actual_break,
        s.status
      FROM shifts s
      JOIN employees e ON s.employee_id = e.id
      LEFT JOIN assignments a ON s.assignment_id = a.id
      WHERE 1=1
    `;
        const values = [];

        if (month) {
            query += ` AND TO_CHAR(s.start_time, 'YYYY-MM') = $1`;
            values.push(month);
        }

        query += ` ORDER BY s.start_time ASC`;

        const shifts = await sql(query, values);

        // Generate CSV
        const header = "Datum,Medewerker,Locatie,Gepland Start,Gepland Eind,Pauze (min),Werkelijk Start,Werkelijk Eind,Werkelijk Pauze,Status,Uurtarief\n";
        const rows = shifts.map(s => {
            return [
                s.date,
                `"${s.employee_name}"`,
                `"${s.location_name || ''}"`,
                s.planned_start,
                s.planned_end,
                s.planned_break,
                s.actual_start || '',
                s.actual_end || '',
                s.actual_break || '',
                s.status,
                s.hourly_rate || 0
            ].join(",");
        }).join("\n");

        const csv = header + rows;

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="uren-export-${month || 'all'}.csv"`
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
