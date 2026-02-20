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
        // Query groups by client, assignment, and date
        const billingData = await sql`
            SELECT 
                c.name as "Klant",
                a.name as "Klus/Opdracht",
                TO_CHAR(s.start_time, 'YYYY-MM-DD') as "Datum",
                TO_CHAR(COALESCE(s.actual_start_time, s.start_time), 'HH24:MI') as "Begin Tijd",
                TO_CHAR(COALESCE(s.actual_end_time, s.end_time), 'HH24:MI') as "Eind Tijd",
                COALESCE(s.actual_break_minutes, s.break_minutes) as "Pauze (min)",
                ROUND(CAST(COALESCE(EXTRACT(EPOCH FROM (COALESCE(s.actual_end_time, s.end_time) - COALESCE(s.actual_start_time, s.start_time)))/3600 - COALESCE(s.actual_break_minutes, s.break_minutes)/60.0, 0) AS NUMERIC), 2) as "Netto Uren"
            FROM shifts s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN clients c ON a.client_id = c.id
            WHERE TO_CHAR(s.start_time, 'YYYY-MM') = ${month}
              AND s.status != 'cancelled'
            ORDER BY c.name ASC, a.name ASC, s.start_time ASC;
        `;

        if (!billingData || billingData.length === 0) {
            return new Response("Geen data gevonden voor deze periode", { status: 404 });
        }

        // Generate CSV
        const headers = Object.keys(billingData[0]).join(',');
        const rows = billingData.map(row => {
            return Object.values(row).map(val => {
                // Escape quotes and wrap in quotes if there's a comma
                let cell = val === null ? '' : String(val);
                if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(',');
        });

        const csvContent = [headers, ...rows].join('\n');

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="facturatie_export_${month}.csv"`
            }
        });
    } catch (error) {
        console.error("Error exporting billing data:", error);
        return new Response("Error generating export", { status: 500 });
    }
}
