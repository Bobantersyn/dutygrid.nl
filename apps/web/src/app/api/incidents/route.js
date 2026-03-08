import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";
import { hasFeatureAccess } from "@/utils/feature-flags";

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || 50;
        const employeeId = searchParams.get('employee_id');

        let query = `
            SELECT i.*, 
                   e.name as employee_name,
                   a.name as assignment_name,
                   c.name as client_name
            FROM incidents i
            LEFT JOIN employees e ON i.employee_id = e.id
            LEFT JOIN assignments a ON i.assignment_id = a.id
            LEFT JOIN clients c ON a.client_id = c.id
            WHERE 1=1
        `;
        const values = [];
        let paramIndex = 1;

        if (employeeId) {
            query += ` AND i.employee_id = $${paramIndex}`;
            values.push(employeeId);
            paramIndex++;
        }

        query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex}`;
        values.push(limit);

        const incidents = await sql(query, values);
        return Response.json({ incidents });
    } catch (error) {
        console.error("Error fetching incidents:", error);
        return Response.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Feature Gate Check
        const dbUser = await sql`SELECT subscription_status FROM auth_users WHERE id = ${session.user.id}`;
        const subStatus = dbUser[0]?.subscription_status || 'trialing';

        if (!hasFeatureAccess(subStatus, 'incident_reporting')) {
            return Response.json({ error: "Upgrade vereist voor incidentrapportage." }, { status: 403 });
        }

        const body = await request.json();
        const { assignment_id, employee_id, description, photo_url, date } = body;

        if (!description) {
            return Response.json({ error: "Omschrijving is verplicht" }, { status: 400 });
        }

        const incidentDate = date ? new Date(date) : new Date();

        const [incident] = await sql`
            INSERT INTO incidents (assignment_id, employee_id, description, photo_url, date)
            VALUES (${assignment_id || null}, ${employee_id || null}, ${description}, ${photo_url || null}, ${incidentDate})
            RETURNING *
        `;

        return Response.json({ success: true, incident }, { status: 201 });
    } catch (error) {
        console.error("Error creating incident:", error);
        return Response.json({ error: "Failed to create incident" }, { status: 500 });
    }
}
