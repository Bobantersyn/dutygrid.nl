import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ count: 0 });

    try {
        const result = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${session.user.id} AND is_read = FALSE
    `;
        return Response.json({ count: parseInt(result[0].count) });
    } catch (error) {
        return Response.json({ count: 0 });
    }
}
