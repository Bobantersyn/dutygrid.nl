import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC 
      LIMIT 20
    `;
        return Response.json(notifications);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { id, markAllRead } = body;

        if (markAllRead) {
            await sql`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE user_id = ${session.user.id} AND is_read = FALSE
      `;
        } else if (id) {
            await sql`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ${id} AND user_id = ${session.user.id}
      `;
        }

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
