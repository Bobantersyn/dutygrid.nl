
import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await sql`SELECT * FROM system_settings`;

        // Convert array to object for easier access
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return Response.json(settingsMap);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}
